require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Parse the service account from a single environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Fix private key formatting
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Authenticate with Google Sheets API
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

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

  try {
    const values = [
      [
        name,
        email,
        phone,
        product,
        location === "Other" ? other_location : location,
        preferred_time,
        quantity,
        new Date().toLocaleString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    res.status(200).json({ success: true, message: "Data added to sheet." });
  } catch (error) {
    console.error("Error appending data to Google Sheet:", error);
    res.status(500).json({ error: "Failed to store data in Google Sheet." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
