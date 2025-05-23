const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const credentials = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),  // important to fix newline chars
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

const spreadsheetId = process.env.SPREADSHEET_ID;
if (!spreadsheetId) {
  console.error("❌ Missing required environment variable: SPREADSHEET_ID");
  process.exit(1);
} else {
  console.log("✅ SPREADSHEET_ID loaded from environment.");
}

let auth;
try {
  auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  console.log("✅ Google JWT client created.");
} catch (err) {
  console.error("❌ Error creating Google JWT client:", err.message);
  process.exit(1);
}

async function verifyGoogleAuth() {
  try {
    const token = await auth.getAccessToken();
    if (!token) throw new Error("Empty access token");
    console.log("✅ Google JWT auth token acquired.");
  } catch (error) {
    console.error("❌ Failed to acquire Google auth token:", error.message);
    process.exit(1);
  }
}

verifyGoogleAuth();

const sheets = google.sheets({ version: "v4", auth });
const sheetName = "Sheet1";



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
