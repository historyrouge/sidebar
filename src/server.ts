import express from 'express';
import cors from 'cors';
import path from 'path';
import { scrapeWebsite } from './scraper';
import { searchWebsites } from './search';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/client')));

// API endpoint to scrape content from multiple websites
app.post('/api/scrape', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Search for relevant websites based on query
    const websites = await searchWebsites(query);
    
    // Scrape content from found websites
    const scrapedData = await Promise.all(
      websites.map(async (url) => {
        try {
          const content = await scrapeWebsite(url);
          return {
            url,
            title: content.title,
            content: content.content,
            summary: content.summary
          };
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
          return null;
        }
      })
    );

    // Filter out failed scrapes
    const validData = scrapedData.filter(data => data !== null);
    
    res.json({
      query,
      sources: validData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in scrape endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the React app
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});