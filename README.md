
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
