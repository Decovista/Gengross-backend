require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// === Google Sheets Auth ===
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.split("\\n").join("\n");
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.SPREADSHEET_ID;
const contactSheetName = "Sheet1";

app.use(cors());
app.use(bodyParser.json());

// === Location API using OpenCage ===
app.post("/api/location", async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and Longitude are required." });
  }

  try {
    const apiKey = process.env.OPENCAGE_API_KEY;

    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
    );

    const results = response.data.results;
    let city = "Unknown";

    if (results.length > 0) {
      const components = results[0].components;
      city =
        components.city ||
        components.town ||
        components.village ||
        components.state ||
        "Unknown";
    }

    const values = [
      [
        "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A",
        new Date().toLocaleString(),
        city,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${contactSheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    res.status(200).json({ success: true, message: "Location stored successfully", city });
  } catch (error) {
    console.error("OpenCage geocoding error:", error.message);
    res.status(500).json({ error: "Failed to store location." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
