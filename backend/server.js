import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb" }));

const PORT = 8000;

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Retry wrapper for rate limits
async function callWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    console.log("AI ERROR:", err.message);

    if (err.status === 429 && retries > 0) {
      console.log("Retrying in 2 seconds…");
      await new Promise(res => setTimeout(res, 2000));
      return callWithRetry(fn, retries - 1);
    }

    throw err;
  }
}

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("SmartBin+ Backend Running!");
});

/* ============================================================
   TEXT CLASSIFICATION
============================================================ */

app.post("/api/classify", async (req, res) => {
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: "Label is required" });
  }

  try {
    const ai = await callWithRetry(() =>
      client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You classify waste items into: recycle, trash, compost, hazardous."
          },
          {
            role: "user",
            content: `Classify this item: "${label}". Return JSON with:
            {
              "itemName": "",
              "bin": "",
              "co2Saved": 0,
              "points": 0
            }`
          }
        ]
      })
    );

    const parsed = JSON.parse(ai.choices[0].message.content);

    res.json({ success: true, data: parsed });

  } catch (err) {
    res.status(500).json({
      error: "Text classification failed",
      details: err.message
    });
  }
});

/* ============================================================
   IMAGE CLASSIFICATION (FINAL WORKING VERSION)
============================================================ */

app.post("/api/classify-image", async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const ai = await callWithRetry(() =>
      client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },  // PURE JSON OUTPUT
        messages: [
          {
            role: "system",
            content:
              "You analyze photos of waste and classify them into recycle, trash, compost, or hazardous."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the waste item and output JSON only." },
              { type: "input_image", image_url: { url: image } }
            ]
          }
        ]
      })
    );

    const parsed = JSON.parse(ai.choices[0].message.content);

    res.json({ success: true, data: parsed });

  } catch (err) {
    res.status(500).json({
      error: "Image classification failed",
      details: err.message
    });
  }
});

/* ============================================================
   START SERVER
============================================================ */

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log("SmartBin+ backend running with full AI integration!");
});
