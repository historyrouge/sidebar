# Web Scraper Application

A modern web scraping application built with TypeScript and Next.js that extracts data from multiple websites and presents it in a ChatGPT-like interface.

## Features

### 🚀 Core Functionality
- **Multi-website scraping**: Automatically finds and scrapes content from multiple relevant websites
- **Smart content extraction**: Intelligently extracts relevant information based on user queries
- **ChatGPT-like interface**: Clean, conversational UI with message bubbles and source attribution
- **Real-time search**: No need to enter URLs - just ask questions naturally

### 🎨 User Interface
- **Modern dark theme**: Sleek design with deep slate backgrounds and vibrant blue accents
- **Responsive design**: Works perfectly on desktop and mobile devices
- **Source cards**: Clear attribution showing which websites provided the information
- **Chat history**: Sidebar showing recent searches for easy access
- **Loading states**: Smooth animations and loading indicators

### 🔍 Smart Search Examples
The application can handle natural language queries like:

- **"Who is the PM of India?"** → Finds information about Narendra Modi
- **"Tell me about Newton's laws of motion"** → Scrapes physics content from multiple sources
- **"What is electrochemistry?"** → Extracts chemistry information from educational sites
- **"Hi, how are you?"** → Provides a friendly greeting response

### 🛠️ Technical Features
- **TypeScript**: Full type safety and better development experience
- **Next.js 15**: Latest React framework with App Router
- **Cheerio**: Server-side HTML parsing for content extraction
- **Axios**: HTTP client for web requests
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives

## How It Works

1. **User Input**: User asks a question in natural language
2. **Website Discovery**: System searches for relevant websites using DuckDuckGo API
3. **Content Scraping**: Scrapes multiple websites simultaneously
4. **Content Processing**: Extracts relevant information based on the query
5. **Answer Generation**: Combines information from multiple sources
6. **Source Attribution**: Shows which websites provided the information

## API Endpoints

### POST `/api/scrape`
Scrapes websites and returns comprehensive answers.

**Request Body:**
```json
{
  "query": "Who is the PM of India?",
  "urls": ["https://example.com"] // Optional: specific URLs to scrape
}
```

**Response:**
```json
{
  "answer": "Based on information from 3 sources:\n\nNarendra Modi is the current Prime Minister of India...",
  "sources": [
    {
      "title": "Narendra Modi - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Narendra_Modi",
      "summary": "Narendra Damodardas Modi is an Indian politician...",
      "content": "Relevant extracted content...",
      "images": ["https://example.com/image.jpg"]
    }
  ],
  "query": "Who is the PM of India?"
}
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to `http://localhost:3000/web-scraper`

## Usage

1. **Navigate to Web Scraper**: Click the "Web Scraper" tab in the main navigation
2. **Ask Questions**: Type your question in the input field
3. **Get Answers**: Receive comprehensive answers with source attribution
4. **Explore Sources**: Click on source cards to visit original websites
5. **View History**: Check the sidebar for recent searches

## Styling

The application uses a modern dark theme with:
- **Primary Color**: `#3B82F6` (vibrant blue)
- **Background**: `#0F172A` (deep slate)
- **Surface**: `#1E293B` (dark slate)
- **Text**: `#F8FAFC` (light)
- **Accent**: `#64748B` (slate grey)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.