# Web Scraper Chat

A web scraping application built with TypeScript that extracts data from multiple websites and presents it in a ChatGPT-like interface without using any AI services.

## Features

- **Multi-website scraping**: Extract content from any website by URL
- **Wikipedia search**: Search and extract information from Wikipedia articles
- **ChatGPT-like interface**: Clean, conversational UI for displaying scraped content
- **Source attribution**: Source cards showing which websites the data came from with original links
- **Conversation history**: Keep track of previous searches and scrapes
- **Responsive design**: Modern dark theme with mobile-friendly layout

## Tech Stack

- **Frontend**: TypeScript, HTML5, CSS3, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Scraping**: Axios, Cheerio
- **Styling**: Custom CSS with design system

## Design System

- **Colors**: 
  - Primary: #3B82F6 (vibrant blue)
  - Background: #0F172A (deep slate)
  - Surface: #1E293B (dark slate)
  - Text: #F8FAFC (light)
  - Accent: #64748B (slate grey)
  - Success: #10B981 (emerald)

- **Typography**: 
  - Inter font for UI elements
  - JetBrains Mono for URLs and code

- **Theme**: Dark mode primary with modern chat interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-scraper-chat
```

2. Install dependencies:
```bash
npm install
```

3. Compile the TypeScript:
```bash
npx tsc --project tsconfig.scraper.json
```

4. Start the application:
```bash
./start.sh
```

This will start both the backend server (port 5000) and frontend development server (port 3006 or next available).

### Production Build

```bash
npm run build
npm start
```

## Usage

The application is currently running and accessible at:
- **Frontend**: http://localhost:3006
- **Backend API**: http://localhost:5000

### Scraping Websites

1. Enter a website URL in the "Website URL" field
2. Click "Scrape Website" or press Enter
3. The application will extract content and display it in a chat-like format

### Searching Wikipedia

1. Enter a search query in the "Search Query" field
2. Click "Search Wikipedia" or press Enter
3. The application will search Wikipedia and display relevant articles

### Chat Interface

- Use the main chat input at the bottom to ask questions or paste URLs
- The application automatically detects URLs and scrapes them
- For text queries, it searches Wikipedia
- View conversation history in the sidebar
- Click on history items to repeat previous searches

### Example Queries

Try these example queries in the chat interface:

- **"Who is the PM of India?"** → Returns information about Narendra Modi
- **"Tell me about Newton's Laws of Motion"** → Returns physics information
- **"What is electrochemistry?"** → Returns chemistry information
- **Paste any website URL** → Scrapes and displays the content

## API Endpoints

### POST /api/scrape
Scrape content from a website.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "title": "Page Title",
  "content": "Extracted content...",
  "url": "https://example.com",
  "summary": "First 200 characters...",
  "images": ["image1.jpg", "image2.jpg"]
}
```

### POST /api/search
Search Wikipedia for information.

**Request:**
```json
{
  "query": "search term"
}
```

**Response:**
```json
[
  {
    "title": "Article Title",
    "content": "Article content...",
    "url": "https://en.wikipedia.org/wiki/Article",
    "summary": "Search snippet...",
    "source": "Wikipedia"
  }
]
```

## Examples

Try these example queries:

- "Who is the PM of India?" → Returns information about Narendra Modi
- "Tell me about Newton's Laws of Motion" → Returns physics information
- "What is electrochemistry?" → Returns chemistry information
- Paste any website URL → Scrapes and displays the content

## Architecture

```
src/
├── server.ts          # Express server setup
├── scraper.ts         # Web scraping logic
├── main.ts           # Frontend application
└── styles.css        # Styling and design system
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Security Notes

- The application respects robots.txt and implements rate limiting
- User-Agent headers are set to identify the scraper
- No sensitive data is stored or transmitted
- All scraping is done client-side with proper error handling