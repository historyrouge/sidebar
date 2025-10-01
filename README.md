# SearnAI - AI-Powered Study Platform

SearnAI is a comprehensive AI-powered study platform built with Next.js, designed to help students learn smarter and more efficiently. The platform integrates multiple AI models and provides a wide range of study tools and resources.

## 🚀 Features

### 🧠 Advanced AI Features
- **Multi-Agent System**: Specialized AI agents (Tutor, Programmer, Researcher, Creative, Analyst, Strategist)
- **Conversation Memory**: Long-term context awareness and memory retention
- **AI Personalization**: Adaptive learning profiles and personalized content generation
- **Context-Aware Responses**: Intelligent response generation based on user history and preferences

### 💬 Core Chat Features
- **Multi-Modal Chat**: Text, image, and file upload capabilities with advanced processing
- **Voice Input/Output**: Speech-to-text and text-to-speech with voice navigation
- **Real-time Collaboration**: WebSocket-based live features and presence indicators
- **YouTube Integration**: Extract content from YouTube videos with floating player control

### Study Tools
- **Study Sessions**: Focused study environments with AI assistance
- **AI Editor**: Intelligent text editing and writing assistance
- **Code Analyzer**: Analyze and debug code with AI
- **Flashcards**: Generate and study with AI-created flashcards
- **Quiz Generator**: Create custom quizzes and assessments
- **Mind Maps**: Visual learning with AI-generated mind maps
- **Question Papers**: Generate exam-style question papers
- **Presentation Maker**: Create presentations with AI assistance

### Resources
- **Web Browser**: Built-in browser for research
- **News Reader**: Stay updated with curated news
- **eBook Reader**: Access and read digital books
- **PDF Hub**: Manage and interact with PDF documents
- **AI Training**: Customize AI models for specific needs

### 🎨 Advanced User Experience
- **Progressive Web App**: Full PWA with offline support, push notifications, and native app features
- **Advanced Accessibility**: Voice navigation, screen reader optimization, high contrast mode, and WCAG 2.1 AA compliance
- **Drag & Drop Interface**: Interactive drag-and-drop for organizing content and files
- **Virtual Scrolling**: Efficient rendering of large lists and datasets
- **Keyboard Shortcuts**: Comprehensive keyboard navigation (Ctrl+K for command palette, 50+ shortcuts)
- **Command Palette**: AI-powered quick access to all features and content
- **Real-time Collaboration**: Live presence indicators, typing indicators, and collaborative editing

### 📊 Analytics & Personalization
- **Advanced Analytics**: User behavior tracking, performance monitoring, and A/B testing
- **AI Personalization**: Adaptive learning paths, personalized content, and intelligent recommendations
- **Learning Profile**: Dynamic user profiling with learning style detection and progress tracking
- **Performance Monitoring**: Real-time performance metrics and Core Web Vitals tracking

### 🏢 Enterprise Features
- **Multi-tenancy**: Organization management with custom branding and settings
- **Role-Based Access Control**: Granular permissions and user management
- **Audit Logging**: Comprehensive audit trails for compliance and security
- **Security Monitoring**: Anomaly detection and security incident tracking
- **Compliance Tools**: GDPR, HIPAA, and SOC 2 compliance features
- **Data Retention**: Automated data lifecycle management

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: OpenAI API, Google AI (Genkit)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel/Firebase Hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd searnaI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── __tests__/        # Component tests
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── __tests__/        # Library tests
│   ├── error-handler.ts  # Error handling utilities
│   ├── security.ts       # Security utilities
│   ├── storage.ts        # Storage management
│   ├── utils.ts          # General utilities
│   └── validation.ts     # Input validation
├── types/                # TypeScript type definitions
└── ai/                   # AI integration (Genkit)
```

### Key Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run genkit:dev` - Start Genkit AI development
- `npm run genkit:watch` - Watch Genkit AI changes

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Code formatting (configured in editor)
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit and integration testing

## 🎯 Usage

### Getting Started
1. **Sign up/Login**: Create an account or sign in with existing credentials
2. **Explore Tools**: Use the sidebar to navigate between different study tools
3. **Start Chatting**: Begin with the AI chat interface for general assistance
4. **Upload Content**: Share files, images, or paste text for AI analysis
5. **Use Voice**: Click the microphone icon for voice input

### Keyboard Shortcuts
- `Ctrl/Cmd + K` - Open command palette
- `Ctrl/Cmd + N` - New chat
- `Ctrl/Cmd + D` - Toggle dark mode
- `Ctrl/Cmd + B` - Toggle sidebar
- `/` - Focus chat input
- `Shift + ?` - Show all keyboard shortcuts

### AI Models
- **Default Model**: Meta-Llama-3.1-8B-Instruct
- **DeepThink Mode**: GPT-OSS-120B for complex reasoning
- **Music Mode**: YouTube integration for music discovery
- **Agent Mode**: Enhanced AI capabilities

## 🔒 Security

SearnAI implements comprehensive security measures:

- **Input Validation**: All user inputs are validated and sanitized
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **Rate Limiting**: API endpoints are protected against abuse
- **File Upload Security**: File type and size validation
- **Authentication**: Secure Firebase authentication
- **Data Encryption**: Sensitive data is encrypted in transit and at rest

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use semantic commit messages
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 API Documentation

### Chat API
```typescript
POST /api/chat
{
  "history": Array<Message>,
  "fileContent"?: string,
  "imageDataUri"?: string,
  "model": string,
  "isMusicMode"?: boolean
}
```

### Text-to-Speech API
```typescript
POST /api/tts
{
  "text": string
}
```

### News API
```typescript
GET /api/news?category=technology&limit=10
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all environment variables are set
- Clear `.next` folder and rebuild
- Check for TypeScript errors: `npm run typecheck`

**Authentication Issues**
- Verify Firebase configuration
- Check API keys and permissions
- Clear browser cache and cookies

**Performance Issues**
- Enable production optimizations
- Check network requests in DevTools
- Monitor bundle size with `npm run build`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [OpenAI](https://openai.com/) - AI models
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support, email support@searnaI.com or join our Discord community.

---

Built with ❤️ by the SearnAI Team
