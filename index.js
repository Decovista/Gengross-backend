const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Step 1: Parse JSON from env variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  // Convert private key to real newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  console.log("✅ Service account credentials loaded.");
} catch (err) {
  console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT:", err.message);
  process.exit(1);
}

// Step 2: Setup auth
let auth;
try {
  auth = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  console.log("✅ Google JWT client created.");
} catch (err) {
  console.error("❌ Error creating Google JWT client:", err.message);
  process.exit(1);
}

// Step 3: Verify authentication
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

// Step 4: Google Sheets API setup
const spreadsheetId = process.env.SPREADSHEET_ID;
if (!spreadsheetId) {
  console.error("❌ Missing required environment variable: SPREADSHEET_ID");
  process.exit(1);
}
const sheets = google.sheets({ version: "v4", auth });
const sheetName = "Sheet1";

// Step 5: Define your routes here
app.get("/", (req, res) => {
  res.send("Google Sheets API is connected!");
});

// Step 6: Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
