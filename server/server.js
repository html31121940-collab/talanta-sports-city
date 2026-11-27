
"use strict";

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");

dotenv.config({ path: path.join(__dirname, ".env") });

const { pool, testConnection } = require("./db");
const { initiateSTKPush, querySTKPush } = require("./stkpush");
const { ENVIRONMENT } = require("./daraja");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const CALLBACK_TOKEN = String(process.env.DARAJA_CALLBACK_TOKEN || process.env.CALLBACK_TOKEN || "");
const PAYMENT_OPS_TOKEN = String(process.env.PAYMENT_OPS_TOKEN || "");

const MAX_QUANTITY = 10;
const MAX_ORDER_AMOUNT = 750000;
const CALLBACK_LOCK_SECONDS = 120;
const MAX_CALLBACK_ATTEMPTS = 12;

const requestWindows = new Map();

app.disable("x-powered-by");



// Allow the local Talanta frontend to access the backend.
const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:5500"
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-Payment-Token"
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});





app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));

  return left.length === right.length &&
    left.length > 0 &&
    crypto.timingSafeEqual(left, right);
}

function normalizeKenyanPhone(value) {
  let phone = String(value || "").replace(/[\s()+-]/g, "");

  if (/^0[17]\d{8}$/.test(phone)) {
    phone = "254" + phone.slice(1);
  } else if (/^[17]\d{8}$/.test(phone)) {
    phone = "254" + phone;
  }

  return /^254[17]\d{8}$/.test(phone) ? phone : null;
}

function rateLimit({ windowMs = 6 * 60 * 1000, maxRequests = 4 } = {}) {
  return function (req, res, next) {
    const now = Date.now();
    const key = String(req.ip || req.socket.remoteAddress || "unknown");
    let entry = requestWindows.get(key);

    if (!entry || now - entry.start >= windowMs) {
      entry = { start: now, count: 0 };
      requestWindows.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait and try again."
      });
    }

    next();
  };
}

setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of requestWindows) {
    if (now - entry.start > 120000) {
      requestWindows.delete(key);
    }
  }
}, 60000).unref();

function calculateOrder(body) {
  const quantity = Number(body.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new Error("Quantity must be between 1 and 10.");
  }

  let itemType;
  let itemCode;
  let unitPrice;

  const ticketType = String(body.ticketType || "").trim().toUpperCase();
  const sectionId = String(body.sectionId || "").trim().toUpperCase();
  const hospitalityType = String(body.hospitalityType || "").trim().toUpperCase();

  if (ticketType === "SECTION") {
    if (/^1(0[1-9]|1[0-9]|2[0-8])$/.test(sectionId)) {
      unitPrice = 2500;
    } else if (/^2(0[1-9]|1[0-9]|20)$/.test(sectionId)) {
      unitPrice = 5000;
    } else if (/^4(0[1-9]|[12][0-9]|3[0-5])$/.test(sectionId)) {
      unitPrice = 15000;
    } else {
      throw new Error("Invalid ticket section.");
    }

    itemType = "SECTION";
    itemCode = sectionId;
  } else if (ticketType === "HOSPITALITY") {
    const prices = {
      GOLD: 20000,
      PLATINUM: 35000,
      SKYBOX: 75000
    };

    if (!Object.prototype.hasOwnProperty.call(prices, hospitalityType)) {
      throw new Error("Invalid hospitality package.");
    }

    itemType = "HOSPITALITY";
    itemCode = hospitalityType;
    unitPrice = prices[hospitalityType];
  } else {
    throw new Error("Invalid ticket type.");
  }

  const totalAmount = unitPrice * quantity;

  if (!Number.isSafeInteger(totalAmount) ||
      totalAmount < 1 ||
      totalAmount > MAX_ORDER_AMOUNT) {
    throw new Error("Order amount is outside the permitted range.");
  }

  return {
    itemType,
    itemCode,
    unitPrice,
    quantity,
    totalAmount
  };
}

function makeTicketCode() {
  return "TSC-" + crypto.randomBytes(12).toString("hex").toUpperCase();
}

function makeOrderId() {
  return crypto.randomUUID();
}

function makeAccountReference() {
  return "TSC" + crypto.randomBytes(8).toString("hex").toUpperCase();
}

