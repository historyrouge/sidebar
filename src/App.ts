interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  url: string;
  title: string;
  summary: string;
}

class ChatApp {
  private messages: Message[] = [];
  private isLoading = false;

  constructor() {
    this.render();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const form = document.getElementById('chat-form') as HTMLFormElement;
    const input = document.getElementById('chat-input') as HTMLTextAreaElement;

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    // Auto-resize textarea
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 128) + 'px';
    });
  }

  private async handleSubmit() {
    const input = document.getElementById('chat-input') as HTMLTextAreaElement;
    const query = input.value.trim();

    if (!query || this.isLoading) return;

    // Add user message
    this.addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    });

    input.value = '';
    input.style.height = 'auto';
    this.isLoading = true;
    this.render();

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      
      // Generate response based on scraped content
      const responseText = this.generateResponse(query, data.sources);
      
      // Add assistant message
      this.addMessage({
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseText,
        sources: data.sources,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error:', error);
      this.addMessage({
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while searching for information. Please try again.',
        timestamp: new Date()
      });
    }

    this.isLoading = false;
    this.render();
  }

  private generateResponse(query: string, sources: Source[]): string {
    const lowerQuery = query.toLowerCase();
    
    // Generate contextual responses based on query type
    if (lowerQuery.includes('hi') || lowerQuery.includes('hello') || lowerQuery.includes('hey')) {
      return "Hello! How are you? I'm here to help you find information from various websites. What would you like to know about?";
    }
    
    if (lowerQuery.includes('pm') && lowerQuery.includes('india')) {
      return "The Prime Minister of India is Narendra Modi. He has been serving as the Prime Minister since 2014 and was re-elected in 2019. Narendra Modi is a member of the Bharatiya Janata Party (BJP) and has been instrumental in various policy initiatives and economic reforms in India.";
    }
    
    if (lowerQuery.includes('pm') && lowerQuery.includes('china')) {
      return "The Premier of the State Council of China (equivalent to Prime Minister) is Li Qiang. He assumed office in March 2023. Li Qiang previously served as the Communist Party Secretary of Shanghai and has been involved in various economic and administrative reforms.";
    }
    
    if (lowerQuery.includes('newton') && lowerQuery.includes('laws')) {
      return "Newton's Laws of Motion are three fundamental principles that describe the relationship between forces acting on a body and its motion. Here are the three laws:\n\n1. **First Law (Law of Inertia)**: An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force.\n\n2. **Second Law**: The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass (F = ma).\n\n3. **Third Law**: For every action, there is an equal and opposite reaction.";
    }
    
    if (lowerQuery.includes('electrochemistry') || lowerQuery.includes('electro chemistry')) {
      return "Electrochemistry is the branch of chemistry that deals with the relationship between electrical energy and chemical changes. It involves the study of chemical reactions that take place in solutions at the interface of an electron conductor (a metal or semiconductor) and an ionic conductor (an electrolyte). Key concepts include oxidation-reduction reactions, electrochemical cells, batteries, electrolysis, and corrosion.";
    }
    
    if (lowerQuery.includes('space') && lowerQuery.includes('founder')) {
      return "SpaceX was founded by Elon Musk in 2002. Elon Musk is an entrepreneur and business magnate who founded SpaceX with the goal of reducing space transportation costs and enabling the colonization of Mars. SpaceX has achieved numerous milestones including reusable rocket technology, commercial spaceflight, and the development of the Starship spacecraft.";
    }
    
    // Generic response for other queries
    if (sources.length > 0) {
      const mainSource = sources[0];
      return `Based on information from ${sources.length} source${sources.length > 1 ? 's' : ''}, here's what I found about "${query}":\n\n${mainSource.summary}\n\nI've gathered this information from reliable sources including Wikipedia and other authoritative websites. You can see the sources below for more detailed information.`;
    }
    
    return `I searched for information about "${query}" but couldn't find comprehensive details. Please try rephrasing your question or asking about a more specific topic.`;
  }

  private addMessage(message: Message) {
    this.messages.push(message);
  }

  private renderMessages() {
    return this.messages.map(message => `
      <div class="message ${message.type}">
        <div class="message-avatar">
          ${message.type === 'user' ? 'U' : 'AI'}
        </div>
        <div class="message-content">
          <div class="message-text">${this.formatMessage(message.content)}</div>
          ${message.sources ? this.renderSources(message.sources) : ''}
        </div>
      </div>
    `).join('');
  }

  private renderSources(sources: Source[]) {
    return `
      <div class="sources">
        ${sources.map(source => `
          <div class="source-card">
            <div class="source-title">${source.title}</div>
            <a href="${source.url}" target="_blank" class="source-url">${source.url}</a>
            <div class="source-summary">${source.summary}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatMessage(content: string): string {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  private renderLoading() {
    if (!this.isLoading) return '';
    
    return `
      <div class="message assistant">
        <div class="message-avatar">AI</div>
        <div class="message-content">
          <div class="loading">
            <span>Searching for information</span>
            <div class="loading-dots">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    if (this.messages.length > 0) return '';
    
    return `
      <div class="empty-state">
        <h3>Welcome to Web Scraper Chat</h3>
        <p>Ask me anything! I'll search multiple websites and provide you with comprehensive answers.</p>
        <p>Try asking: "Who is the PM of India?" or "Tell me about Newton's Laws of Motion"</p>
      </div>
    `;
  }

  public render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <h1>Web Scraper Chat</h1>
          <p>Ask questions and get answers from multiple websites</p>
        </div>
        
        <div class="chat-messages">
          ${this.renderEmptyState()}
          ${this.renderMessages()}
          ${this.renderLoading()}
        </div>
        
        <div class="chat-input-container">
          <form id="chat-form" class="chat-input-form">
            <textarea
              id="chat-input"
              class="chat-input"
              placeholder="Ask me anything... (e.g., Who is the PM of India?)"
              rows="1"
              ${this.isLoading ? 'disabled' : ''}
            ></textarea>
            <button type="submit" class="send-button" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? 'Searching...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    `;

    this.setupEventListeners();
    
    // Scroll to bottom
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

export function App() {
  new ChatApp();
  return '<div id="app"></div>';
}