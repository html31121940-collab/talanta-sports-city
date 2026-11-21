"use strict";

const { getAccessToken, getDarajaBaseUrl } = require("./daraja");

function getNairobiTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

function getMerchantConfig() {
  const businessShortCode = String(process.env.DARAJA_SHORTCODE || "").trim();
  const tillNumber = String(process.env.DARAJA_TILL_NUMBER || "").trim();
  const passkey = process.env.DARAJA_PASSKEY;
  const callbackUrl = process.env.DARAJA_CALLBACK_URL;

  if (!businessShortCode || !/^\d{5,8}$/.test(businessShortCode)) {
    throw new Error("DARAJA_SHORTCODE must be the approved Go-Live Store/Head Office shortcode");
  }
  if (!tillNumber || !/^\d{5,8}$/.test(tillNumber)) {
    throw new Error("DARAJA_TILL_NUMBER must be the customer-facing Buy Goods Till number");
  }
  if (!passkey) throw new Error("DARAJA_PASSKEY is not configured");
  if (!callbackUrl || !callbackUrl.startsWith("https://")) {
    throw new Error("DARAJA_CALLBACK_URL must be a public HTTPS URL");
  }

  return { businessShortCode, tillNumber, passkey, callbackUrl };
}

async function darajaPost(endpoint, payload) {
  const token = await getAccessToken();
  const response = await fetch(`${getDarajaBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000)
  });

  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Daraja returned a non-JSON response (HTTP ${response.status})`); }
  if (!response.ok) {
    throw new Error(data.errorMessage || data.ResponseDescription || data.error_description || `Daraja API failed (HTTP ${response.status})`);
  }
  return data;
}

async function initiateSTKPush({ phone, amount, reference, description }) {
  const merchant = getMerchantConfig();
  const timestamp = getNairobiTimestamp();
  const password = Buffer.from(
    merchant.businessShortCode + merchant.passkey + timestamp
  ).toString("base64");

  const payload = {
    BusinessShortCode: merchant.businessShortCode,
    Password: password,
    Timestamp: timestamp,TransactionType: process.env.DARAJA_ENV === "sandbox"
  ? "CustomerPayBillOnline"
  : "CustomerBuyGoodsOnline",
    Amount: Number(amount),
    PartyA: String(phone),
    PartyB: process.env.DARAJA_ENV === "sandbox"
  ? merchant.businessShortCode
  : merchant.tillNumber,
    PhoneNumber: String(phone),
    CallBackURL: merchant.callbackUrl,
    AccountReference: String(reference).slice(0, 12),
    TransactionDesc: String(description || "Talanta ticket payment").slice(0, 13)
  };

  const data = await darajaPost("/mpesa/stkpush/v1/processrequest", payload);
  if (String(data.ResponseCode) !== "0" || !data.CheckoutRequestID) {
    throw new Error(data.errorMessage || data.ResponseDescription || "Daraja did not accept the STK Push request");
  }
  return data;
}

async function querySTKPush(checkoutRequestId) {
  const merchant = getMerchantConfig();
  const timestamp = getNairobiTimestamp();
  const password = Buffer.from(
    merchant.businessShortCode + merchant.passkey + timestamp
  ).toString("base64");

  return darajaPost("/mpesa/stkpushquery/v1/query", {
    BusinessShortCode: merchant.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: String(checkoutRequestId)
  });
}

module.exports = { initiateSTKPush, querySTKPush, getMerchantConfig };