function callbackTokenValid(req) {
  if (!CALLBACK_TOKEN) return false;

  const supplied = req.query.token ||
    req.get("x-callback-token") ||
    "";

  return safeEqual(supplied, CALLBACK_TOKEN);
}

function paymentTokenValid(supplied, storedHash) {
  if (!supplied || !storedHash) return false;

  return safeEqual(sha256(supplied), storedHash);
}

function callbackMetadata(callbackPayload) {
  const items = callbackPayload?.Body?.stkCallback?.CallbackMetadata?.Item;

  const result = {};

  if (!Array.isArray(items)) return result;

  for (const item of items) {
    if (item && typeof item.Name === "string") {
      result[item.Name] = item.Value;
    }
  }

  return result;
}

function retryDelaySeconds(attempt) {
  const delays = [5, 15, 30, 60, 120, 300];
  return delays[Math.min(Math.max(attempt - 1, 0), delays.length - 1)];
}

function logError(context, error) {
  console.error("[Talanta]", context, error?.message || error);
}


async function scheduleCallbackRetry(callbackId, attempt, errorMessage) {
  const message = String(errorMessage || "Temporary callback processing failure").slice(0, 1000);

  if (attempt >= MAX_CALLBACK_ATTEMPTS) {
    await pool.execute(
      `UPDATE mpesa_callbacks
       SET processing_status = 'FAILED',
           locked_until = NULL,
           next_attempt_at = NULL,
           last_error = ?
       WHERE id = ? AND processing_status = 'PROCESSING'`,
      [message, callbackId]
    );

    return;
  }

  const delay = retryDelaySeconds(attempt);

  await pool.execute(
    `UPDATE mpesa_callbacks
     SET processing_status = 'RECEIVED',
         locked_until = NULL,
         next_attempt_at = DATE_ADD(NOW(), INTERVAL ? SECOND),
         last_error = ?
     WHERE id = ? AND processing_status = 'PROCESSING'`,
    [delay, message, callbackId]
  );
}

async function markOrderForVerification(checkoutRequestId, reason) {
  await pool.execute(
    `UPDATE ticket_orders
     SET payment_status = 'PENDING_VERIFICATION'
     WHERE checkout_request_id = ?
       AND payment_status NOT IN ('SUCCESS', 'FAILED')`,
    [checkoutRequestId]
  );

  logError("Payment requires manual verification", reason);
}

