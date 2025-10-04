import { ChatInterface } from './ui/chatInterface';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new ChatInterface();
    console.log('Web Scraper Chat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Web Scraper Chat:', error);
    
    // Show error message to user
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: hsl(222 84% 5%);
          color: hsl(210 40% 98%);
          font-family: 'Inter', sans-serif;
          text-align: center;
          padding: 2rem;
        ">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem; color: hsl(217 91% 60%);">
              ⚠️ Application Error
            </h1>
            <p style="font-size: 1.125rem; margin-bottom: 1rem;">
              Failed to initialize the Web Scraper Chat application.
            </p>
            <p style="color: hsl(215 20% 65%); font-size: 0.875rem;">
              Please refresh the page or check the browser console for more details.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background-color: hsl(217 91% 60%);
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='hsl(217 91% 50%)'"
              onmouseout="this.style.backgroundColor='hsl(217 91% 60%)'"
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});