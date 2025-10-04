import axios from 'axios';

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export async function searchWebsites(query: string): Promise<string[]> {
  try {
    // For demo purposes, we'll use predefined websites based on query keywords
    // In a real implementation, you might use search APIs or web crawling
    
    const websites: string[] = [];
    
    // Wikipedia search
    const wikiQuery = encodeURIComponent(query);
    websites.push(`https://en.wikipedia.org/wiki/${wikiQuery}`);
    
    // Add more websites based on query type
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('news') || lowerQuery.includes('current')) {
      websites.push('https://www.bbc.com/news');
      websites.push('https://www.cnn.com');
    }
    
    if (lowerQuery.includes('technology') || lowerQuery.includes('tech')) {
      websites.push('https://techcrunch.com');
      websites.push('https://www.theverge.com');
    }
    
    if (lowerQuery.includes('science') || lowerQuery.includes('research')) {
      websites.push('https://www.nature.com');
      websites.push('https://www.scientificamerican.com');
    }
    
    if (lowerQuery.includes('programming') || lowerQuery.includes('code')) {
      websites.push('https://stackoverflow.com');
      websites.push('https://developer.mozilla.org');
    }
    
    // Add some general knowledge sites
    websites.push('https://www.britannica.com');
    websites.push('https://www.history.com');
    
    // Try to find Wikipedia articles for specific topics
    if (lowerQuery.includes('pm') || lowerQuery.includes('prime minister')) {
      if (lowerQuery.includes('india')) {
        websites.push('https://en.wikipedia.org/wiki/Prime_Minister_of_India');
        websites.push('https://en.wikipedia.org/wiki/Narendra_Modi');
      }
      if (lowerQuery.includes('china')) {
        websites.push('https://en.wikipedia.org/wiki/Premier_of_the_State_Council');
        websites.push('https://en.wikipedia.org/wiki/Li_Qiang');
      }
    }
    
    if (lowerQuery.includes('newton') || lowerQuery.includes('laws of motion')) {
      websites.push('https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion');
      websites.push('https://en.wikipedia.org/wiki/Isaac_Newton');
    }
    
    if (lowerQuery.includes('electrochemistry') || lowerQuery.includes('electro chemistry')) {
      websites.push('https://en.wikipedia.org/wiki/Electrochemistry');
    }
    
    if (lowerQuery.includes('space') || lowerQuery.includes('founder')) {
      websites.push('https://en.wikipedia.org/wiki/SpaceX');
      websites.push('https://en.wikipedia.org/wiki/Elon_Musk');
    }
    
    // Remove duplicates and return
    return [...new Set(websites)];
    
  } catch (error) {
    console.error('Error searching websites:', error);
    // Fallback to Wikipedia
    return [`https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`];
  }
}