async function processCallback(callbackId) {
  const [claim] = await pool.execute(
    `UPDATE mpesa_callbacks
     SET processing_status = 'PROCESSING',
         locked_until = DATE_ADD(NOW(), INTERVAL ? SECOND),
         attempt_count = attempt_count + 1,
         last_error = NULL
     WHERE id = ?
       AND (
         (
           processing_status = 'RECEIVED'
           AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
         )
         OR
         (
           processing_status = 'PROCESSING'
           AND locked_until IS NOT NULL
           AND locked_until < NOW()
         )
       )`,
    [CALLBACK_LOCK_SECONDS, callbackId]
  );

  if (!claim.affectedRows) return;

  const [callbackRows] = await pool.execute(
    `SELECT *
     FROM mpesa_callbacks
     WHERE id = ?
     LIMIT 1`,
    [callbackId]
  );

  if (!callbackRows.length) return;

  const callback = callbackRows[0];
  const checkoutRequestId = String(callback.checkout_request_id || "");
  const attempt = Number(callback.attempt_count) || 1;

  try {
    const [orders] = await pool.execute(
      `SELECT *
       FROM ticket_orders
       WHERE checkout_request_id = ?
       LIMIT 1`,
      [checkoutRequestId]
    );

    if (!orders.length) {
      await scheduleCallbackRetry(
        callbackId,
        attempt,
        "No matching order found yet for this CheckoutRequestID."
      );
      return;
    }

    const order = orders[0];

    if (Number(callback.result_code) !== 0) {
      await pool.execute(
        `UPDATE ticket_orders
         SET payment_status = 'FAILED'
         WHERE order_id = ?
           AND payment_status <> 'SUCCESS'`,
        [order.order_id]
      );

      await pool.execute(
        `UPDATE mpesa_callbacks
         SET processing_status = 'PROCESSED',
             processed_at = NOW(),
             locked_until = NULL,
             next_attempt_at = NULL,
             last_error = NULL
         WHERE id = ? AND processing_status = 'PROCESSING'`,
        [callbackId]
      );

      return;
    }

    const payload = typeof callback.callback_payload === "string"
      ? JSON.parse(callback.callback_payload)
      : callback.callback_payload;

    const metadata = callbackMetadata(payload);
    const paidAmount = Number(metadata.Amount);
    const paidPhone = normalizeKenyanPhone(metadata.PhoneNumber);
    const receipt = String(metadata.MpesaReceiptNumber || "").trim();

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount !== Number(order.total_amount) ||
      !paidPhone ||
      paidPhone !== normalizeKenyanPhone(order.customer_phone) ||
      !receipt
    ) {
      await markOrderForVerification(
        checkoutRequestId,
        "Callback amount, phone number or M-PESA receipt did not match the order."
      );

      await pool.execute(
        `UPDATE mpesa_callbacks
         SET processing_status = 'FAILED',
             locked_until = NULL,
             next_attempt_at = NULL,
             last_error = ?
         WHERE id = ? AND processing_status = 'PROCESSING'`,
        ["Callback metadata failed payment validation.", callbackId]
      );

      return;
    }

    const queryResult = await querySTKPush(checkoutRequestId);

    if (
      String(queryResult.ResultCode) !== "0" ||
      String(queryResult.ResponseCode) !== "0"
    ) {
      await markOrderForVerification(
        checkoutRequestId,
        "Daraja STK query has not independently confirmed successful payment."
      );

      await scheduleCallbackRetry(
        callbackId,
        attempt,
        "Daraja STK query has not confirmed success yet."
      );

      return;
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [lockedOrders] = await connection.execute(
        `SELECT *
         FROM ticket_orders
         WHERE order_id = ?
         FOR UPDATE`,
        [order.order_id]
      );

      if (!lockedOrders.length) {
        throw new Error("Order disappeared during payment finalization.");
      }

      const lockedOrder = lockedOrders[0];

      if (Number(lockedOrder.total_amount) !== paidAmount) {
        throw new Error("Order amount changed before ticket issuance.");
      }

      if (
        normalizeKenyanPhone(lockedOrder.customer_phone) !== paidPhone
      ) {
        throw new Error("Order phone number changed before ticket issuance.");
      }

      if (
        lockedOrder.mpesa_receipt_number &&
        lockedOrder.mpesa_receipt_number !== receipt
      ) {
        throw new Error("Order already has a different M-PESA receipt.");
      }

      const [receiptOwners] = await connection.execute(
        `SELECT order_id
         FROM ticket_orders
         WHERE mpesa_receipt_number = ?
           AND order_id <> ?
         LIMIT 1`,
        [receipt, lockedOrder.order_id]
      );

      if (receiptOwners.length) {
        throw new Error("M-PESA receipt is already linked to another order.");
      }

      const [existingTickets] = await connection.execute(
        `SELECT id
         FROM issued_tickets
         WHERE order_id = ?
         ORDER BY id ASC
         FOR UPDATE`,
        [lockedOrder.order_id]
      );

      if (existingTickets.length > Number(lockedOrder.quantity)) {
        throw new Error("Issued ticket count exceeds the order quantity.");
      }

      await connection.execute(
        `UPDATE ticket_orders
         SET payment_status = 'SUCCESS',
             mpesa_receipt_number = ?,
             paid_at = COALESCE(paid_at, NOW())
         WHERE order_id = ?`,
        [receipt, lockedOrder.order_id]
      );

      const missingTickets =
        Number(lockedOrder.quantity) - existingTickets.length;

      for (let i = 0; i < missingTickets; i += 1) {
        await connection.execute(
          `INSERT INTO issued_tickets
           (ticket_code, order_id, customer_phone, item_code, ticket_status)
           VALUES (?, ?, ?, ?, 'VALID')`,
          [
            makeTicketCode(),
            lockedOrder.order_id,
            lockedOrder.customer_phone,
            lockedOrder.item_code
          ]
        );
      }

      await connection.execute(
        `UPDATE mpesa_callbacks
         SET processing_status = 'PROCESSED',
             processed_at = NOW(),
             locked_until = NULL,
             next_attempt_at = NULL,
             last_error = NULL
         WHERE id = ?`,
        [callbackId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logError("Callback processing failed", error);

    if (
      /already linked to another order|different M-PESA receipt|exceeds the order quantity|did not match/i
        .test(String(error.message))
    ) {
      await markOrderForVerification(checkoutRequestId, error.message);

      await pool.execute(
        `UPDATE mpesa_callbacks
         SET processing_status = 'FAILED',
             locked_until = NULL,
             next_attempt_at = NULL,
             last_error = ?
         WHERE id = ? AND processing_status = 'PROCESSING'`,
        [String(error.message).slice(0, 1000), callbackId]
      );

      return;
    }

    await scheduleCallbackRetry(callbackId, attempt, error.message);
  }
}

let callbackWorkerRunning = false;

async function processReceivedCallbacks() {
  if (callbackWorkerRunning) return;

  callbackWorkerRunning = true;

  try {
    const [rows] = await pool.execute(
      `SELECT id
       FROM mpesa_callbacks
       WHERE (
         processing_status = 'RECEIVED'
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
       )
       OR (
         processing_status = 'PROCESSING'
         AND locked_until IS NOT NULL
         AND locked_until < NOW()
       )
       ORDER BY created_at ASC
       LIMIT 50`
    );

    for (const row of rows) {
      await processCallback(row.id);
    }
  } catch (error) {
    logError("Callback recovery worker failed", error);
  } finally {
    callbackWorkerRunning = false;
  }
}


// Prevent direct access to backend files through the public website.
app.use("/server", (req, res) => {
  res.sendStatus(404);
});

app.get("/api/health", async (req, res) => {
  try {
    const database = await testConnection();

    res.json({
      success: true,
      status: "healthy",
      environment: ENVIRONMENT,
      gateway: "https://api.safaricom.co.ke",
      database: "connected",
      databaseName: database.database_name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError("Health check failed", error);

    res.status(503).json({
      success: false,
      status: "unhealthy",
      environment: ENVIRONMENT,
      database: "unavailable"
    });
  }
});

// Create a new payment order and initiate the production STK Push.
app.post(
  "/api/payment/stkpush",
  rateLimit({ windowMs: 60000, maxRequests: 5 }),
  async (req, res) => {
    let orderId;
    let accessToken;
    let orderCreated = false;
    let darajaResult = null;

    try {
      const phone = normalizeKenyanPhone(req.body.phone);

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid Kenyan M-PESA phone number."
        });
      }

      const order = calculateOrder(req.body);

      orderId = makeOrderId();
      accessToken = crypto.randomBytes(32).toString("hex");

      const accountReference = makeAccountReference();

      await pool.execute(
        `INSERT INTO ticket_orders (
          order_id,
          account_reference,
          customer_phone,
          item_type,
          item_code,
          unit_price,
          quantity,
          total_amount,
          payment_status,
          payment_token_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INITIATING', ?)`,
        [
          orderId,
          accountReference,
          phone,
          order.itemType,
          order.itemCode,
          order.unitPrice,
          order.quantity,
          order.totalAmount,
          sha256(accessToken)
        ]
      );

      orderCreated = true;

      // Any uncertain result after this point must not be treated
      // as proof that Safaricom rejected the payment request.
      darajaResult = await initiateSTKPush({
        phone,
        amount: order.totalAmount,
        reference: accountReference,
        description: "Talanta ticket payment"
      });

      if (
        String(darajaResult.ResponseCode) !== "0" ||
        !darajaResult.CheckoutRequestID
      ) {
        throw new Error("Daraja did not return a confirmed STK request.");
      }

      await pool.execute(
        `UPDATE ticket_orders
         SET checkout_request_id = ?,
             merchant_request_id = ?,
             payment_status = 'PENDING'
         WHERE order_id = ?`,
        [
          darajaResult.CheckoutRequestID,
          darajaResult.MerchantRequestID || null,
          orderId
        ]
      );

      return res.status(200).json({
        success: true,
        orderId,
        accessToken,
        checkoutRequestId: darajaResult.CheckoutRequestID,
        merchantRequestId: darajaResult.MerchantRequestID || null,
        amount: order.totalAmount,
        status: "PENDING",
        message: "STK Push request accepted. Check your phone."
      });
    } catch (error) {
      logError("STK Push initiation outcome requires review", error);

      if (!orderCreated) {
        return res.status(400).json({
          success: false,
          message: error.message || "Unable to create payment order."
        });
      }

      // Preserve any checkout identifiers received before a database
      // update failed. Never falsely mark an uncertain payment as FAILED.
      try {
        await pool.execute(
          `UPDATE ticket_orders
           SET checkout_request_id = COALESCE(?, checkout_request_id),
               merchant_request_id = COALESCE(?, merchant_request_id),
               payment_status = 'PENDING_VERIFICATION'
           WHERE order_id = ?
             AND payment_status <> 'SUCCESS'`,
          [
            darajaResult?.CheckoutRequestID || null,
            darajaResult?.MerchantRequestID || null,
            orderId
          ]
        );
      } catch (databaseError) {
        logError("Could not update uncertain payment order", databaseError);
      }

      return res.status(202).json({
        success: true,
        ambiguous: true,
        orderId,
        accessToken,
        checkoutRequestId: darajaResult?.CheckoutRequestID || null,
        amount: darajaResult ? undefined : undefined,
        status: "PENDING_VERIFICATION",
        message: "Your payment request outcome is uncertain. Do not submit another payment yet. Contact support using your order reference."
      });
    }
  }
);

// A customer must prove possession of the one-time order access token.
app.get(
  "/api/payment/status/:orderId",
  rateLimit({ windowMs: 60000, maxRequests: 60 }),
  async (req, res) => {
    try {
      const orderId = String(req.params.orderId || "");
      const suppliedToken = req.get("X-Payment-Token");

      if (!/^[0-9a-f-]{36}$/i.test(orderId) || !suppliedToken) {
        return res.status(404).json({
          success: false,
          message: "Payment order not found."
        });
      }

      const [orders] = await pool.execute(
        `SELECT order_id, customer_phone, item_type, item_code,
                quantity, total_amount, payment_status,
                mpesa_receipt_number, payment_token_hash
         FROM ticket_orders
         WHERE order_id = ?
         LIMIT 1`,
        [orderId]
      );

      if (
        !orders.length ||
        !paymentTokenValid(suppliedToken, orders[0].payment_token_hash)
      ) {
        return res.status(404).json({
          success: false,
          message: "Payment order not found."
        });
      }

      const order = orders[0];

      let tickets = [];

      if (order.payment_status === "SUCCESS") {
        const [ticketRows] = await pool.execute(
          `SELECT ticket_code AS ticketCode,
                  item_code AS itemCode,
                  ticket_status AS ticketStatus
           FROM issued_tickets
           WHERE order_id = ?
           ORDER BY id ASC`,
          [orderId]
        );

        tickets = ticketRows;
      }

      return res.json({
        success: true,
        orderId: order.order_id,
        status: order.payment_status,
        itemType: order.item_type,
        itemCode: order.item_code,
        quantity: Number(order.quantity),
        amount: Number(order.total_amount),
        mpesaReceiptNumber: order.mpesa_receipt_number,
        tickets
      });
    } catch (error) {
      logError("Payment status lookup failed", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve payment status."
      });
    }
  }
);

