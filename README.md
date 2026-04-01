# Jani AI - Local Setup Guide

Follow these steps to run Jani AI locally on your PC using VS Code.

## 1. Prerequisites
- Install **Node.js** (v18 or higher) from [nodejs.org](https://nodejs.org/).
- Install **Visual Studio Code** from [code.visualstudio.com](https://code.visualstudio.com/).

## 2. Get the Code
1. In the AI Studio interface, go to the **Settings** (gear icon) or the **Export** menu.
2. Select **Export to ZIP** or **Download Project**.
3. Extract the ZIP file to a folder on your PC.

## 3. Open in VS Code
1. Open VS Code.
2. Go to **File > Open Folder...** and select the extracted folder.

## 4. Install Dependencies
1. Open the terminal in VS Code (`Ctrl + ` ` or **Terminal > New Terminal**).
2. Run the following command:
   ```bash
   npm install
   ```

## 5. Set Up Environment Variables
1. Create a file named `.env` in the root directory.
2. Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *(You can get a key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))*

## 6. Run the App
1. In the VS Code terminal, run:
   ```bash
   npm run dev
   ```
2. The terminal will show a link like `http://localhost:3000`.
3. Open this link in **Chrome** or **Edge**.

## 7. Enable Voice
- When the app opens, click anywhere on the screen.
- Ensure you allow **Microphone** access when prompted.

## 8. Install as App
- In Chrome/Edge, click the **Install** icon in the address bar to have Jani AI as a standalone desktop app.
