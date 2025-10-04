"use strict";
class WebScraperChat {
    constructor() {
        this.chatMessages = [];
        this.history = [];
        this.initializeEventListeners();
        this.loadHistory();
    }
    initializeEventListeners() {
        // URL input and scrape button
        const urlInput = document.getElementById('url-input');
        const scrapeBtn = document.getElementById('scrape-btn');
        scrapeBtn.addEventListener('click', () => this.handleScrape());
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleScrape();
        });
        // Query input and search button
        const queryInput = document.getElementById('query-input');
        const searchBtn = document.getElementById('search-btn');
        searchBtn.addEventListener('click', () => this.handleSearch());
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleSearch();
        });
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        sendBtn.addEventListener('click', () => this.handleChatInput());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleChatInput();
        });
        // Clear chat button
        const clearBtn = document.getElementById('clear-chat');
        clearBtn.addEventListener('click', () => this.clearChat());
    }
    async handleScrape() {
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }
        this.addUserMessage(`Scrape: ${url}`);
        this.showLoading('Scraping website...');
        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            if (!response.ok) {
                throw new Error('Failed to scrape website');
            }
            const data = await response.json();
            this.hideLoading();
            this.addAssistantMessage(data.title, data.content, data.url);
            this.addToHistory(data.title, url);
            // Clear input
            urlInput.value = '';
        }
        catch (error) {
            this.hideLoading();
            this.showError('Failed to scrape website. Please check the URL and try again.');
            console.error('Scraping error:', error);
        }
    }
    async handleSearch() {
        const queryInput = document.getElementById('query-input');
        const query = queryInput.value.trim();
        if (!query) {
            this.showError('Please enter a search query');
            return;
        }
        this.addUserMessage(`Search: ${query}`);
        this.showLoading('Searching Wikipedia...');
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (!response.ok) {
                throw new Error('Failed to search Wikipedia');
            }
            const results = await response.json();
            this.hideLoading();
            if (results.length === 0) {
                this.addAssistantMessage('No results found', 'Sorry, I couldn\'t find any information about that topic.');
            }
            else {
                const mainResult = results[0];
                this.addAssistantMessage(mainResult.title, mainResult.content, mainResult.url, results);
                this.addToHistory(mainResult.title, mainResult.url);
            }
            // Clear input
            queryInput.value = '';
        }
        catch (error) {
            this.hideLoading();
            this.showError('Failed to search Wikipedia. Please try again.');
            console.error('Search error:', error);
        }
    }
    async handleChatInput() {
        const chatInput = document.getElementById('chat-input');
        const query = chatInput.value.trim();
        if (!query)
            return;
        this.addUserMessage(query);
        this.showLoading('Searching for information...');
        try {
            // Try to detect if it's a URL
            if (this.isValidUrl(query)) {
                await this.scrapeUrl(query);
            }
            else {
                await this.searchQuery(query);
            }
            // Clear input
            chatInput.value = '';
        }
        catch (error) {
            this.hideLoading();
            this.showError('Sorry, I couldn\'t process your request. Please try again.');
            console.error('Chat input error:', error);
        }
    }
    async scrapeUrl(url) {
        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            if (!response.ok) {
                throw new Error('Failed to scrape website');
            }
            const data = await response.json();
            this.hideLoading();
            this.addAssistantMessage(data.title, data.content, data.url);
            this.addToHistory(data.title, url);
        }
        catch (error) {
            throw error;
        }
    }
    async searchQuery(query) {
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (!response.ok) {
                throw new Error('Failed to search Wikipedia');
            }
            const results = await response.json();
            this.hideLoading();
            if (results.length === 0) {
                this.addAssistantMessage('No results found', 'Sorry, I couldn\'t find any information about that topic.');
            }
            else {
                const mainResult = results[0];
                this.addAssistantMessage(mainResult.title, mainResult.content, mainResult.url, results);
                this.addToHistory(mainResult.title, mainResult.url);
            }
        }
        catch (error) {
            throw error;
        }
    }
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    addUserMessage(content) {
        const message = {
            id: this.generateId(),
            type: 'user',
            content,
            timestamp: new Date()
        };
        this.chatMessages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }
    addAssistantMessage(title, content, url, sources) {
        const message = {
            id: this.generateId(),
            type: 'assistant',
            content: `${title}\n\n${content}`,
            sources,
            timestamp: new Date()
        };
        this.chatMessages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }
    renderMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages)
            return;
        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.innerHTML = `
      <div class="message-avatar">
        ${message.type === 'user' ? '👤' : '🤖'}
      </div>
      <div class="message-content">
        <div class="message-text">
          ${this.formatMessageContent(message.content)}
        </div>
        ${message.sources ? this.renderSourceCards(message.sources) : ''}
      </div>
    `;
        chatMessages.appendChild(messageElement);
    }
    formatMessageContent(content) {
        // Split content into title and body
        const lines = content.split('\n');
        const title = lines[0];
        const body = lines.slice(1).join('\n').trim();
        return `
      <h3>${title}</h3>
      <p>${body}</p>
    `;
    }
    renderSourceCards(sources) {
        if (!sources || sources.length === 0)
            return '';
        return `
      <div class="source-cards">
        ${sources.map(source => `
          <div class="source-card">
            <div class="source-card-header">
              <span class="source-title">${source.title}</span>
              <span class="source-badge">${source.source}</span>
            </div>
            <a href="${source.url}" target="_blank" class="source-url">${source.url}</a>
            <div class="source-summary">${source.summary}</div>
          </div>
        `).join('')}
      </div>
    `;
    }
    showLoading(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages)
            return;
        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message assistant';
        loadingElement.id = 'loading-message';
        loadingElement.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="loading">
          <div class="loading-spinner"></div>
          ${message}
        </div>
      </div>
    `;
        chatMessages.appendChild(loadingElement);
        this.scrollToBottom();
    }
    hideLoading() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
    showError(message) {
        this.hideLoading();
        this.addAssistantMessage('Error', message);
    }
    addToHistory(title, url) {
        const historyItem = { title, url, timestamp: new Date() };
        this.history.unshift(historyItem);
        // Keep only last 10 items
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        this.saveHistory();
        this.renderHistory();
    }
    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList)
            return;
        historyList.innerHTML = this.history.map(item => `
      <div class="history-item" data-url="${item.url}">
        <div class="history-item-title">${item.title}</div>
        <div class="history-item-url">${item.url}</div>
      </div>
    `).join('');
        // Add click listeners to history items
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                if (url) {
                    const chatInput = document.getElementById('chat-input');
                    chatInput.value = url;
                    this.handleChatInput();
                }
            });
        });
    }
    loadHistory() {
        const saved = localStorage.getItem('web-scraper-history');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderHistory();
            }
            catch (error) {
                console.error('Failed to load history:', error);
                this.history = [];
            }
        }
    }
    saveHistory() {
        localStorage.setItem('web-scraper-history', JSON.stringify(this.history));
    }
    clearChat() {
        this.chatMessages = [];
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-icon">🤖</div>
          <h3>Welcome to Web Scraper Chat!</h3>
          <p>Enter a website URL or search query to get started. I'll extract and present the information in a chat-like format.</p>
          <div class="example-queries">
            <h4>Try these examples:</h4>
            <ul>
              <li>"Who is the PM of India?"</li>
              <li>"Tell me about Newton's Laws of Motion"</li>
              <li>"What is electrochemistry?"</li>
              <li>Or paste any website URL</li>
            </ul>
          </div>
        </div>
      `;
        }
    }
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WebScraperChat();
});
