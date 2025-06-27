require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const { SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT } = process.env;

let parsedCredentials;

try {
  parsedCredentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT JSON:", error.message);
  process.exit(1);
}

const jwtClient = new google.auth.JWT(
  parsedCredentials.client_email,
  null,
  parsedCredentials.private_key.replace(/\\n/g, '\n'),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth: jwtClient });

// === Contact Form Handler ===
app.post("/api/contact", async (req, res) => {
  const {
    name,
    email,
    phone,
    product,
    location,
    other_location,
    preferred_time,
    quantity,
  } = req.body;

  const finalLocation = location === "Other" ? other_location : location;

  const values = [
    [
      name,
      email,
      phone,
      product,
      finalLocation,
      preferred_time,
      quantity,
      new Date().toLocaleString(),
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    res.status(200).json({ success: true, message: " Contact saved successfully." });
  } catch (error) {
    console.error(" Google Sheets Error:", error.response?.data || error.message);
    res.status(500).json({ error: " Failed to save contact data." });
  }
});

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});
