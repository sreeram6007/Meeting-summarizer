
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Converts a file buffer to a Gemini-compatible File object
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// API Endpoint for summarization
app.post('/api/summarize', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const audioFilePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);

    const prompt = "First, transcribe the entire audio. Then, create a summary of the transcription. Finally, list the key action items. Return the result as a single JSON object with three keys: 'transcript' (a string), 'summary' (a string), and 'actionItems' (an array of strings).";

    const result = await model.generateContent([prompt, audioFilePart]);
    const response = await result.response;
    const text = response.text();

    // Clean the response and parse the JSON
    // The model sometimes wraps the JSON in ```json ... ``` or just ```
    const cleanedText = text.replace(/^```json\n/, '').replace(/\n```$/, '').replace(/^```/, '').replace(/```$/, '');
    const parsedJson = JSON.parse(cleanedText);

    const transcript = parsedJson.transcript || "Transcript not available.";
    const summary = parsedJson.summary || "Summary not available.";
    const actionItems = parsedJson.actionItems || [];

    // Combine summary and action items for the frontend
    let summaryAndActions = summary;
    if (actionItems.length > 0) {
        summaryAndActions += `\n\nAction Items:\n- ${actionItems.join('\n- ')}`;
    }

    res.json({
      transcript: transcript,
      summary: summaryAndActions,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
