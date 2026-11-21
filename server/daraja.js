"use strict";

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const ENVIRONMENT = (process.env.DARAJA_ENV || "sandbox").trim().toLowerCase();
const BASE_URLS = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke"
};

if (!Object.prototype.hasOwnProperty.call(BASE_URLS, ENVIRONMENT)) {
  throw new Error("DARAJA_ENV must be either sandbox or production");
}

let cachedToken = null;
let tokenExpiresAt = 0;
let tokenPromise = null;

function getDarajaBaseUrl() {
  return BASE_URLS[ENVIRONMENT];
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) return cachedToken;  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("Daraja Consumer Key or Consumer Secret is not configured");
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const response = await fetch(
      `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` },
        signal: AbortSignal.timeout(15000)
      }
    );

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { throw new Error(`Daraja OAuth returned non-JSON response (HTTP ${response.status})`); }
    if (!response.ok || !data.access_token) {
      throw new Error(data.errorMessage || data.error_description || `Daraja authentication failed (HTTP ${response.status})`);
    }

    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    return cachedToken;
  })();

  try { return await tokenPromise; }
  finally { tokenPromise = null; }
}

module.exports = { getAccessToken, getDarajaBaseUrl, ENVIRONMENT };
