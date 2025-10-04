# Web Scraper Chat

A web scraping application that extracts data from multiple websites and presents it in a ChatGPT-like interface. Users can ask questions and get comprehensive answers based on content scraped from various authoritative sources.

## Features

- **Smart Web Scraping**: Automatically finds and scrapes relevant websites based on user queries
- **ChatGPT-like Interface**: Clean, conversational chat interface with message bubbles
- **Multi-Source Answers**: Combines information from multiple websites for comprehensive responses
- **Source Attribution**: Shows source cards with original links and summaries
- **No AI Services**: Pure web scraping without external AI dependencies
- **Responsive Design**: Modern dark theme with mobile-friendly interface

## Example Queries

The app can handle various types of questions:

- **Greetings**: "Hi", "Hello", "How are you?"
- **Political**: "Who is the PM of India?", "Who is the PM of China?"
- **Science**: "Tell me about Newton's Laws of Motion", "What is electrochemistry?"
- **Technology**: "Who founded SpaceX?", "Tell me about space exploration"
- **General Knowledge**: Any topic that can be found on Wikipedia and other websites

## Tech Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Web Scraping**: Cheerio, Axios
- **Build Tools**: Vite, TypeScript Compiler

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-scraper-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run type-check` - Run TypeScript type checking

## How It Works

1. **User Input**: User types a question in the chat interface
2. **Website Discovery**: The app searches for relevant websites based on the query
3. **Content Scraping**: Extracts content from multiple websites using Cheerio
4. **Response Generation**: Combines scraped content to create comprehensive answers
5. **Source Attribution**: Displays source cards with original links and summaries

## Supported Websites

The app can scrape content from various types of websites:

- Wikipedia articles
- News websites (BBC, CNN)
- Technology sites (TechCrunch, The Verge)
- Scientific publications (Nature, Scientific American)
- Educational resources (Britannica, History.com)
- Developer resources (Stack Overflow, MDN)

## Customization

You can customize the app by:

- Adding new website sources in `src/search.ts`
- Modifying the scraping logic in `src/scraper.ts`
- Updating the response generation in `src/App.ts`
- Changing the styling in `src/style.css`

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.