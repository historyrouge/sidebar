# Multi-Website Scraper Chat

A web scraping application with a ChatGPT-like interface that extracts data from multiple websites including Wikipedia, educational sites, and news sources.

## Features

- **Multi-Website Scraping**: Extracts content from Wikipedia, educational websites, and news sources
- **ChatGPT-like Interface**: Clean, modern chat interface for asking questions and receiving answers
- **Source Attribution**: Shows source cards with links to original websites
- **Conversation History**: Maintains chat history with ability to create new conversations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern dark mode interface with vibrant blue accents

## How It Works

1. **User asks a question** → Bot analyzes the query
2. **Scrapes multiple websites** → Wikipedia, Britannica, educational sites, news sources
3. **Extracts text content** → Parses HTML and cleans it
4. **Returns answer** → Shows scraped content with source links

## Example Questions

- "Who is the Prime Minister of India?"
- "Tell me about Newton's Laws of Motion"
- "What is electrochemistry?"
- "Explain quantum computing"
- "Who is the founder of SpaceX?"

## Technology Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Build Tool**: Vite
- **Web Scraping**: Axios, Cheerio (DOM parsing)
- **Styling**: Custom CSS with CSS variables for theming
- **Fonts**: Inter (UI), JetBrains Mono (code/URLs)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`

## Usage

1. **Ask Questions**: Type your question in the input field at the bottom
2. **View Sources**: Each answer includes source cards showing where the information came from
3. **Chat History**: Use the sidebar to navigate between different conversations
4. **New Chat**: Click "New Chat" to start a fresh conversation

## Architecture

### Core Components

- **ChatInterface**: Main UI controller managing chat interactions
- **ChatService**: Business logic for processing queries and managing conversations
- **WikipediaScraper**: Specialized scraper for Wikipedia content
- **GeneralWebScraper**: General-purpose web scraper for other websites

### Data Flow

1. User input → ChatInterface
2. ChatInterface → ChatService.processQuery()
3. ChatService → WikipediaScraper + GeneralWebScraper
4. Scrapers → Extract content from websites
5. ChatService → Generate response from scraped content
6. ChatInterface → Display response with sources

## Features in Detail

### Web Scraping
- **Wikipedia Integration**: Uses Wikipedia API for search and content extraction
- **General Web Scraping**: Scrapes educational and news websites
- **Content Cleaning**: Removes navigation, ads, and other unwanted elements
- **Error Handling**: Graceful fallbacks when scraping fails

### Chat Interface
- **Message Bubbles**: User and assistant messages with different styling
- **Source Cards**: Clickable cards showing source websites with snippets
- **Loading States**: Animated loading indicators during scraping
- **Auto-resize**: Input field automatically resizes based on content

### Responsive Design
- **Mobile-friendly**: Optimized for mobile devices
- **Sidebar Navigation**: Collapsible sidebar on mobile
- **Touch-friendly**: Large touch targets for mobile interaction

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Project Structure
```
src/
├── scrapers/
│   ├── wikipedia.ts      # Wikipedia-specific scraping
│   └── general.ts        # General web scraping
├── services/
│   └── chatService.ts    # Chat logic and query processing
├── ui/
│   └── chatInterface.ts  # UI controller
├── types.ts              # TypeScript type definitions
├── main.ts               # Application entry point
└── styles.css            # Global styles
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This application is for educational purposes only. Please respect website terms of service and robots.txt files when scraping content. Always check the legality of web scraping in your jurisdiction.