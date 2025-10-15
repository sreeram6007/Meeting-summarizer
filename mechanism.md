
# How It Works: A Technical Deep Dive

This document provides a detailed, end-to-end explanation of the Meeting Summarizer's inner workings, from user interaction in the browser to the AI processing on the server.

---

### Overall Architecture

The application is a classic client-server model:

1.  **Frontend (Client):** A React application running in the user's browser that provides the user interface (UI) for uploading files and displaying results.
2.  **Backend (Server):** A Node.js/Express server that acts as the bridge between the frontend and the Google Gemini API. It handles the business logic of processing the audio and calling the AI.
3.  **Communication:** The frontend and backend communicate via a simple REST API. The frontend sends the audio file to the backend, and the backend returns the processed transcript and summary.

---

## Frontend Workflow (`src/App.tsx`)

The entire user interface is managed within a single React component.

1.  **State Management:** The `App` component uses `useState` hooks to manage the application's state:
    *   `file`: Stores the audio file selected by the user.
    *   `transcript`, `summary`, `actionItems`: Store the data returned from the backend.
    *   `loading`, `error`: Control the UI during the API call (e.g., showing a spinner or an error message).

2.  **File Selection:**
    *   When you select a file in the browser, the `<input type="file">` element's `onChange` event triggers the `handleFileChange` function.
    *   This function updates the `file` state with the selected audio file object.

3.  **Sending the Request (`handleSubmit`):**
    *   Clicking the "Generate Summary" button calls the `handleSubmit` function.
    *   It first creates a `FormData` object. This is a standard browser API for packaging form fields (including files) to be sent over HTTP.
    *   The audio file is appended to the `FormData` object under the key `'audio'`.
    *   The `axios.post` library is used to send this data to the backend's `/api/summarize` endpoint with a `Content-Type` of `multipart/form-data`.

4.  **Rendering the Response:**
    *   After the backend successfully processes the audio, it sends back a JSON object: `{ transcript: "...", summary: "..." }`.
    *   The frontend receives this object. It then does a bit of its own processing to split the `summary` string (which contains both the summary and action items) into two distinct pieces for separate display.
    *   React's conditional rendering is used to display the results. The `result-card` elements for the summary, action items, and transcript only appear on the screen once the `loading` state is `false` and the `summary` or `transcript` state contains data.

5.  **Copy to Clipboard:**
    *   The "Copy" buttons use the browser's built-in `navigator.clipboard.writeText()` API to easily copy the content of the transcript or summary to the user's clipboard.

---

## Backend Workflow (`backend/index.js`)

The backend is the core processing engine.

1.  **Server Setup:**
    *   An `express` server is created to listen for incoming HTTP requests.
    *   `cors` middleware is used to allow the frontend (running on a different port) to make requests to the backend without being blocked by browser security policies.
    *   `multer` is a crucial middleware for handling file uploads. We configure it with `multer.memoryStorage()`, which tells it to hold the uploaded audio file in memory as a `Buffer` object, rather than saving it to disk.

2.  **The API Endpoint (`POST /api/summarize`):**
    *   This is the only endpoint in the application. The `upload.single('audio')` part is the `multer` middleware at work. It looks for a file in the `FormData` with the key `'audio'`, processes it, and attaches its information (including the in-memory buffer) to the `req` object as `req.file`.

3.  **Preparing Data for Gemini:**
    *   The Gemini API cannot directly accept a raw file buffer. It needs the file data to be provided as a base64-encoded string with a specified MIME type.
    *   The `fileToGenerativePart` helper function handles this conversion. It takes the `req.file.buffer` and `req.file.mimetype` and formats them into the object structure the Gemini SDK requires.

4.  **Prompt Engineering & Calling Gemini:**
    *   This is the most critical step. We don't just send the audio; we send it along with a carefully crafted prompt.
    *   **The Prompt:** `"First, transcribe the entire audio. Then, create a summary of the transcription. Finally, list the key action items. Return the result as a single JSON object with three keys: 'transcript' (a string), 'summary' (a string), and 'actionItems' (an array of strings)."`
    *   This prompt instructs the AI to act as a JSON API, which is far more reliable than asking for plain text and trying to parse it later.
    *   The `model.generateContent()` function is called with an array containing both the text prompt and the base64-encoded audio file part.

5.  **Processing and Responding:**
    *   The Gemini model returns its response, which should be a string containing the JSON we asked for.
    *   **Cleaning:** Sometimes, the model might wrap its JSON output in markdown fences (e.g., ` ```json ... ``` `). The code includes a `replace()` call to strip these characters just in case, ensuring we have a clean JSON string.
    *   `JSON.parse()` is used to convert the clean string into a usable JavaScript object.
    *   The `transcript`, `summary`, and `actionItems` are extracted from the object.
    *   The `summary` and `actionItems` are combined into a single formatted string to be sent to the frontend.
    *   Finally, `res.json()` sends the `transcript` and the combined `summaryAndActions` back to the frontend, completing the cycle.

---

## End-to-End Data Flow

```
[User's Browser]      [Backend Server]           [Google Gemini API]
      |                     |                          |
      |---(1. Upload File)-->|                          |
      |                     |---(2. Format & Prompt)-->|
      |                     |                          |<--(3. Process Audio/Text)
      |                     |<--(4. Return JSON String)-|
      |<--(6. Send Result)---|                          |
      |                     |---(5. Parse & Format)----|
      |
[7. Display Results]
```