// Safaricom callback endpoint.
app.post(
  "/api/payment/callback",
  rateLimit({ windowMs: 60000, maxRequests: 120 }),
  async (req, res) => {
    if (!callbackTokenValid(req)) {
      return res.status(403).json({
        ResultCode: 1,
        ResultDesc: "Unauthorized callback."
      });
    }

    const stkCallback = req.body?.Body?.stkCallback;
    const checkoutRequestId = String(stkCallback?.CheckoutRequestID || "");

    if (!stkCallback || !checkoutRequestId || checkoutRequestId.length > 128) {
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: "Invalid callback payload."
      });
    }

    const resultCode = Number.isInteger(Number(stkCallback.ResultCode))
      ? Number(stkCallback.ResultCode)
      : null;

    let callbackId;

    try {
      try {
        const [insertResult] = await pool.execute(
          `INSERT INTO mpesa_callbacks (
            checkout_request_id,
            merchant_request_id,
            result_code,
            result_description,
            callback_payload,
            processing_status,
            attempt_count
          ) VALUES (?, ?, ?, ?, ?, 'RECEIVED', 0)`,
          [
            checkoutRequestId,
            stkCallback.MerchantRequestID || null,
            resultCode,
            String(stkCallback.ResultDesc || "").slice(0, 255),
            JSON.stringify(req.body)
          ]
        );

        callbackId = insertResult.insertId;
      } catch (insertError) {
        if (insertError.code !== "ER_DUP_ENTRY") {
          throw insertError;
        }

        const [existing] = await pool.execute(
          `SELECT id, result_code, processing_status
           FROM mpesa_callbacks
           WHERE checkout_request_id = ?
           LIMIT 1`,
          [checkoutRequestId]
        );

        if (!existing.length) throw insertError;

        callbackId = existing[0].id;

        // Safaricom may deliver duplicate callbacks. A later success
        // callback must replace an earlier failure for the same checkout,
        // while a success must not be overwritten by a later failure replay.
        if (
          resultCode === 0 &&
          Number(existing[0].result_code) !== 0
        ) {
          await pool.execute(
            `UPDATE mpesa_callbacks
             SET merchant_request_id = ?,
                 result_code = ?,
                 result_description = ?,
                 callback_payload = ?,
                 processing_status = 'RECEIVED',
                 attempt_count = 0,
                 next_attempt_at = NULL,
                 locked_until = NULL,
                 last_error = NULL
             WHERE id = ?`,
            [
              stkCallback.MerchantRequestID || null,
              resultCode,
              String(stkCallback.ResultDesc || "").slice(0, 255),
              JSON.stringify(req.body),
              callbackId
            ]
          );
        }
      }

      // Acknowledge only after the callback has been durably stored.
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Callback received successfully."
      });

      setImmediate(() => {
        processCallback(callbackId).catch(error => {
          logError("Asynchronous callback processing failed", error);
        });
      });
    } catch (error) {
      logError("Callback storage failed", error);

      return res.status(500).json({
        ResultCode: 1,
        ResultDesc: "Callback could not be stored."
      });
    }
  }
);

