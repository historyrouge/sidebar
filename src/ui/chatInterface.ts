import { ChatMessage, Source, ChatHistory } from '../types';
import { ChatService } from '../services/chatService';

export class ChatInterface {
  private chatService: ChatService;
  private currentChatId: string | null = null;
  private chatMessagesContainer: HTMLElement;
  private chatInput: HTMLTextAreaElement;
  private sendBtn: HTMLButtonElement;
  private chatHistoryContainer: HTMLElement;
  private newChatBtn: HTMLButtonElement;

  constructor() {
    this.chatService = new ChatService();
    this.initializeElements();
    this.setupEventListeners();
    this.createNewChat();
  }

  private initializeElements(): void {
    this.chatMessagesContainer = document.getElementById('chatMessages')!;
    this.chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;
    this.sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    this.chatHistoryContainer = document.getElementById('chatHistory')!;
    this.newChatBtn = document.getElementById('newChatBtn') as HTMLButtonElement;
  }

  private setupEventListeners(): void {
    // Send button click
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // Enter key to send message
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.chatInput.addEventListener('input', () => {
      this.autoResizeTextarea();
      this.updateSendButton();
    });

    // New chat button
    this.newChatBtn.addEventListener('click', () => this.createNewChat());

    // Example questions click
    this.setupExampleQuestions();
  }

  private setupExampleQuestions(): void {
    const exampleQuestions = document.querySelectorAll('.example-questions li');
    exampleQuestions.forEach(li => {
      li.addEventListener('click', () => {
        const question = li.textContent?.trim();
        if (question) {
          this.chatInput.value = question;
          this.updateSendButton();
          this.sendMessage();
        }
      });
    });
  }

  private autoResizeTextarea(): void {
    this.chatInput.style.height = 'auto';
    this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 200) + 'px';
  }

  private updateSendButton(): void {
    const hasText = this.chatInput.value.trim().length > 0;
    this.sendBtn.disabled = !hasText;
  }

  private async sendMessage(): Promise<void> {
    const message = this.chatInput.value.trim();
    if (!message || !this.currentChatId) return;

    // Clear input and disable send button
    this.chatInput.value = '';
    this.updateSendButton();
    this.autoResizeTextarea();

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add user message to chat
    this.addMessageToChat(userMessage);
    this.chatService.addMessageToChat(this.currentChatId, userMessage);

    // Show loading message
    this.showLoadingMessage();

    try {
      // Process query and get response
      const assistantMessage = await this.chatService.processQuery(message);
      
      // Remove loading message
      this.removeLoadingMessage();
      
      // Add assistant message to chat
      this.addMessageToChat(assistantMessage);
      this.chatService.addMessageToChat(this.currentChatId, assistantMessage);
      
    } catch (error) {
      console.error('Error processing message:', error);
      this.removeLoadingMessage();
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      
      this.addMessageToChat(errorMessage);
      this.chatService.addMessageToChat(this.currentChatId, errorMessage);
    }

    // Update chat history
    this.updateChatHistory();
  }

  private addMessageToChat(message: ChatMessage): void {
    // Remove welcome message if it exists
    const welcomeMessage = this.chatMessagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageElement = this.createMessageElement(message);
    this.chatMessagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.scrollToBottom();
  }

  private createMessageElement(message: ChatMessage): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.id = message.id;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = message.content;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = this.formatTime(message.timestamp);

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);

    // Add sources if available
    if (message.sources && message.sources.length > 0) {
      const sourcesContainer = this.createSourcesElement(message.sources);
      messageContent.appendChild(sourcesContainer);
    }

    messageDiv.appendChild(messageContent);
    return messageDiv;
  }

  private createSourcesElement(sources: Source[]): HTMLElement {
    const sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'sources-container';

    const sourcesTitle = document.createElement('div');
    sourcesTitle.className = 'sources-title';
    sourcesTitle.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Sources (${sources.length})
    `;

    const sourcesList = document.createElement('div');
    sourcesList.className = 'sources-list';

    sources.forEach(source => {
      const sourceCard = document.createElement('div');
      sourceCard.className = 'source-card';
      
      sourceCard.innerHTML = `
        <div class="source-header">
          <span class="source-icon">${source.icon}</span>
          <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="source-title">
            ${source.title}
          </a>
        </div>
        <div class="source-url">${source.url}</div>
        <div class="source-snippet">${source.snippet}</div>
      `;
      
      sourcesList.appendChild(sourceCard);
    });

    sourcesContainer.appendChild(sourcesTitle);
    sourcesContainer.appendChild(sourcesList);
    
    return sourcesContainer;
  }

  private showLoadingMessage(): void {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loading-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading';
    loadingContent.innerHTML = `
      <span>Searching multiple websites</span>
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;

    messageContent.appendChild(loadingContent);
    loadingDiv.appendChild(messageContent);
    this.chatMessagesContainer.appendChild(loadingDiv);
    
    this.scrollToBottom();
  }

  private removeLoadingMessage(): void {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  private createNewChat(): void {
    const newChat = this.chatService.createNewChat();
    this.currentChatId = newChat.id;
    
    // Clear messages
    this.chatMessagesContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🤖</div>
        <h3>Welcome to Web Scraper Chat!</h3>
        <p>Ask me anything and I'll search multiple websites to provide you with comprehensive answers.</p>
        <div class="example-questions">
          <h4>Try asking:</h4>
          <ul>
            <li>"Who is the Prime Minister of India?"</li>
            <li>"Tell me about Newton's Laws of Motion"</li>
            <li>"What is electrochemistry?"</li>
            <li>"Explain quantum computing"</li>
          </ul>
        </div>
      </div>
    `;

    // Setup example questions again
    this.setupExampleQuestions();
    
    // Update chat history
    this.updateChatHistory();
  }

  private updateChatHistory(): void {
    const chats = this.chatService.getChatHistory();
    
    this.chatHistoryContainer.innerHTML = '';
    
    chats.slice(0, 10).forEach(chat => {
      const historyItem = document.createElement('div');
      historyItem.className = `history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
      historyItem.textContent = chat.title;
      
      historyItem.addEventListener('click', () => {
        this.loadChat(chat.id);
      });
      
      this.chatHistoryContainer.appendChild(historyItem);
    });
  }

  private loadChat(chatId: string): void {
    const chat = this.chatService.getChatById(chatId);
    if (!chat) return;

    this.currentChatId = chatId;
    
    // Clear messages
    this.chatMessagesContainer.innerHTML = '';
    
    // Load messages
    chat.messages.forEach(message => {
      this.addMessageToChat(message);
    });
    
    // Update chat history
    this.updateChatHistory();
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    }, 100);
  }
}