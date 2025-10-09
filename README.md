
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running with Electron Web Search

This project includes an optional Electron wrapper to enable advanced web search features without API keys.

### How it Works

The Electron app loads the Next.js development server in a `BrowserWindow`. It uses a `<webview>` tag to open Google search results in a sandboxed environment. A script is then injected into the webview to extract search results from the DOM and send them back to the React application to be displayed in the chat.

### How to Run Locally

1.  **Start the Next.js App:**
    First, get the web application running.

    ```bash
    npm install
    npm run dev
    ```

2.  **Start the Electron App:**
    In a separate terminal, install Electron dependencies and start the Electron process.

    ```bash
    # Make sure you are in the root directory
    npm install electron electron-is-dev
    npx electron electron/main.js
    ```

    A new application window will open, loading your Next.js app from `http://localhost:3000`. You can now use the integrated web search feature.

### How to Build for Production

1.  **Build the Next.js App:**
    Create a static export of your Next.js application.

    ```bash
    npm run build
    # You may need to configure next.config.js for static output: output: 'export'
    ```

2.  **Package the Electron App:**
    Use a tool like `electron-builder` or `electron-packager` to create a distributable application for your target platform (Windows, macOS, Linux).

    ```bash
    npm install --save-dev electron-builder
    # Configure electron-builder in your package.json or a config file
    npx electron-builder
    ```
    
    *TODO: Add detailed `electron-builder` configuration to `package.json`.*

### Security & Privacy Note

The web search feature operates entirely on your local machine. The Electron app reads the content of the Google search page you are viewing to mirror the results into the chat interface. No data is sent to external servers, and no API keys are required or exposed.

# Google-AI-Agent (Electron + Next)

This patch adds a simple Electron + Next integration that automates Google AI interactions inside a `webview` and mirrors the AI's reply (and cited sources) into the app chat.

> ⚠️ Legal & ethics: This automation controls UI inside the user's local browser session. It requires the user to be signed-in to Google inside the mini-browser. This is fragile and may conflict with Google terms — include a user consent prompt and use official APIs for production.

## Files
- `electron/main.js` — basic Electron main that loads the Next dev server and enables `webviewTag`.
- `electron/preload.js` — exposes a tiny `electronAPI` to the renderer.
- `electron/preload-webview.js` — injected into the guest (webview) page; it exposes `window.__celestial.receiveMessage(msg)` so the host can send commands like `send-query`. When responses appear, it forwards `{answerHtml, answerText, sources}` to host via `ipcRenderer.sendToHost('gai-response', payload)`.
- `web/components/GoogleAIAgent.tsx` — React component (client) that shows a chat UI, opens the webview, sends the user query to the webview and renders the response cards.
- `web/utils/googleAI-extract.js` — small extraction helper for fallback.

## How to run (dev)
1. Start your Next dev server: `npm run dev` (assumes it serves at http://localhost:3000).
2. Start Electron: `node electron/main.js` or add a script in package.json:
   ```json
   "scripts": {
     "electron": "electron ."
   }
   ```
3. Open the app, go to the component that renders `GoogleAIAgent`, and test.

## Notes / Troubleshooting

* If extraction returns nothing, open the guest webview devtools and inspect the DOM. The Google AI page DOM changes often; update selectors in `preload-webview.js` accordingly.
* If the guest API is not present, the renderer falls back to injecting a helper script; this is less reliable.
* For production packaging, make sure to copy `preload-webview.js` into the packaged electron assets and update `preload` path.

## TODO

* Add an explicit UI that instructs the user to sign into Google inside the mini-browser.
* Improve selectors for Google AI page (Bard / ai.google) for more robust extraction.
* Add rate-limiting debounce and UX improvements (skeleton loading, errors, retry buttons).
