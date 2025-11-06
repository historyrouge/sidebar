# 🎓 ScholarSage - The AI-Powered Learning Ecosystem

ScholarSage is a next-generation study application designed to transform how students learn, collaborate, and master new subjects. By integrating a powerful suite of AI-driven tools into a single, intuitive platform, ScholarSage helps you study smarter, not harder.

![ScholarSage Dashboard](https://placehold.co/800x400.png?text=ScholarSage+App+Screenshot)

---

## ✨ Key Features

- **🧠 AI Content Analysis**: Paste any text, upload a document, or use your camera to get an instant AI-powered analysis, including summaries, key concepts, and potential questions.
- **📚 Multi-Format Study Sessions**: Create study sessions from text, images (with OCR), `.txt` files, PDFs, and even YouTube video transcripts.
- **📇 Smart Flashcards**: Automatically generate flashcards from your study material, complete with a Spaced Repetition System (SRS) to maximize retention.
- **❓ Intelligent Quizzes**: Generate custom quizzes with various question types (MCQ, True/False, etc.) and get instant feedback.
- **🤖 AI Tutor**: Engage in a conversational chat with an AI tutor that has context on your study material to help you understand complex topics.
- **🗺️ Mind Maps**: Visualize complex information with AI-generated mind maps.
- **✍️ AI Editor & Playground**: Use the AI Editor for writing assistance or the Playground for a split-screen chat and canvas experience.
- **🌐 Integrated Resources**: Features a built-in web browser, news reader, and eBook library to keep all your study tools in one place.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 18, shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: Zustand
- **AI/ML**: Google Genkit, SambaNova, Qwen
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Desktop App**: Electron (Optional, for enhanced features)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd ScholarSage
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project and add your Firebase and AI service API keys. Refer to `.env.example` if available.

```bash
# .env
FIREBASE_SERVICE_ACCOUNT="..."
SAMBANOVA_API_KEY="..."
SAMBANOVA_BASE_URL="..."
# Add other keys as needed
```

### 3. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Running with Electron (Optional)

The project includes an optional Electron wrapper for enhanced desktop features like the Web Agent.

1.  **Start the Next.js App** (if not already running):
    ```bash
    npm run dev
    ```

2.  **Start the Electron App**:
    In a separate terminal, start the Electron process.

    ```bash
    npm run electron
    ```

This will open a native desktop window loading your local development server.

---

## 📂 Project Structure

Here's a brief overview of the key directories:

```
.
├── /src
│   ├── /app          # Next.js App Router pages and layouts
│   ├── /ai           # AI-related code (Genkit flows, tools)
│   ├── /components   # Reusable React components
│   ├── /hooks        # Custom React hooks (e.g., useAuth)
│   ├── /lib          # Utility functions, Firebase config, types
│   └── /styles       # Global CSS and Tailwind config
├── /docs             # Project documentation and design files
├── /electron         # Electron-specific files (main process, preloads)
└── README.md         # You are here!
```

---

## 🤝 Contributing

We welcome contributions! If you have suggestions or want to improve the app, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
