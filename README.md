
# Meeting Summarizer

A full-stack web application that uses the Google Gemini API to transcribe meeting audio files and generate a concise summary and a list of action items.

 <!-- Suggestion: Replace with a screenshot of the app -->

---

## Evaluation Focus

This project was built with a focus on the following criteria:

*   **Transcription & Summary Quality:** The application leverages the `gemini-2.5-flash` model, which provides powerful audio transcription and language understanding capabilities to ensure high-quality outputs.
*   **LLM Prompt Effectiveness:** To ensure reliable and structured output from the AI, the application prompts the Gemini model to return a JSON object containing the transcript, summary, and an array of action items. This avoids fragile text-parsing and results in a more robust system.
*   **Code Structure:** The project is organized into a clean monorepo-style structure with two distinct parts:
    *   `backend/`: A Node.js and Express server responsible for handling file uploads and communicating with the Gemini API.
    *   `frontend/`: A modern React and TypeScript application built with Vite that provides a responsive and user-friendly interface.

---

## Features

*   **AI-Powered Transcription & Summarization:** Utilizes the Google Gemini API for audio processing.
*   **Structured Output:** Intelligently separates the response into a summary and a distinct list of action items.
*   **Modern UI:** A clean, responsive, and intuitive user interface built with React and Bootstrap.
*   **Easy File Uploads:** Simple interface for selecting and uploading audio files.
*   **Copy to Clipboard:** Convenient one-click buttons to copy the summary or transcript.

---

## Technical Stack

*   **Backend:** Node.js, Express.js, Google Generative AI SDK
*   **Frontend:** React, TypeScript, Vite, Bootstrap
*   **AI Model:** Google Gemini 1.5 Flash

---

## Setup and Installation

To run this project locally, follow these steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (comes with Node.js)

### 1. Backend Setup

First, navigate to the backend directory and set up your environment variables.

```bash
# Navigate to the backend folder
cd meeting-summarizer/backend

# Install dependencies
npm install
```

Next, create a `.env` file in the `meeting-summarizer/backend` directory and add your Google Gemini API key:

```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 2. Frontend Setup

In a separate terminal, navigate to the frontend directory.

```bash
# Navigate to the frontend folder
cd meeting-summarizer/frontend

# Install dependencies
npm install
```

### 3. Running the Application

1.  **Start the Backend Server:**
    ```bash
    # In the /backend directory
    node index.js
    # The server will start on http://localhost:3001
    ```

2.  **Start the Frontend Application:**
    ```bash
    # In the /frontend directory
    npm run dev
    # The application will be available at http://localhost:5173 (or another port if 5173 is busy)
    ```

3.  **Open your browser** and navigate to the frontend URL to use the application.