// Private operational overview. Configure PAYMENT_OPS_TOKEN to enable it.
app.get("/api/payment/ops", async (req, res) => {
  if (!PAYMENT_OPS_TOKEN ||
      !safeEqual(req.get("X-Ops-Token"), PAYMENT_OPS_TOKEN)) {
    return res.sendStatus(404);
  }

  try {
    const [orders] = await pool.execute(
      `SELECT payment_status, COUNT(*) AS total
       FROM ticket_orders
       GROUP BY payment_status`
    );

    const [callbacks] = await pool.execute(
      `SELECT processing_status, COUNT(*) AS total
       FROM mpesa_callbacks
       GROUP BY processing_status`
    );

    res.json({
      success: true,
      environment: ENVIRONMENT,
      orders,
      callbacks
    });
  } catch (error) {
    logError("Operations overview failed", error);
    res.status(500).json({ success: false });
  }
});



app.use((req, res) => {
  res.status(404).send("Not found");
});

let recoveryInterval;
let server;

async function startServer() {
  if (ENVIRONMENT !== "production") {
    throw new Error("Production mode is required. Set DARAJA_ENV=production.");
  }

  if (!CALLBACK_TOKEN) {
    throw new Error("CALLBACK_TOKEN must be configured before startup.");
  }

  await testConnection();

  server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Talanta Sports City backend is running.");
    console.log("Environment: PRODUCTION");
    console.log("Gateway: https://api.safaricom.co.ke");
    console.log("Port:", PORT);
  });

  recoveryInterval = setInterval(processReceivedCallbacks, 15000);
  recoveryInterval.unref();

  await processReceivedCallbacks();
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down safely.`);

  if (recoveryInterval) clearInterval(recoveryInterval);

  if (server) {
    await new Promise(resolve => server.close(resolve));
  }

  try {
    await pool.end();
  } catch (error) {
    logError("Database shutdown failed", error);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async error => {
  logError("Backend startup failed", error);

  try {
    await pool.end();
  } catch (_) {}

  process.exit(1);
});


