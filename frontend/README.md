# Adiva AI - Advanced AI Chat Interface

A cutting-edge, full-featured AI chat application built with React, TypeScript, and Tailwind CSS. Features modern design with glass morphism, comprehensive authentication, image processing, and real-time AI interactions.

## ✨ Key Features

### 🤖 AI Chat Capabilities
- **Multiple AI Models**: Support for OpenAI GPT, Claude AI, and other providers
- **Real-time Streaming**: Live AI response streaming with typing indicators
- **Image Processing**: Upload and analyze images with AI vision models
- **Conversation Memory**: Persistent chat history and context awareness
- **Model Comparison**: Side-by-side AI model performance testing
- **Custom System Prompts**: Personalized AI behavior and responses

### 🔐 Authentication & User Management
- **Google OAuth**: Seamless Google account integration
- **User Registration/Login**: Traditional email/password authentication
- **Profile Management**: Complete user profile and settings
- **Protected Routes**: Secure access to chat features
- **Session Management**: Persistent login sessions

### 🎨 Modern Design System
- **Glass Morphism**: Translucent, frosted glass effects throughout
- **Neural Network Backgrounds**: Subtle animated AI-inspired patterns
- **Dynamic Theming**: 9 different color themes with live preview
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion-powered transitions
- **Dark Theme**: Sophisticated dark color palette

### 📊 Analytics & Insights
- **Chat Analytics**: Comprehensive conversation statistics
- **Usage Tracking**: AI model usage patterns and performance
- **User Analytics**: Behavior tracking and engagement metrics
- **Data Export**: Backup conversations and settings

## 🛠️ Technical Stack

### Core Technologies
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Framer Motion** for smooth animations
- **React Router** for navigation and routing

### UI Components & Libraries
- **Lucide React** for modern, consistent icons
- **Recharts** for data visualization and analytics
- **React Markdown** for rich text rendering
- **Class Variance Authority** for component variants
- **Tailwind Merge** for dynamic class management

### Authentication & State Management
- **React Context** for global state management
- **Custom Hooks** for reusable logic
- **Local Storage** for persistent user preferences
- **JWT Tokens** for secure authentication

## 🎯 Key Components

### App.tsx
- Main application layout with responsive sidebar
- Theme management and dynamic theming
- Authentication wrapper and OAuth handling
- Mobile-responsive navigation

### AIchat.tsx
- Advanced chat interface with AI integration
- Real-time message streaming and typing indicators
- Image upload and processing capabilities
- Conversation management and history
- Analytics dashboard integration
- Model selection and comparison

### Authentication Components
- **AuthWrapper**: Protected route wrapper
- **LoginForm**: Email/password authentication
- **RegisterForm**: User registration
- **GoogleSignInButton**: OAuth integration
- **ProfileModal**: User profile management
- **ProtectedRoute**: Route protection

### UI Components
- **SettingsPanel**: Comprehensive settings management
- **ImageUploader**: Drag-and-drop image processing
- **Button, Card, Input**: Reusable UI components
- **Tooltip, Switch**: Interactive elements

## 🚀 Getting Started

### Prerequisites
- **Node.js 18.0.0+** (Recommended: v18.0.0 or higher)
- **Backend API** running on port 3001 (see backend README)
- **Modern Browser** with JavaScript enabled

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Google OAuth (if using Google authentication)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 🎨 Customization & Theming

### Available Themes
The application includes 9 built-in color themes:
- **Ocean**: Blue and cyan gradient
- **Indigo**: Purple and indigo tones
- **Blue**: Classic blue palette
- **Green**: Natural green tones
- **Purple**: Rich purple gradients
- **Orange**: Warm orange tones
- **Teal**: Modern teal palette
- **Red**: Bold red accents
- **Yellow**: Bright yellow highlights

### Custom Theme Colors
The design system uses dynamic CSS custom properties:
```css
:root {
  --ai-primary: #3b82f6;
  --ai-secondary: #06b6d4;
  --ai-accent: #60a5fa;
  --ai-dark: #0f172a;
  --ai-darker: #020617;
}
```

### Component Customization
- **Glass Morphism**: Adjustable backdrop blur and opacity
- **Gradients**: Dynamic gradient generation
- **Animations**: Smooth transitions with Framer Motion
- **Typography**: Custom font weights and spacing

### Settings Panel Features
- **Theme Selection**: Live theme preview
- **Personality Settings**: AI behavior customization
- **Model Selection**: Choose between different AI models
- **Privacy Controls**: Data sharing and storage preferences
- **Accessibility**: High contrast and large text options

## 🔧 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android 10+
- **Features**: CSS Grid, Flexbox, CSS Custom Properties, Backdrop Filter, Web APIs

## 📱 Responsive Design

- **Desktop**: Full sidebar with enhanced features and analytics
- **Tablet**: Adaptive layout with collapsible sidebar and touch controls
- **Mobile**: Mobile-optimized interface with gesture support

## 🎭 Animation & Interactions

- **Message Streaming**: Real-time AI response animations
- **Loading States**: Animated thinking indicators and progress bars
- **Hover Effects**: Interactive elements with smooth transitions
- **Theme Transitions**: Smooth color and style transitions
- **Micro-interactions**: Button clicks, form interactions, and feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level access control
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: Sanitized user inputs and outputs
- **CSRF Protection**: Cross-site request forgery prevention

## 📊 Performance Optimizations

- **Code Splitting**: Dynamic imports for optimal loading
- **Image Optimization**: Compressed and lazy-loaded images
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Intelligent caching strategies
- **Virtual Scrolling**: Efficient large list rendering

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-api.com
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
```

## 🧪 Testing

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Adarsh Kumar Vishwakarma**
- Email: adarshvish2606@gmail.com
- GitHub: [Adarsh-Kumar-Vishwakarma](https://github.com/Adarsh-Kumar-Vishwakarma)
- LinkedIn: [Adarsh Kumar Vishwakarma](https://www.linkedin.com/in/adarsh-kumar-vishwakarma-6ba71a192/)

---

**Built with ❤️ using React, TypeScript, and AI Integration**
