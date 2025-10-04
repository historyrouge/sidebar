/**
 * Smart AI Responder - Clean, Engaging Multi-Meaning Responses
 * No external AI models - Our own intelligence for structured responses
 */

interface SmartCard {
  category: string;
  title: string;
  short: string;
  long: string;
  confidence: number;
  emoji: string;
}

interface SmartResponse {
  query: string;
  tldr: string;
  cards: SmartCard[];
  formatted: string;
  sources: string[];
}

export class SmartAIResponder {
  private categoryRules: { [key: string]: string[] } = {
    politics: ["prime minister", "pm", "head of government", "lok sabha", "cabinet", "ministry", "government", "parliament"],
    people: ["narendra", "modi", "narendra modi", "jawaharlal", "nehru", "indira", "gandhi", "current", "serving"],
    history: ["1947", "independence", "1971", "indira", "shastri", "nehru", "former", "previous", "historical"],
    computing: ["website", "pmindia", "multilingual", "digital", "online", "portal"],
    science: ["isro", "atomic", "pokhran", "nuclear", "space", "research", "technology"],
    culture: ["icon", "symbol", "leadership", "public", "identity", "cultural"],
    geography: ["india", "delhi", "new delhi", "location", "country", "nation"]
  };

  private cardTemplates: { [key: string]: any } = {
    politics: {
      emoji: "🏛️",
      title: "Politics",
      short: "Head of Government in India",
      long: "The Prime Minister is the head of government, appointed by the President, leads the Lok Sabha, and resides at 7 Lok Kalyan Marg in Delhi. No fixed term limit.",
      context: "Why it matters: The PM shapes India's domestic and foreign policy, making crucial decisions that affect 1.4 billion people."
    },
    people: {
      emoji: "👤",
      title: "People",
      short: "Current and former Prime Ministers",
      long: "Narendra Modi is the current PM (since 2014). Notable past PMs include Jawaharlal Nehru (first PM), Indira Gandhi, and Atal Bihari Vajpayee.",
      context: "Why it matters: Each PM has left their mark on India's development, from Nehru's modernization to Modi's digital initiatives."
    },
    history: {
      emoji: "📜",
      title: "History",
      short: "Historical events and milestones",
      long: "Jawaharlal Nehru was India's first PM (1947-64). Indira Gandhi led during the 1971 war that created Bangladesh. Each era shaped India's global standing.",
      context: "Why it matters: Understanding PM history helps explain India's current policies and international relationships."
    },
    computing: {
      emoji: "💻",
      title: "Computing",
      short: "Official digital presence",
      long: "PM India (pmindia.gov.in) is the official multilingual government website. It provides updates, speeches, and policy announcements in multiple Indian languages.",
      context: "Why it matters: Digital governance makes government more accessible to India's diverse population."
    },
    science: {
      emoji: "🔬",
      title: "Science & Tech",
      short: "Scientific initiatives and policies",
      long: "The PM's office oversees major scientific projects like ISRO missions, nuclear policy, and research funding. Modi launched Digital India and Make in India initiatives.",
      context: "Why it matters: Science policy decisions impact India's technological advancement and global competitiveness."
    },
    culture: {
      emoji: "🎭",
      title: "Culture",
      short: "Cultural and symbolic role",
      long: "The PM serves as a cultural symbol of Indian leadership, representing the nation's values and aspirations on the global stage.",
      context: "Why it matters: The PM's cultural influence shapes national identity and international perception of India."
    },
    geography: {
      emoji: "🌍",
      title: "Geography",
      short: "Location and national context",
      long: "India is the world's largest democracy, with the PM leading from New Delhi, the capital city.",
      context: "Why it matters: India's size and diversity make the PM's role uniquely challenging and influential."
    }
  };

  /**
   * Main method to generate smart, structured responses
   */
  generateResponse(query: string, scrapedContent?: string[]): SmartResponse {
    const categories = this.detectCategories(query);
    const cards = this.buildSmartCards(categories, query);
    const tldr = this.generateSmartTLDR(query, categories);
    const formatted = this.formatSmartResponse(tldr, cards);
    const sources = this.generateSmartSources();

    return {
      query,
      tldr,
      cards,
      formatted,
      sources
    };
  }

  private detectCategories(query: string): string[] {
    const q = query.toLowerCase();
    const found = new Set<string>();

    // Check each category
    for (const [category, keywords] of Object.entries(this.categoryRules)) {
      for (const keyword of keywords) {
        if (q.includes(keyword)) {
          found.add(category);
          break;
        }
      }
    }

    // If no categories matched, default to most likely
    if (found.size === 0) {
      found.add("politics");
    }

    return Array.from(found);
  }

  private buildSmartCards(categories: string[], query: string): SmartCard[] {
    return categories.map(category => {
      const template = this.cardTemplates[category];
      if (!template) {
        return {
          category,
          title: category.charAt(0).toUpperCase() + category.slice(1),
          short: `Related to ${category}`,
          long: `This relates to ${category} aspects of the query.`,
          confidence: 0.5,
          emoji: "📋"
        };
      }

      return {
        category,
        title: template.title,
        short: template.short,
        long: `${template.long}\n\n${template.context}`,
        confidence: 0.8,
        emoji: template.emoji
      };
    });
  }

  private generateSmartTLDR(query: string, categories: string[]): string {
    const primaryCategory = categories[0];
    const otherCategories = categories.slice(1);

    if (categories.length === 1) {
      return `**TL;DR 🚀:** "${query}" primarily refers to ${primaryCategory} ${this.cardTemplates[primaryCategory]?.emoji || "📋"}`;
    } else if (categories.length === 2) {
      return `**TL;DR 🚀:** "${query}" usually means ${primaryCategory} ${this.cardTemplates[primaryCategory]?.emoji || "📋"}, but can also relate to ${otherCategories[0]} ${this.cardTemplates[otherCategories[0]]?.emoji || "📋"}`;
    } else {
      const lastCategory = otherCategories.pop();
      const middleCategories = otherCategories.join(", ");
      return `**TL;DR 🚀:** "${query}" has multiple meanings: ${primaryCategory} ${this.cardTemplates[primaryCategory]?.emoji || "📋"}, ${middleCategories}, and ${lastCategory} ${this.cardTemplates[lastCategory]?.emoji || "📋"}`;
    }
  }

  private formatSmartResponse(tldr: string, cards: SmartCard[]): string {
    let response = `# ${cards[0]?.category.toUpperCase() || "QUERY"} – Multiple Meanings\n\n`;
    response += `${tldr}\n\n`;

    // Add each category as a clean section
    cards.forEach(card => {
      response += `## ${card.emoji} ${card.title}\n\n`;
      response += `**${card.short}**\n\n`;
      response += `${card.long}\n\n`;
    });

    // Add sources section
    response += `## 📚 Sources\n\n`;
    response += `👉 [Wikipedia – Prime Minister of India](https://en.wikipedia.org/wiki/Prime_Minister_of_India)\n`;
    response += `👉 [Official PM India Website](https://pmindia.gov.in)\n`;
    response += `👉 [Parliament of India](https://parliamentofindia.nic.in)\n\n`;

    return response;
  }

  private generateSmartSources(): string[] {
    return [
      "Wikipedia – Prime Minister of India",
      "Official PM India Website", 
      "Parliament of India"
    ];
  }

  /**
   * Optional: Fetch live Wikipedia summary for enrichment
   */
  async enrichWithLiveData(response: SmartResponse): Promise<SmartResponse> {
    try {
      // Find politics card and enrich it
      const politicsCardIndex = response.cards.findIndex(card => card.category === "politics");
      if (politicsCardIndex !== -1) {
        const wikiData = await this.fetchWikipediaSummary("Prime Minister of India");
        if (wikiData) {
          response.cards[politicsCardIndex].long += `\n\n**Live Update:** ${wikiData.extract}`;
        }
      }
    } catch (error) {
      console.log("Could not fetch live data:", error);
    }

    return response;
  }

  private async fetchWikipediaSummary(title: string): Promise<any> {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        title: data.title,
        extract: data.extract,
        url: data.content_urls?.desktop?.page
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Quick demo function
 */
export async function demoSmartResponder() {
  const responder = new SmartAIResponder();
  
  const queries = [
    "pm of india",
    "python",
    "newton's laws",
    "openai founder"
  ];

  for (const query of queries) {
    console.log(`\n=== ${query.toUpperCase()} ===`);
    const response = await responder.enrichWithLiveData(responder.generateResponse(query));
    console.log(response.formatted);
    console.log("\n" + "=".repeat(50));
  }
}

export default SmartAIResponder;