import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {
  Send,
  Bot as AIIcon,
  User as UserIcon,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Settings2,
  Volume2,
  VolumeX,
  Globe,
  Copy,
  Edit3,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { ImageProcessingService } from '@/services/imageProcessingService';
import SettingsPanel from './SettingsPanel';

// =====================
// Types
// =====================
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'AI';
  timestamp: string;
  isAI?: boolean;
  imageUrl?: string; // Add image URL for display
  isStreaming?: boolean; // For streaming messages
  liked?: boolean;
  disliked?: boolean;
  meta?: {
    defenseQuality?: 'low' | 'medium' | 'high';
    hallucinationRisk?: 'low' | 'medium' | 'high';
    tone?: 'friendly' | 'logical' | 'playful' | 'confident';
    taskType?: string; // Added for task type
  };
}

interface Analytics {
  totalMessages: number;
  userMessages: number;
  AIMessages: number;
  popularTopics: { [key: string]: number };
  sessionStart: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastModified: string;
}

// Define the interface for the component props
interface AIchatProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  onSidebarThemeChange?: (enabled: boolean) => void;
  onThemeChange?: (theme: string) => void;
}

// =====================
// Component
// =====================
function AIchat({
  showSettings,
  setShowSettings,
  showPreferences,
  setShowPreferences,
  showAnalytics,
  setShowAnalytics,
  onSidebarThemeChange,
  onThemeChange
}: AIchatProps) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `🚀 **Welcome to Adiva AI!** 

I'm your advanced AI assistant, ready to help you with any task. Here's what I can do:

**💻 Programming & Development**
• Write code in any language • Debug and optimize • Web development • Data science

**✍️ Writing & Communication**
• Essays and reports • Professional emails • Creative content • Technical documentation

**🔍 Analysis & Problem Solving**
• Data analysis • Mathematical solutions • Research assistance • Business strategy

**🎨 Creative & Design**
• Brainstorming ideas • Design concepts • Marketing strategies • Innovation

**📚 Learning & Education**
• Step-by-step tutorials • Concept explanations • Study guides • Skill development

**What would you like to work on today?** Just ask, and I'll provide comprehensive, helpful assistance!`,
    sender: 'AI',
    timestamp: new Date().toISOString(),
    isAI: true,
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [backendAnalytics, setBackendAnalytics] = useState<any>(null);
  const [defensiveMode, setDefensiveMode] = useState(false);
  const [personality, setPersonality] = useState<'friendly' | 'logical' | 'playful' | 'confident'>('friendly');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('current');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true); // Enable by default for testing
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('ocean');
  const [sidebarThemeEnabled, setSidebarThemeEnabled] = useState<boolean>(false);
  const [messageActions, setMessageActions] = useState<{ [messageId: string]: boolean }>({});
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [availableLanguages] = useState<Array<{ code: string, name: string }>>([
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' }
  ]);

  const availableThemes = [
    {
      id: 'ocean',
      name: 'Ocean',
      primary: 'from-blue-500',
      secondary: 'to-cyan-500',
      accent: 'blue',
      primaryColor: '#3b82f6',
      secondaryColor: '#06b6d4',
      accentColor: '#60a5fa'
    },
    {
      id: 'indigo',
      name: 'Indigo',
      primary: 'from-indigo-500',
      secondary: 'to-purple-500',
      accent: 'indigo',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4'
    },
    {
      id: 'blue',
      name: 'Blue',
      primary: 'from-blue-500',
      secondary: 'to-cyan-500',
      accent: 'blue',
      primaryColor: '#3b82f6',
      secondaryColor: '#f59e0b',
      accentColor: '#ec4899'
    },
    {
      id: 'green',
      name: 'Green',
      primary: 'from-green-500',
      secondary: 'to-emerald-500',
      accent: 'green',
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      accentColor: '#06b6d4'
    },
    {
      id: 'purple',
      name: 'Purple',
      primary: 'from-purple-500',
      secondary: 'to-pink-500',
      accent: 'purple',
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      accentColor: '#a855f7'
    },
    {
      id: 'orange',
      name: 'Orange',
      primary: 'from-orange-500',
      secondary: 'to-amber-500',
      accent: 'orange',
      primaryColor: '#f97316',
      secondaryColor: '#f59e0b',
      accentColor: '#fb923c'
    },
    {
      id: 'teal',
      name: 'Teal',
      primary: 'from-teal-500',
      secondary: 'to-cyan-500',
      accent: 'teal',
      primaryColor: '#14b8a6',
      secondaryColor: '#f59e0b',
      accentColor: '#ec4899'
    },
    {
      id: 'red',
      name: 'Red',
      primary: 'from-red-500',
      secondary: 'to-pink-500',
      accent: 'red',
      primaryColor: '#ef4444',
      secondaryColor: '#ec4899',
      accentColor: '#f87171'
    },
    {
      id: 'yellow',
      name: 'Yellow',
      primary: 'from-yellow-500',
      secondary: 'to-orange-500',
      accent: 'yellow',
      primaryColor: '#eab308',
      secondaryColor: '#f59e0b',
      accentColor: '#fbbf24'
    }
  ];
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Image processing
  const {
    selectedImage,
    imagePreview,
    isUploading: isUploadingImage,
    handleImageSelect,
    handleImageRemove,
    setUploading: setUploadingImage,
    reset: resetImage
  } = useImageProcessing();

  // Image preview popup state
  const [showImagePopup, setShowImagePopup] = useState(false);

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImagePopup) {
        setShowImagePopup(false);
      }
    };

    if (showImagePopup) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showImagePopup]);

  // Analytics
  const [analytics, setAnalytics] = useState<Analytics>(() => ({
    totalMessages: 0,
    userMessages: 0,
    AIMessages: 0,
    popularTopics: {},
    sessionStart: new Date().toISOString(),
  }));

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatAIRef = useRef<HTMLDivElement>(null);

  // =====================
  // Helpers: UI
  // =====================

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatAIRef.current && !chatAIRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('chatAI-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('chatAI-open');
    };
  }, [isOpen]);

  // Speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // Speech synthesis
  useEffect(() => {
    console.log('🎤 Initializing speech synthesis...');
    if ('speechSynthesis' in window) {
      synthesisRef.current = new SpeechSynthesisUtterance();
      synthesisRef.current.rate = 0.95;
      synthesisRef.current.pitch = 1;
      synthesisRef.current.volume = 0.9;
      synthesisRef.current.lang = selectedLanguage;
      console.log('🎤 Speech synthesis initialized with language:', selectedLanguage);
    } else {
      console.error('❌ Speech synthesis not supported in this browser');
    }
  }, [selectedLanguage]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, language?: string) => {
    console.log('🎤 speakText called with:', { text: text.substring(0, 50) + '...', language, selectedLanguage });

    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported in this browser');
      alert('Speech synthesis is not supported in your browser');
      return;
    }

    if (!synthesisRef.current) {
      console.error('❌ Speech synthesis not initialized');
      alert('Speech synthesis not initialized');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create a new utterance for each speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      utterance.lang = language || selectedLanguage;

      utterance.onstart = () => {
        console.log('🎤 Speech started');
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log('🎤 Speech ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsSpeaking(false);
        alert(`Speech error: ${event.error}`);
      };

      console.log('🎤 Starting speech with language:', utterance.lang);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Speech synthesis error:', error);
      setIsSpeaking(false);
      alert('Error starting speech synthesis');
    }
  };

  const stopSpeaking = () => {
    console.log('🛑 stopSpeaking called');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('🛑 Speech stopped');
    }
  };

  // =====================
  // Analytics helpers
  // =====================
  const updateAnalytics = (message: string, sender: 'user' | 'AI') => {
    setAnalytics((prev) => {
      const next = { ...prev };
      next.totalMessages++;
      if (sender === 'user') {
        next.userMessages++;
        const topics = [
          'code', 'program', 'script', 'function', 'algorithm', 'debug', 'fix', 'optimize',
          'write', 'essay', 'article', 'story', 'email', 'letter', 'report', 'blog',
          'analyze', 'explain', 'compare', 'evaluate', 'review', 'assess', 'examine',
          'calculate', 'solve', 'equation', 'math', 'statistics', 'probability', 'formula',
          'create', 'design', 'imagine', 'brainstorm', 'idea', 'creative', 'art',
          'learn', 'teach', 'tutorial', 'guide', 'how to', 'step by step', 'explain',
          'research', 'study', 'investigate', 'explore', 'discover', 'understand'
        ];
        topics.forEach((topic) => {
          if (message.toLowerCase().includes(topic)) {
            next.popularTopics[topic] = (next.popularTopics[topic] || 0) + 1;
          }
        });
      } else next.AIMessages++;
      return next;
    });
  };

  const getPopularTopics = () =>
    Object.entries(analytics.popularTopics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ name: topic, value: count }));

  // Persist analytics in localStorage (optional)
  useEffect(() => {
    try {
      localStorage.setItem("chatAI_analytics", JSON.stringify(analytics));
    } catch { }
  }, [analytics]);

  // Load recent chats from localStorage on component mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("chatAI_recentChats");
      if (savedChats) {
        setRecentChats(JSON.parse(savedChats));
      }
    } catch { }
  }, []);

  // Load available AI models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai-models');
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    loadModels();
  }, []);

  // Detect user's preferred language from browser
  useEffect(() => {
    const userLanguage = navigator.language || 'en-US';
    const detectedLanguage = availableLanguages.find(lang =>
      lang.code === userLanguage ||
      lang.code.startsWith(userLanguage.split('-')[0])
    );
    if (detectedLanguage) {
      setSelectedLanguage(detectedLanguage.code);
    }
  }, [availableLanguages]);

  // Load backend analytics
  useEffect(() => {
    const loadBackendAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analytics/overview');
        if (response.ok) {
          const data = await response.json();
          setBackendAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to load backend analytics:', error);
      }
    };

    // Load immediately
    loadBackendAnalytics();

    // Refresh every 5 seconds
    const interval = setInterval(loadBackendAnalytics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Set initialization flag after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Wait 1 second after mount

    return () => clearTimeout(timer);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const currentTheme = availableThemes.find(t => t.id === selectedTheme);
    if (!currentTheme) return;

    // Remove all existing theme classes
    document.body.classList.remove('theme-ocean', 'theme-indigo', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-teal', 'theme-red', 'theme-yellow');

    // Add current theme class
    document.body.classList.add(`theme-${selectedTheme}`);

    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--ai-primary', currentTheme.primaryColor);
    root.style.setProperty('--ai-secondary', currentTheme.secondaryColor);
    root.style.setProperty('--ai-accent', currentTheme.accentColor);

    // Save theme preference to localStorage
    try {
      localStorage.setItem('chatAI_theme', selectedTheme);
    } catch { }

    // Notify parent component about theme change
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
  }, [selectedTheme, availableThemes, onThemeChange]);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('chatAI_theme');
      if (savedTheme && availableThemes.some(t => t.id === savedTheme)) {
        setSelectedTheme(savedTheme);
      }

      const savedSidebarTheme = localStorage.getItem('chatAI_sidebarTheme');
      if (savedSidebarTheme !== null) {
        setSidebarThemeEnabled(savedSidebarTheme === 'true');
      }
    } catch { }
  }, []);

  // Save recent chats to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("chatAI_recentChats", JSON.stringify(recentChats));
    } catch (error) {
      console.error('Failed to save recent chats:', error);
    }
  }, [recentChats]);

  // Auto-save current conversation
  useEffect(() => {
    const autoSave = () => {
      if (isInitialized && messages.length > 1) {
        saveCurrentChat();
      }
    };

    // Auto-save every 30 seconds
    const interval = setInterval(autoSave, 30000);
    
    // Auto-save when component unmounts
    return () => {
      clearInterval(interval);
      autoSave();
    };
  }, [isInitialized, messages, currentChatId]);

  // Save sidebar theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatAI_sidebarTheme', sidebarThemeEnabled.toString());
    } catch { }

    // Notify parent component about sidebar theme change
    if (onSidebarThemeChange) {
      onSidebarThemeChange(sidebarThemeEnabled);
    }
  }, [sidebarThemeEnabled, onSidebarThemeChange]);

  // Get current theme colors
  const getCurrentTheme = () => {
    return availableThemes.find(t => t.id === selectedTheme) || availableThemes[0];
  };


  // Listen for new chat events from the sidebar
  useEffect(() => {
    const handleNewChat = () => {
      startNewChat();
    };

    window.addEventListener('startNewChat', handleNewChat);
    return () => {
      window.removeEventListener('startNewChat', handleNewChat);
    };
  }, []);

  // Add global functions for chat options dropdown
  useEffect(() => {
    // Add global functions to window object
    (window as any).toggleChatOptions = (chatId: string) => {
      // Hide all other dropdowns first
      document.querySelectorAll('[id^="chat-options-"]').forEach(el => {
        if (el.id !== `chat-options-${chatId}`) {
          el.classList.add('hidden');
        }
      });
      
      // Small delay to ensure proper state management
      setTimeout(() => {
        const dropdown = document.getElementById(`chat-options-${chatId}`);
        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      }, 10);
    };

    (window as any).hideChatOptions = (chatId: string) => {
      const dropdown = document.getElementById(`chat-options-${chatId}`);
      if (dropdown) {
        dropdown.classList.add('hidden');
      }
    };

    // Hide dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isDropdown = target.closest('[id^="chat-options-"]');
      const isOptionsButton = target.closest('button[onclick*="toggleChatOptions"]');
      
      if (!isDropdown && !isOptionsButton) {
        document.querySelectorAll('[id^="chat-options-"]').forEach(el => {
          el.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      delete (window as any).toggleChatOptions;
      delete (window as any).hideChatOptions;
    };
  }, []);

  // Update sidebar with recent chats
  useEffect(() => {
    const updateSidebar = () => {
      const container = document.getElementById('recent-chats-container');
      if (container) {
        container.innerHTML = '';

        if (recentChats.length === 0) {
          container.innerHTML = `
             <div class="glass-dark border border-white/10 rounded-xl p-6 text-center">
               <div class="text-blue-300 text-sm font-medium">No recent chats</div>
               <div class="text-blue-400 text-xs mt-1">Start a new conversation to see it here</div>
            </div>
          `;
          return;
        }

        recentChats.forEach(chat => {
          const chatElement = document.createElement('div');
          chatElement.className = `group relative glass-dark border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all duration-300 ${chat.id === currentChatId ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/30 shadow-lg' : ''
            }`;

          const title = chat.title || 'Untitled Chat';
          const date = new Date(chat.lastModified).toLocaleDateString();

          chatElement.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                 <div class="truncate text-white font-medium text-sm">${title}</div>
                 <div class="text-xs text-blue-300 mt-1">${date}</div>
              </div>
               <div class="relative">
              <button 
                   class="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
                   onclick="toggleChatOptions('${chat.id}')"
                 >
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                   </svg>
                 </button>
                 
                 <div id="chat-options-${chat.id}" class="hidden absolute right-0 top-full mt-2 w-36 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden transform translate-x-10">
                   <div>
                     <button 
                       class="w-full px-2 py-1 text-left text-sm text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-3 group"
                       onclick="window.dispatchEvent(new CustomEvent('downloadChat', { detail: '${chat.id}' })); hideChatOptions('${chat.id}')"
                     >
                       <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                         <svg class="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                         </svg>
                       </div>
                       <div>
                         <div class="text-white font-medium">Download</div>
                       </div>
                     </button>
                     <div class="h-px bg-white/10 mx-2 my-1"></div>
                     <button 
                       class="w-full px-2 py-1 text-left text-sm text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-3 group"
                       onclick="window.dispatchEvent(new CustomEvent('deleteChat', { detail: '${chat.id}' })); hideChatOptions('${chat.id}')"
                     >
                       <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-200">
                         <svg class="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                       </div>
                       <div>
                         <div class="text-white font-medium">Delete</div>
                       </div>
              </button>
                   </div>
                 </div>
               </div>
            </div>
          `;

          chatElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).closest('button')) {
              loadChat(chat.id);
            }
          });

          container.appendChild(chatElement);
        });
      }
    };

    updateSidebar();
  }, [recentChats, currentChatId]);

  // Listen for delete chat events
  useEffect(() => {
    const handleDeleteChat = (event: CustomEvent) => {
      deleteChat(event.detail);
    };

    window.addEventListener('deleteChat', handleDeleteChat as EventListener);
    return () => {
      window.removeEventListener('deleteChat', handleDeleteChat as EventListener);
    };
  }, []);

  // Listen for download chat events
  useEffect(() => {
    const handleDownloadChat = (event: CustomEvent) => {
      downloadSpecificChat(event.detail);
    };

    window.addEventListener('downloadChat', handleDownloadChat as EventListener);
    return () => {
      window.removeEventListener('downloadChat', handleDownloadChat as EventListener);
    };
  }, []);

  // Remove old event handling - now using props directly

  // Remove old event handling - now using props directly

  // Remove old event handling - now using props directly



  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is on sidebar analytics button - if so, don't close analytics panel
      const isAnalyticsButton = target.closest('[data-analytics-toggle="true"]');

      if (showSettings && !target.closest('.settings-panel')) {
        setShowSettings(false);
      }
      if (showPreferences && !target.closest('.preferences-panel')) {
        setShowPreferences(false);
      }
      if (showAnalytics && !target.closest('.analytics-panel') && !isAnalyticsButton) {
        setShowAnalytics(false);
      }
      
      // Close message action dropdowns when clicking outside
      if (!target.closest('[data-message-actions]')) {
        setMessageActions({});
      }
    };

      document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, showPreferences, showAnalytics]);

  // =====================
  // Chat Management Functions
  // =====================
  const generateChatTitle = (messages: Message[]): string => {
    // Find the first user message to use as title
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.text.trim();
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    return 'New Chat';
  };

  const saveCurrentChat = () => {
    // Don't save during initialization or if no user messages
    if (!isInitialized) return;

    const hasUserMessages = messages.some(m => m.sender === 'user');

    if (hasUserMessages) {
      const chatTitle = generateChatTitle(messages);
      const chatSession: ChatSession = {
        id: currentChatId,
        title: chatTitle,
        messages: [...messages],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setRecentChats(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
        if (existingIndex >= 0) {
          // Update existing chat
          const updated = [...prev];
          updated[existingIndex] = chatSession;
          return updated;
        } else {
          // Add new chat
          return [chatSession, ...prev].slice(0, 10); // Keep only 10 recent chats
        }
      });
    }
  };

  const startNewChat = () => {
    // Only save current chat if it has user messages
    const hasUserMessages = messages.some(m => m.sender === 'user');
    if (hasUserMessages) {
      saveCurrentChat();
    }

    // Create new chat
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);

    // Reset messages to welcome message
    setMessages([{
      id: '1',
      text: `🚀 **Welcome to Adiva AI!** 

I'm your advanced AI assistant, ready to help you with any task. Here's what I can do:

**💻 Programming & Development**
• Write code in any language • Debug and optimize • Web development • Data science

**✍️ Writing & Communication**
• Essays and reports • Professional emails • Creative content • Technical documentation

**🔍 Analysis & Problem Solving**
• Data analysis • Mathematical solutions • Research assistance • Business strategy

**🎨 Creative & Design**
• Brainstorming ideas • Design concepts • Marketing strategies • Innovation

**📚 Learning & Education**
• Step-by-step tutorials • Concept explanations • Study guides • Skill development

**What would you like to work on today?** Just ask, and I'll provide comprehensive, helpful assistance!`,
      sender: 'AI',
      timestamp: new Date().toISOString(),
      isAI: true,
    }]);

    // Reset analytics
    setAnalytics({
      totalMessages: 0,
      userMessages: 0,
      AIMessages: 0,
      popularTopics: {},
      sessionStart: new Date().toISOString(),
    });

    // Clear input and states
    setInputValue('');
    setIsTyping(false);
    setError(null);
    setRetryCount(0);
  };

  const loadChat = (chatId: string) => {
    // Only save current chat if it has user messages
    const hasUserMessages = messages.some(m => m.sender === 'user');
    if (hasUserMessages) {
      saveCurrentChat();
    }

    const chatToLoad = recentChats.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setCurrentChatId(chatId);
      setMessages(chatToLoad.messages);

      // Recalculate analytics for loaded chat
      const userMessages = chatToLoad.messages.filter(m => m.sender === 'user').length;
      const aiMessages = chatToLoad.messages.filter(m => m.sender === 'AI').length;
      const totalMessages = chatToLoad.messages.length;

      // Recalculate popular topics
      const topics: { [key: string]: number } = {};
      chatToLoad.messages.forEach(m => {
        if (m.sender === 'user') {
          const topicKeywords = [
            'code', 'program', 'script', 'function', 'algorithm', 'debug', 'fix', 'optimize',
            'write', 'essay', 'article', 'story', 'email', 'letter', 'report', 'blog',
            'analyze', 'explain', 'compare', 'evaluate', 'review', 'assess', 'examine',
            'calculate', 'solve', 'equation', 'math', 'statistics', 'probability', 'formula',
            'create', 'design', 'imagine', 'brainstorm', 'idea', 'creative', 'art',
            'learn', 'teach', 'tutorial', 'guide', 'how to', 'step by step', 'explain',
            'research', 'study', 'investigate', 'explore', 'discover', 'understand'
          ];
          topicKeywords.forEach((topic) => {
            if (m.text.toLowerCase().includes(topic)) {
              topics[topic] = (topics[topic] || 0) + 1;
            }
          });
        }
      });

      setAnalytics({
        totalMessages,
        userMessages,
        AIMessages: aiMessages,
        popularTopics: topics,
        sessionStart: chatToLoad.createdAt,
      });

      // Clear input and states
      setInputValue('');
      setIsTyping(false);
      setError(null);
      setRetryCount(0);
    }
  };

  const deleteChat = (chatId: string) => {
    setRecentChats(prev => prev.filter(chat => chat.id !== chatId));

    // If we're deleting the current chat, start a new one
    if (chatId === currentChatId) {
      startNewChat();
    }
  };

  // =====================
  // AI Response Generation
  // =====================
  const detectChallenge = (text: string) => {
    const t = text.toLowerCase();
    const triggers = ['defend', 'why', 'how is that', "i disagree", 'not true', 'prove', 'evidence', 'source'];
    return triggers.some((w) => t.includes(w));
  };

  const detectTaskType = (text: string) => {
    const t = text.toLowerCase();

    // Code-related tasks - enhanced detection
    if (t.includes('code') || t.includes('program') || t.includes('script') || t.includes('function') ||
      t.includes('algorithm') || t.includes('debug') || t.includes('fix') || t.includes('optimize') ||
      t.includes('java') || t.includes('python') || t.includes('javascript') || t.includes('c++') ||
      t.includes('c#') || t.includes('php') || t.includes('html') || t.includes('css') ||
      t.includes('sql') || t.includes('react') || t.includes('node') || t.includes('api') ||
      t.includes('write a program') || t.includes('create a program') || t.includes('implement') ||
      t.includes('class') || t.includes('method') || t.includes('variable') || t.includes('loop') ||
      t.includes('array') || t.includes('string') || t.includes('integer') || t.includes('boolean') ||
      t.includes('duplicate') || t.includes('find') || t.includes('search') || t.includes('sort') ||
      t.includes('reverse') || t.includes('swap') || t.includes('fibonacci') || t.includes('prime') ||
      t.includes('factorial') || t.includes('bubble sort') || t.includes('quick sort') ||
      t.includes('binary search') || t.includes('linked list') || t.includes('stack') ||
      t.includes('queue') || t.includes('tree') || t.includes('graph') || t.includes('hash') ||
      t.includes('recursion') || t.includes('iteration') || t.includes('optimization')) {
      return 'coding';
    }

    // Writing tasks
    if (t.includes('write') || t.includes('essay') || t.includes('article') || t.includes('story') ||
      t.includes('email') || t.includes('letter') || t.includes('report') || t.includes('blog')) {
      return 'writing';
    }

    // Analysis tasks
    if (t.includes('analyze') || t.includes('explain') || t.includes('compare') || t.includes('evaluate') ||
      t.includes('review') || t.includes('assess') || t.includes('examine')) {
      return 'analysis';
    }

    // Math tasks
    if (t.includes('calculate') || t.includes('solve') || t.includes('equation') || t.includes('math') ||
      t.includes('statistics') || t.includes('probability') || t.includes('formula')) {
      return 'math';
    }

    // Creative tasks
    if (t.includes('create') || t.includes('design') || t.includes('imagine') || t.includes('brainstorm') ||
      t.includes('idea') || t.includes('creative') || t.includes('art')) {
      return 'creative';
    }

    // Learning/Education
    if (t.includes('learn') || t.includes('teach') || t.includes('tutorial') || t.includes('guide') ||
      t.includes('how to') || t.includes('step by step') || t.includes('explain')) {
      return 'education';
    }

    return 'general';
  };

  const buildSystemPrompt = () => `
You are an advanced AI assistant with comprehensive capabilities across multiple domains. You can help with:

**Technical Skills:**
- Programming in all major languages (Python, JavaScript, Java, C++, etc.)
- Web development (frontend, backend, full-stack)
- Data science and machine learning
- Database design and optimization
- System architecture and DevOps
- Mobile app development
- Game development

**Writing & Communication:**
- Creative writing (stories, poems, scripts)
- Professional writing (emails, reports, proposals)
- Academic writing (essays, research papers)
- Content creation (blogs, articles, social media)
- Technical documentation
- Translation and language learning

**Analysis & Problem Solving:**
- Data analysis and visualization
- Mathematical problem solving
- Logical reasoning and critical thinking
- Research and fact-checking
- Business analysis and strategy
- Scientific explanations

**Creative & Design:**
- Brainstorming and ideation
- Design concepts and mockups
- Creative problem solving
- Art and music concepts
- Marketing and branding ideas

**Education & Learning:**
- Tutoring in any subject
- Step-by-step explanations
- Study guides and summaries
- Quiz and test preparation
- Skill development guidance

**Formatting Guidelines:**
- ALWAYS use proper markdown formatting
- Use code blocks with syntax highlighting for all code
- Use headers (##, ###) to structure your responses
- Use bullet points and numbered lists for clarity
- Use tables when presenting structured data
- Use blockquotes for important notes or warnings
- Use bold and italic text for emphasis

**Behavioral Guidelines:**
- Persona: ${personality} but always professional and helpful
- Provide accurate, well-researched information
- When coding, include comments and explanations
- For complex topics, break down into digestible parts
- Always consider best practices and current standards
- If uncertain, acknowledge limitations and suggest alternatives
- Be encouraging and supportive in learning scenarios
- Maintain ethical standards and safety guidelines
- In defensive mode, provide thorough reasoning and evidence
- Use appropriate formatting (code blocks, lists, tables) when helpful
`;

  const buildUserPrompt = (userMessage: string, wantDefense: boolean, taskType: string) => `
Task: Provide a comprehensive, helpful response to the user's request.

Task Type Detected: ${taskType}

User Message: """${userMessage}"""

Instructions:
- If this is a coding task, provide complete, working code with explanations
- If this is a writing task, create high-quality, well-structured content
- If this is an analysis task, provide thorough analysis with supporting reasoning
- If this is a math task, show step-by-step solutions
- If this is a creative task, provide imaginative and innovative ideas
- If this is an education task, create clear, educational explanations
- For any task, be comprehensive and detailed

Return STRICT JSON with keys:
  answer: string (complete response with proper formatting),
  defense: string (reasoning and methodology; empty if not needed),
  hallucination_risk: 'low'|'medium'|'high',
  defense_quality: 'low'|'medium'|'high',
  tone: 'friendly'|'logical'|'playful'|'confident',
  task_type: string (coding|writing|analysis|math|creative|education|general)

${wantDefense ? 'Include detailed defense and methodology.' : 'Include defense only if helpful.'}
Ensure the JSON is valid. No Markdown, no backticks.`;

  const callAIJSON = async (systemPrompt: string, userPrompt: string, useStreaming = true) => {
    try {
      console.log('🔄 Calling AI API...', { userPrompt: userPrompt.substring(0, 100) + '...', modelId: selectedModel, useStreaming });

      if (useStreaming) {
        return await callAIStream(systemPrompt, userPrompt);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userPrompt,
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          conversationId: currentChatId,
          modelId: selectedModel
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`AI API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      // Track analytics
      if (data.usage) {
        trackAnalytics('tokens_used', { tokens: data.usage.totalTokens });
      }

      // Handle different response formats
      if (data && typeof data.reply === 'string') {
        console.log('📝 Using reply field:', data.reply.substring(0, 100) + '...');
        return data.reply;
      } else if (data && typeof data.response === 'string') {
        console.log('📝 Using response field:', data.response.substring(0, 100) + '...');
        return data.response;
      } else if (data && typeof data.message === 'string') {
        console.log('📝 Using message field:', data.message.substring(0, 100) + '...');
        return data.message;
      } else {
        console.warn('⚠️ No valid response field found in API response:', data);
        return 'I apologize, but I received an unexpected response format. Please try again.';
      }
    } catch (e) {
      console.error('💥 callAIJSON Error:', e);
      trackAnalytics('error_occurred', { error: e instanceof Error ? e.message : 'Unknown error' });
      return '';
    }
  };

  const callAIStream = async (systemPrompt: string, userPrompt: string) => {
    try {
      console.log('🔄 Starting streaming AI call...');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userPrompt,
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          conversationId: currentChatId,
          modelId: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error(`Streaming API call failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let usage = null;

      if (!reader) {
        throw new Error('No response body reader available');
      }

      return new Promise((resolve, reject) => {
        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                console.log('✅ Streaming completed');
                resolve(fullResponse);
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'content') {
                      fullResponse += data.content;
                      // Update the last AI message with streaming content
                      setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.sender === 'AI' && lastMessage.isStreaming) {
                          lastMessage.text = fullResponse;
                        }
                        return newMessages;
                      });
                    } else if (data.type === 'done') {
                      usage = data.usage;
                      // Mark streaming as complete
                      setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.sender === 'AI') {
                          lastMessage.isStreaming = false;
                        }
                        return newMessages;
                      });
                      
                      // Track analytics
                      if (usage) {
                        trackAnalytics('tokens_used', { tokens: usage.total_tokens });
                      }
                      
                      resolve(fullResponse);
                      return;
                    } else if (data.type === 'error') {
                      console.error('❌ Streaming error:', data.content);
                      reject(new Error(data.content));
                      return;
                    }
                  } catch (parseError) {
                    console.error('❌ Error parsing streaming data:', parseError);
                  }
                }
              }
            }
          } catch (streamError) {
            console.error('❌ Streaming process error:', streamError);
            reject(streamError);
          }
        };

        processStream();
      });

    } catch (e) {
      console.error('💥 callAIStream Error:', e);
      trackAnalytics('error_occurred', { error: e instanceof Error ? e.message : 'Unknown error' });
      throw e;
    }
  };

  const safeParse = <T,>(raw: string, fallback: T): T => {
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  };

  const generateResponse = async (userMessage: string) => {
    console.log('🚀 Starting generateResponse for:', userMessage.substring(0, 50) + '...');
    const wantDefense = defensiveMode || detectChallenge(userMessage);
    const taskType = detectTaskType(userMessage);
    console.log('📋 Detected task type:', taskType);
    
    // For coding tasks, use a different approach to get better formatted responses
    if (taskType === 'coding') {
      console.log('💻 Using coding response handler');
      return await generateCodingResponse(userMessage, wantDefense, taskType);
    }
    
    const sys = buildSystemPrompt();
    const u1 = buildUserPrompt(userMessage, wantDefense, taskType);

    console.log('📡 Calling AI API...');
    // Use regular API call for non-coding tasks to avoid blank responses
    const raw1 = await callAIJSON(sys, u1, false);
    console.log('📝 Raw response length:', raw1 ? raw1.length : 0);
    console.log('📝 Raw response preview:', raw1 ? raw1.substring(0, 200) + '...' : 'EMPTY');
    
    // Parse it as JSON if possible, otherwise use as plain text
    let draft;
    try {
      draft = JSON.parse(raw1 as string);
      console.log('✅ Successfully parsed JSON response');
    } catch {
      console.log('⚠️ Failed to parse JSON, using as plain text');
      // If not JSON, treat as plain text response
      return {
        text: raw1 as string,
        meta: {
          defenseQuality: 'medium' as const,
          hallucinationRisk: 'low' as const,
      tone: personality,
          taskType: taskType
        },
      };
    }

    // If the API did not return the requested JSON, provide a fallback
    if (!draft.answer) {
      console.log('⚠️ No answer field in JSON response, using fallback');
      return {
        text: "I'm here to help with any task! Whether you need coding help, writing assistance, analysis, math solutions, creative ideas, or educational guidance, I'm ready to assist. What would you like to work on?",
        meta: {
          defenseQuality: 'low' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: taskType
        },
      };
    }

    // Optional Pass 2: self-critique to strengthen response
    let final = draft;
    if (wantDefense || taskType === 'analysis') {
      console.log('🔄 Running self-critique...');
      const critiquePrompt = `You wrote this response: ${JSON.stringify(draft)}\nImprove the response: make it more comprehensive, accurate, and helpful. For analysis, provide deeper insights. Return the SAME JSON shape only.`;
      const raw2 = await callAIJSON(sys, critiquePrompt, false);
      const improved = safeParse<typeof draft>(raw2, draft);
      final = improved;
    }

    const finalText = [final.answer, final.defense ? `\n\n🛡️ Methodology:\n${final.defense}` : ''].join('');
    console.log('✅ Final response length:', finalText.length);
    console.log('✅ Final response preview:', finalText.substring(0, 200) + '...');

    return {
      text: finalText,
      meta: {
        defenseQuality: final.defense_quality,
        hallucinationRisk: final.hallucination_risk,
        tone: final.tone || personality,
        taskType: final.task_type || taskType,
      },
    };
  };

  const generateCodingResponse = async (userMessage: string, _wantDefense: boolean, taskType: string) => {
    console.log('💻 Starting generateCodingResponse for:', userMessage.substring(0, 50) + '...');
    
    const codingPrompt = `You are an expert programming assistant. When providing code solutions, always:

1. Use proper markdown formatting with code blocks
2. Include syntax highlighting for the programming language
3. Provide clear explanations before and after the code
4. Include example usage and output
5. Add comments in the code for clarity
6. Use proper markdown headers and structure

User Request: ${userMessage}

Please provide a comprehensive response with:
- Clear explanation of the approach
- Well-formatted code with syntax highlighting
- Example usage
- Output explanation
- Time/space complexity analysis if applicable

Format your response using proper markdown with code blocks.`;

    try {
      console.log('📡 Calling AI API for coding response...');
      // Use regular API call for coding responses to avoid blank responses
      const response = await callAIJSON(codingPrompt, userMessage, false);
      console.log('📝 Coding response length:', response ? response.length : 0);
      console.log('📝 Coding response preview:', response ? response.substring(0, 200) + '...' : 'EMPTY');
      
      return {
        text: response as string,
        meta: {
          defenseQuality: 'high' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: taskType
        },
      };
    } catch (error) {
      console.error('❌ Coding response generation error:', error);
      return {
        text: "I apologize, but I encountered an error while generating the coding response. Please try again.",
        meta: {
          defenseQuality: 'low' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: taskType
        },
      };
    }
  };

  const generateResponseWithImage = async (userMessage: string, imageFile: File) => {
    try {
      console.log('🔄 Processing image with AI...');

      const response = await ImageProcessingService.processImage({
        image: imageFile,
        message: userMessage,
        systemPrompt: buildSystemPrompt(),
        conversationId: currentChatId,
        modelId: selectedModel
      });

      return {
        text: response.reply,
        meta: {
          defenseQuality: 'medium' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: 'image_analysis'
        }
      };
    } catch (error) {
      console.error('💥 Image processing error:', error);
      return {
        text: 'Sorry, I encountered an error while processing the image. Please try again.',
        meta: {
          defenseQuality: 'low' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: 'image_analysis'
        }
      };
    }
  };

  // =====================
  // Messaging logic
  // =====================
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      imageUrl: selectedImage ? imagePreview || undefined : undefined,
    };

    // Create new messages array with the user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateAnalytics(inputValue, 'user');
    setInputValue('');
    setIsTyping(true);

    // Save chat immediately with the updated messages
    if (isInitialized) {
      const chatTitle = generateChatTitle(updatedMessages);
      const chatSession: ChatSession = {
        id: currentChatId,
        title: chatTitle,
        messages: updatedMessages,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setRecentChats(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
        if (existingIndex >= 0) {
          // Update existing chat
          const updated = [...prev];
          updated[existingIndex] = chatSession;
          return updated;
        } else {
          // Add new chat
          return [chatSession, ...prev].slice(0, 10); // Keep only 10 recent chats
        }
      });
    }

    let responseText = '';
    let responseMeta = {};

    // Create initial AI message with "AI is thinking..." text
    const AIMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'AI is thinking...',
      sender: 'AI',
      timestamp: new Date().toISOString(),
      isAI: true,
      isStreaming: true,
      meta: {
        defenseQuality: 'medium' as const,
        hallucinationRisk: 'low' as const,
        tone: personality,
        taskType: 'general'
      },
    };

    // Add the streaming message immediately
    setMessages((prev) => [...prev, AIMessage]);

    // Handle image + text or image only
    if (selectedImage) {
      console.log('🔄 Starting image processing...');
      setUploadingImage(true);

      // Add a small delay to ensure the loader shows
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const response = await generateResponseWithImage(inputValue || 'What do you see in this image?', selectedImage);
        responseText = response.text;
        responseMeta = response.meta;
        console.log('✅ Image processing completed successfully');
        
        // Update the streaming message with the complete response
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'AI' && lastMessage.isStreaming) {
            lastMessage.text = responseText;
            lastMessage.meta = responseMeta;
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      } catch (error) {
        console.error('❌ Error processing image:', error);
        responseText = 'Sorry, I encountered an error while processing the image. Please try again.';
        responseMeta = {
          defenseQuality: 'low' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: 'image_analysis'
        };
        
        // Update the streaming message with error
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'AI' && lastMessage.isStreaming) {
            lastMessage.text = responseText;
            lastMessage.meta = responseMeta;
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      } finally {
        console.log('🔄 Finishing image processing...');
        setUploadingImage(false);
        resetImage(); // Clear the image after processing
      }
    } else {
      // Handle text only with streaming
      try {
        console.log('🔄 Starting text response generation...');
      const { text, meta } = await generateResponse(userMessage.text);
        console.log('✅ Generated response text length:', text ? text.length : 0);
        console.log('✅ Generated response preview:', text ? text.substring(0, 200) + '...' : 'EMPTY');
        
        responseText = text as string;
      responseMeta = meta;
        
        console.log('🔄 Updating message with response...');
        // Final update to mark streaming as complete
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'AI' && lastMessage.isStreaming) {
            console.log('📝 Updating last message with text:', responseText.substring(0, 100) + '...');
            lastMessage.text = responseText;
            lastMessage.meta = responseMeta;
            lastMessage.isStreaming = false;
            console.log('✅ Message updated - isStreaming set to false');
          } else {
            console.warn('⚠️ Could not find streaming AI message to update');
          }
          return newMessages;
        });
        console.log('✅ Message updated successfully');
      } catch (error) {
        console.error('❌ Error generating response:', error);
        responseText = 'Sorry, I encountered an error while generating the response. Please try again.';
        responseMeta = {
          defenseQuality: 'low' as const,
          hallucinationRisk: 'low' as const,
          tone: personality,
          taskType: 'general'
        };
        
        // Update the streaming message with error
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'AI' && lastMessage.isStreaming) {
            lastMessage.text = responseText;
            lastMessage.meta = responseMeta;
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      }
    }

    updateAnalytics(responseText, 'AI');
    setIsTyping(false);

    // Refresh backend analytics after message
    setTimeout(() => {
      fetch('http://localhost:3001/api/analytics/overview')
        .then(response => response.ok ? response.json() : null)
        .then(data => data && setBackendAnalytics(data))
        .catch(error => console.error('Failed to refresh analytics:', error));
    }, 1000);

    // Speech is now controlled by user via speak button
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        startNewChat();
      }
      
      // Escape to close panels
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowPreferences(false);
        setShowAnalytics(false);
        setShowModelSelector(false);
        setShowLanguageSelector(false);
        
        // Close message actions
        setMessageActions({});
        
        // Cancel editing
        if (editingMessage) {
          cancelEdit();
        }
      }
      
      // Ctrl/Cmd + / for settings
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowSettings(true);
      }
      
      // Ctrl/Cmd + ? for shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingMessage]);

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // max-h-[200px]
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  // Auto-resize when input value changes
  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue]);


  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  const downloadSpecificChat = (chatId: string) => {
    const chat = recentChats.find(c => c.id === chatId);
    if (!chat) return;

    const text = chat.messages
      .map((m) => {
        const time = new Date(m.timestamp).toLocaleString();
        const who = m.sender === "AI" ? "AI Assistant" : "You";
        return `[${time}] ${who}:\n${m.text}\n`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${chat.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportAllChats = () => {
    const allChats = recentChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      lastModified: chat.lastModified,
      messageCount: chat.messages.length,
      messages: chat.messages
    }));

    const data = {
      exportDate: new Date().toISOString(),
      totalChats: allChats.length,
      chats: allChats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adiva-ai-chats-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importChats = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.chats && Array.isArray(data.chats)) {
          setRecentChats(data.chats);
          console.log(`Imported ${data.chats.length} chats`);
        }
      } catch (error) {
        console.error('Failed to import chats:', error);
        alert('Failed to import chats. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };


  // Analytics tracking function
  const trackAnalytics = async (event: string, data?: any) => {
    try {
      await fetch('http://localhost:3001/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event, data })
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  };

  // =====================
  // Message Actions
  // =====================
  const toggleMessageActions = (messageId: string) => {
    setMessageActions(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const editMessage = (messageId: string, text: string) => {
    setEditingMessage(messageId);
    setEditText(text);
    setMessageActions(prev => ({ ...prev, [messageId]: false }));
  };

  const saveEditedMessage = () => {
    if (editingMessage && editText.trim()) {
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, text: editText.trim() }
          : msg
      ));
      setEditingMessage(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const regenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    if (message.sender !== 'AI') return;

    // Find the user message that prompted this AI response
    const userMessageIndex = messageIndex - 1;
    const userMessage = messages[userMessageIndex];
    
    if (!userMessage || userMessage.sender !== 'user') return;

    // Remove the current AI message
    setMessages(prev => prev.filter(m => m.id !== messageId));

    // Generate new response
    setIsTyping(true);
    try {
      const { text, meta } = await generateResponse(userMessage.text);
      
      const newAIMessage: Message = {
        id: `regenerated_${Date.now()}`,
        text: text as string,
        sender: 'AI',
        timestamp: new Date().toISOString(),
        isAI: true,
        meta: meta,
      };

      setMessages(prev => [...prev, newAIMessage]);
      updateAnalytics(text as string, 'AI');
    } catch (error) {
      console.error('Failed to regenerate message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const likeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, liked: true, disliked: false }
        : msg
    ));
    trackAnalytics('message_liked', { messageId });
  };

  const dislikeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, liked: false, disliked: true }
        : msg
    ));
    trackAnalytics('message_disliked', { messageId });
  };

  // =====================
  // Markdown Renderer
  // =====================
  const MarkdownRenderer = ({ content, isStreaming }: { content: string, isStreaming?: boolean }) => {
    // Special case for "AI is thinking..." - show as plain text with animation
    if (content === 'AI is thinking...' && isStreaming) {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                animationDelay: '0ms',
                backgroundColor: getCurrentTheme().primaryColor
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                animationDelay: '150ms',
                backgroundColor: getCurrentTheme().secondaryColor
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                animationDelay: '300ms',
                backgroundColor: getCurrentTheme().accentColor
              }}
            ></div>
          </div>
          <span className="text-sm text-blue-300">AI is thinking...</span>
        </div>
      );
    }

    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: ({ className, children, ...props }: any) => {
              const inline = !className?.includes('language-');
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && language) {
                return (
                  <div className="relative my-4">
                    <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
                      <span className="text-sm text-gray-300 font-medium">{language}</span>
                      <Button
                        size="sm"
                        onClick={() => copyMessage(String(children).replace(/\n$/, ''))}
                        className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 border-0"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-gray-900 rounded-b-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              }
              
              return (
                <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="my-4">
                {children}
              </div>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-gray-800 px-4 py-2 text-left text-sm font-medium text-gray-200 border-b border-gray-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {children}
              </a>
            ),
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mt-6 mb-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mt-5 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside my-4 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside my-4 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-300">
                {children}
              </li>
            ),
            p: ({ children }) => (
              <p className="my-3 leading-relaxed">
                {children}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse"></span>
                )}
              </p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // =====================
  // Render
  // =====================
  return (
    <TooltipProvider>
      {/* Full Screen Chat Interface */}
      <div className="h-full flex flex-col sidebar-ai">
        {/* Chat Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ai-glow"
                style={{
                  background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}, ${getCurrentTheme().secondaryColor}, ${getCurrentTheme().accentColor})`
                }}
              >
                <AIIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Adiva AI</h2>
                <p className="text-blue-200 text-xs sm:text-sm">Ready to assist with any task</p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Selector Dropdown */}
        {showModelSelector && (
          <div className="absolute top-20 right-6 z-50 glass-dark border border-white/20 rounded-2xl shadow-2xl p-6 min-w-80">
            <h3 className="font-bold text-white text-lg mb-4">Select AI Model</h3>
            <div className="space-y-3">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedModel === model.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200'
                      : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                    }`}
                >
                  <div className="font-semibold text-base">{model.name}</div>
                  <div className="text-sm text-blue-300 mt-1">{model.description}</div>
                  <div className="text-xs text-blue-400 mt-2">
                    Cost: ${model.costPer1kTokens}/1k tokens
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModelSelector(false)}
              className="mt-4 w-full text-sm text-blue-300 hover:text-white text-center py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          personality={personality}
          setPersonality={setPersonality}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          sidebarThemeEnabled={sidebarThemeEnabled}
          setSidebarThemeEnabled={setSidebarThemeEnabled}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          speechEnabled={speechEnabled}
          setSpeechEnabled={setSpeechEnabled}
          defensiveMode={defensiveMode}
          setDefensiveMode={setDefensiveMode}
          availableModels={availableModels}
          availableThemes={availableThemes}
          availableLanguages={availableLanguages}
          getCurrentTheme={getCurrentTheme}
        />

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="preferences-panel glass-dark border border-white/20 rounded-2xl shadow-2xl p-6 min-w-[1000px] max-w-xl max-h-[80vh] overflow-y-auto">
              <h3 className="font-bold text-white text-lg mb-6">Preferences</h3>

              {/* AI Model Selection */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Model
                </h4>
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${selectedModel === model.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200'
                          : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                        }`}
                    >
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-blue-300 mt-1">{model.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality Settings */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Personality
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['friendly', 'logical', 'playful', 'confident'] as const).map((persona) => (
                    <button
                      key={persona}
                      onClick={() => setPersonality(persona)}
                      className={`p-3 rounded-xl transition-all duration-300 text-sm font-medium ${personality === persona
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200'
                          : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                        }`}
                    >
                      {persona.charAt(0).toUpperCase() + persona.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Theme
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {availableThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3 rounded-xl transition-all duration-300 text-sm font-medium ${selectedTheme === theme.id
                          ? 'ring-2 ring-white/30 bg-white/10'
                          : 'hover:bg-white/10 border border-transparent hover:border-white/20'
                        }`}
                      style={{
                        backgroundColor: selectedTheme === theme.id ? `${theme.primaryColor}20` : 'transparent',
                        borderColor: selectedTheme === theme.id ? theme.primaryColor : 'transparent'
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                        }}
                      ></div>
                      <span style={{ color: selectedTheme === theme.id ? theme.primaryColor : 'white' }}>
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sidebar Theme Control */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Apply theme to sidebar</span>
                    <Switch checked={sidebarThemeEnabled} onCheckedChange={setSidebarThemeEnabled} />
                  </div>
                  <p className="text-xs text-blue-300 mt-1">
                    When enabled, sidebar colors will change with theme. When disabled, sidebar keeps fixed colors.
                  </p>
                </div>
              </div>

              {/* Language Settings */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language Settings
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-white text-sm">Interface Language</div>
                    <div className="text-xs text-blue-300 mb-2">Current: {selectedLanguage} | Available: {availableLanguages.length} languages</div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        console.log('Language changed to:', e.target.value);
                        setSelectedLanguage(e.target.value);
                      }}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-base"
                      style={{
                        color: 'white',
                        '--tw-ring-color': getCurrentTheme().primaryColor
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.target.style.borderColor = getCurrentTheme().primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${getCurrentTheme().primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {availableLanguages.map((language) => (
                        <option
                          key={language.code}
                          value={language.code}
                          className="bg-slate-800 text-white"
                          style={{ backgroundColor: '#1e293b', color: 'white' }}
                        >
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Speech Settings */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Speech Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Enable Speech</span>
                    <Switch checked={speechEnabled} onCheckedChange={setSpeechEnabled} />
                  </div>
                  {speechEnabled && (
                    <div className="space-y-2">
                      <div className="text-white text-sm">Speech Language</div>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-base"
                        style={{
                          color: 'white',
                          '--tw-ring-color': getCurrentTheme().primaryColor
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = getCurrentTheme().primaryColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getCurrentTheme().primaryColor}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {availableLanguages.map((language) => (
                          <option
                            key={language.code}
                            value={language.code}
                            className="bg-slate-800 text-white"
                            style={{ backgroundColor: '#1e293b', color: 'white' }}
                          >
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Defensive Mode */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Response Settings
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Defensive Mode</span>
                  <Switch checked={defensiveMode} onCheckedChange={setDefensiveMode} />
                </div>
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="mt-4 w-full text-sm text-blue-300 hover:text-white text-center py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-dark border border-white/20 rounded-2xl shadow-2xl p-6 min-w-96 max-w-lg">
              <h3 className="font-bold text-white text-lg mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">New Chat</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Settings</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">Ctrl+/</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Send Message</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">Enter</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">New Line</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">Shift+Enter</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Close Panels</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">Escape</kbd>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 w-full text-sm text-blue-300 hover:text-white text-center py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Language Selector Dropdown */}
        {showLanguageSelector && (
          <div className="absolute top-20 right-6 z-50 glass-dark border border-white/20 rounded-2xl shadow-2xl p-6 min-w-80">
            <h3 className="font-bold text-white text-lg mb-4">Select Speech Language</h3>
            <div className="space-y-3">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setSelectedLanguage(language.code);
                    setShowLanguageSelector(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedLanguage === language.code
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200'
                      : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                    }`}
                >
                  <div className="font-semibold text-base">{language.name}</div>
                  <div className="text-sm text-blue-300 mt-1">Language code: {language.code}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageSelector(false)}
              className="mt-4 w-full text-sm text-blue-300 hover:text-white text-center py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          {showAnalytics ? (
            <div className="analytics-panel h-full p-8 overflow-y-auto"
              style={{
                background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}05, ${getCurrentTheme().secondaryColor}05, ${getCurrentTheme().accentColor}05)`
              }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white">📊 Chat Analytics</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">Defend</span>
                      <Switch checked={defensiveMode} onCheckedChange={setDefensiveMode} />
                    </div>
                    <Button
                      onClick={() => setShowAnalytics(false)}
                      className="text-white border px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 btn-ai hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}, ${getCurrentTheme().secondaryColor})`,
                        borderColor: getCurrentTheme().primaryColor,
                        boxShadow: `0 4px 15px ${getCurrentTheme().primaryColor}30`
                      }}
                      title="Back to Chat"
                    >
                      ← Back to Chat
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-dark p-8 rounded-2xl border border-white/20 card-ai transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                      borderColor: `${getCurrentTheme().primaryColor}30`
                    }}
                  >
                    <h4 className="font-bold text-white text-xl mb-6">Frontend Statistics</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span style={{ color: getCurrentTheme().primaryColor }}>Total Messages</span>
                        <span className="font-bold text-xl" style={{ color: getCurrentTheme().primaryColor }}>{analytics.totalMessages}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: getCurrentTheme().secondaryColor }}>User Messages</span>
                        <span className="font-bold text-xl" style={{ color: getCurrentTheme().secondaryColor }}>{analytics.userMessages}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: getCurrentTheme().accentColor }}>AI Messages</span>
                        <span className="font-bold text-xl" style={{ color: getCurrentTheme().accentColor }}>{analytics.AIMessages}</span>
                      </div>
                    </div>
                  </div>

                  {backendAnalytics && (
                    <div className="glass-dark p-8 rounded-2xl border border-white/20 card-ai transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      style={{
                        borderColor: `${getCurrentTheme().secondaryColor}30`
                      }}
                    >
                      <h4 className="font-bold text-white text-xl mb-6">Backend Statistics</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span style={{ color: getCurrentTheme().primaryColor }}>Total Requests</span>
                          <span className="font-bold text-xl" style={{ color: getCurrentTheme().primaryColor }}>{backendAnalytics.totalRequests}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: getCurrentTheme().secondaryColor }}>Total Tokens</span>
                          <span className="font-bold text-xl" style={{ color: getCurrentTheme().secondaryColor }}>{backendAnalytics.totalTokens}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: getCurrentTheme().accentColor }}>Avg Response Time</span>
                          <span className="font-bold text-xl" style={{ color: getCurrentTheme().accentColor }}>{backendAnalytics.averageResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: getCurrentTheme().primaryColor }}>Errors</span>
                          <span className="font-bold text-xl" style={{ color: getCurrentTheme().primaryColor }}>{backendAnalytics.errorCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="glass-dark p-8 rounded-2xl border border-white/20 card-ai transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                      borderColor: `${getCurrentTheme().accentColor}30`
                    }}
                  >
                    <h4 className="font-bold text-white text-xl mb-6">Popular Topics</h4>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPopularTopics()}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            innerRadius={50}
                            isAnimationActive
                          >
                            {getPopularTopics().map((_entry, index) => (
                              <Cell key={`c-${index}`} fill={
                                index === 0 ? getCurrentTheme().primaryColor :
                                  index === 1 ? getCurrentTheme().secondaryColor :
                                    index === 2 ? getCurrentTheme().accentColor :
                                      index === 3 ? getCurrentTheme().primaryColor + '80' :
                                        getCurrentTheme().secondaryColor + '80'
                              } />
                            ))}
                          </Pie>
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Conversation Management */}
                <div className="mt-8 glass-dark p-8 rounded-2xl border border-white/20 card-ai transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    borderColor: `${getCurrentTheme().primaryColor}30`
                  }}
                >
                  <h4 className="font-bold text-white text-xl mb-6">Conversation Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}15, ${getCurrentTheme().primaryColor}25)`,
                        borderColor: `${getCurrentTheme().primaryColor}40`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().primaryColor}25, ${getCurrentTheme().primaryColor}35)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().primaryColor}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().primaryColor}15, ${getCurrentTheme().primaryColor}25)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().primaryColor}40`;
                      }}
                    >
                      <div className="text-4xl font-bold" style={{ color: getCurrentTheme().primaryColor }}>{recentChats.length}</div>
                      <div className="text-sm mt-2" style={{ color: getCurrentTheme().secondaryColor }}>Total Conversations</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().secondaryColor}15, ${getCurrentTheme().secondaryColor}25)`,
                        borderColor: `${getCurrentTheme().secondaryColor}40`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().secondaryColor}25, ${getCurrentTheme().secondaryColor}35)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().secondaryColor}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().secondaryColor}15, ${getCurrentTheme().secondaryColor}25)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().secondaryColor}40`;
                      }}
                    >
                      <div className="text-4xl font-bold break-words text-center" style={{ color: getCurrentTheme().secondaryColor, wordBreak: "break-word", overflowWrap: "break-word" }}>{currentChatId}</div>
                      <div className="text-sm mt-2" style={{ color: getCurrentTheme().accentColor }}>Current Chat ID</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().accentColor}15, ${getCurrentTheme().accentColor}25)`,
                        borderColor: `${getCurrentTheme().accentColor}40`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().accentColor}25, ${getCurrentTheme().accentColor}35)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().accentColor}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${getCurrentTheme().accentColor}15, ${getCurrentTheme().accentColor}25)`;
                        e.currentTarget.style.borderColor = `${getCurrentTheme().accentColor}40`;
                      }}
                    >
                      <div className="text-4xl font-bold" style={{ color: getCurrentTheme().accentColor }}>{messages.length}</div>
                      <div className="text-sm mt-2" style={{ color: getCurrentTheme().primaryColor }}>Messages in Current Chat</div>
                    </div>
                  </div>
                </div>

                {/* Conversation Management */}
                <div className="mt-8 glass-dark p-6 rounded-2xl border border-white/20 card-ai transition-all duration-300"
                  style={{
                    borderColor: `${getCurrentTheme().secondaryColor}30`
                  }}
                >
                  <h4 className="font-bold text-white text-lg mb-4">Conversation Management</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      onClick={exportAllChats}
                      className="text-white border transition-all duration-300 btn-ai hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}, ${getCurrentTheme().secondaryColor})`,
                        borderColor: getCurrentTheme().primaryColor,
                        boxShadow: `0 4px 15px ${getCurrentTheme().primaryColor}30`
                      }}
                    >
                      📥 Export All Chats
                    </Button>
                    
                    <Button
                      onClick={() => document.getElementById('import-chats')?.click()}
                      className="text-white border transition-all duration-300 btn-ai hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${getCurrentTheme().secondaryColor}, ${getCurrentTheme().accentColor})`,
                        borderColor: getCurrentTheme().secondaryColor,
                        boxShadow: `0 4px 15px ${getCurrentTheme().secondaryColor}30`
                      }}
                    >
                      📤 Import Chats
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all conversations? This action cannot be undone.')) {
                          setRecentChats([]);
                          startNewChat();
                        }
                      }}
                      className="text-white border transition-all duration-300 btn-ai hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, #ef4444, #dc2626)`,
                        borderColor: '#ef4444',
                        boxShadow: `0 4px 15px #ef444430`
                      }}
                    >
                      🗑️ Clear All
                    </Button>
                  </div>
                  
                  <input
                    id="import-chats"
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        importChats(file);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                <div className="mt-8 text-sm" style={{ color: getCurrentTheme().primaryColor }}>
                  <div>Session started: {new Date(analytics.sessionStart).toLocaleString()}</div>
                  <div className="flex items-center gap-3 mt-3">
                    <Settings2 className="h-4 w-4" style={{ color: getCurrentTheme().primaryColor }} />
                    <span>Personality: <span className="capitalize font-medium" style={{ color: getCurrentTheme().secondaryColor }}>{personality}</span></span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Sparkles className="h-4 w-4" style={{ color: getCurrentTheme().primaryColor }} />
                    <span>Selected Model: <span className="font-medium" style={{ color: getCurrentTheme().secondaryColor }}>{selectedModel}</span></span>
                  </div>
                  {backendAnalytics && (
                    <div className="flex items-center gap-3 mt-3">
                      <BarChart3 className="h-4 w-4" style={{ color: getCurrentTheme().primaryColor }} />
                      <span>Backend Uptime: <span className="font-medium" style={{ color: getCurrentTheme().secondaryColor }}>{Math.round(backendAnalytics.uptime)}s</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 sm:p-8">
              <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex gap-3 sm:gap-6", m.sender === "user" ? "justify-end" : "justify-start")}>
                    {m.sender === "AI" && (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ai-glow"
                        style={{
                          background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}, ${getCurrentTheme().secondaryColor}, ${getCurrentTheme().accentColor})`
                        }}
                      >
                        <AIIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={cn(
                        "max-w-[85%] sm:max-w-[75%] p-4 sm:p-6 rounded-2xl text-sm sm:text-base relative shadow-lg message-bubble-ai group",
                        m.sender === "user"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md"
                          : "glass-dark text-white border border-white/20 rounded-bl-md"
                      )}
                    >
                      {/* Show image if present */}
                      {m.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={m.imageUrl}
                            alt="User uploaded image"
                            className="max-w-full max-h-64 rounded-lg object-cover shadow-lg"
                          />
                        </div>
                      )}

                      {/* Message Content */}
                      {editingMessage === m.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEditedMessage}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-400/30"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              onClick={cancelEdit}
                              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 border border-gray-400/30"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="leading-relaxed">
                          {m.sender === 'AI' ? (
                            <MarkdownRenderer content={m.text} isStreaming={m.isStreaming} />
                          ) : (
                            <div className="whitespace-pre-line">
                              {m.text}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Actions */}
                      {!m.isStreaming && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40" data-message-actions>
                          <div className="relative">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMessageActions(m.id);
                              }}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200"
                            >
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            
                            {messageActions[m.id] && (
                              <div className="absolute right-0 top-full mt-1 w-44 sm:w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl z-50 overflow-hidden">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyMessage(m.text);
                                      setMessageActions(prev => ({ ...prev, [m.id]: false }));
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-800/50 transition-colors duration-200 flex items-center gap-2"
                                  >
                                    <Copy className="h-4 w-4" />
                                    Copy
                                  </button>
                                  
                                  {m.sender === 'user' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        editMessage(m.id, m.text);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-800/50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                  
                                  {m.sender === 'AI' && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          regenerateMessage(m.id);
                                          setMessageActions(prev => ({ ...prev, [m.id]: false }));
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-800/50 transition-colors duration-200 flex items-center gap-2"
                                      >
                                        <RotateCcw className="h-4 w-4" />
                                        Regenerate
                                      </button>
                                      
                                      <div className="border-t border-gray-700/50 my-1"></div>
                                      
                                      <div className="flex">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            likeMessage(m.id);
                                            setMessageActions(prev => ({ ...prev, [m.id]: false }));
                                          }}
                                          className={`flex-1 px-2 py-2 text-xs sm:text-sm transition-colors duration-200 flex items-center justify-center gap-1 ${
                                            m.liked 
                                              ? 'text-green-400 bg-green-500/20' 
                                              : 'text-white hover:bg-gray-800/50'
                                          }`}
                                        >
                                          <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span className="hidden sm:inline">Like</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            dislikeMessage(m.id);
                                            setMessageActions(prev => ({ ...prev, [m.id]: false }));
                                          }}
                                          className={`flex-1 px-2 py-2 text-xs sm:text-sm transition-colors duration-200 flex items-center justify-center gap-1 ${
                                            m.disliked 
                                              ? 'text-red-400 bg-red-500/20' 
                                              : 'text-white hover:bg-gray-800/50'
                                          }`}
                                        >
                                          <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span className="hidden sm:inline">Dislike</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {m.isAI && m.meta?.defenseQuality && !m.isStreaming && (
                        <>
                          <div className="mt-4 text-sm text-blue-300 border-t border-white/20 pt-4">
                            <span>🧠 Tone: {m.meta?.tone || 'default'}</span>
                            <span className="mx-3">•</span>
                            <span>🛡️ Defense: {m.meta.defenseQuality}</span>
                            <span className="mx-3">•</span>
                            <span>🎯 Risk: {m.meta.hallucinationRisk}</span>
                            {m.meta.taskType && (
                              <>
                                <span className="mx-3">•</span>
                                <span>📋 Task: {m.meta.taskType}</span>
                              </>
                            )}
                          </div>
                          {/* <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium ai-glow">
                              AI
                          </div> */}
                        </>
                      )}

                      {/* Speech Button for AI Messages - only show when not streaming */}
                      {m.sender === "AI" && speechEnabled && !m.isStreaming && (
                        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-300">Language: {availableLanguages.find(l => l.code === selectedLanguage)?.name.split(' ')[0] || 'EN'}</span>
                            <span className="text-xs text-blue-300">|</span>
                            <span className="text-xs text-blue-300">Status: {isSpeaking ? 'Speaking' : 'Ready'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSpeaking ? (
                              <Button
                                size="sm"
                                onClick={stopSpeaking}
                                className="h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 rounded-lg transition-all duration-200"
                              >
                                <VolumeX className="h-4 w-4" />
                                Stop
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  console.log('🔊 Speak button clicked');
                                  console.log('🔊 Message text:', m.text.substring(0, 100) + '...');
                                  console.log('🔊 Selected language:', selectedLanguage);
                                  console.log('🔊 Speech enabled:', speechEnabled);
                                  console.log('🔊 Speech synthesis available:', 'speechSynthesis' in window);
                                  console.log('🔊 Synthesis ref:', synthesisRef.current);
                                  speakText(m.text, selectedLanguage);
                                }}
                                className="h-8 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-lg transition-all duration-200"
                              >
                                <Volume2 className="h-4 w-4" />
                                Speak
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {m.sender === "user" && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 ai-glow">
                        <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}

              

                {error && (
                  <div className="flex items-center gap-3 text-sm text-red-300 bg-red-500/20 border border-red-400/30 p-4 rounded-xl">
                    <span>⚠️ {error}</span>
                    <Button
                      size="sm"
                      className="h-8 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 rounded-lg transition-all duration-200"
                      onClick={handleSendMessage}
                      disabled={isTyping || retryCount > 2}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Only show when not in analytics mode */}
        {!showAnalytics && (
          <div className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Quick Actions */}
              {/* <div className="grid grid-cols-4 gap-3 mb-6">
                {quickActions.slice(0, 4).map((qa) => (
                  <Button
                    key={qa.label}
                    onClick={() => handleQuickAction(qa.query)}
                    disabled={isTyping}
                    className="text-white border text-sm h-12 rounded-xl font-medium transition-all duration-300 quick-action-btn btn-ai hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}20, ${getCurrentTheme().secondaryColor}20)`,
                      borderColor: getCurrentTheme().primaryColor,
                      boxShadow: `0 2px 8px ${getCurrentTheme().primaryColor}20`
                    }}
                  >
                    {qa.label}
                  </Button>
                ))}
              </div> */}
              {/* <div className="grid grid-cols-4 gap-3 mb-6">
                {quickActions.slice(4, 8).map((qa) => (
                  <Button
                    key={qa.label}
                    onClick={() => handleQuickAction(qa.query)}
                    disabled={isTyping}
                    className="text-white border text-sm h-12 rounded-xl font-medium transition-all duration-300 quick-action-btn btn-ai hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}20, ${getCurrentTheme().secondaryColor}20)`,
                      borderColor: getCurrentTheme().primaryColor,
                      boxShadow: `0 2px 8px ${getCurrentTheme().primaryColor}20`
                    }}
                  >
                    {qa.label}
                  </Button>
                ))}
              </div> */}

              {/* ChatGPT-style Input Container with Integrated Image Upload */}
              <div className="relative">
                <div className="flex items-end gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 focus-within:border-white/20 focus-within:shadow-3xl">
                  <div className="flex-1 min-h-[52px] flex flex-col">
                    {/* Image Preview - Show inside input area when image is selected */}
                    {imagePreview && (
                      <div className="mb-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg w-fit">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-blue-300 flex items-center gap-1">
                            <span className="text-xs">📷</span>
                            Image:
                          </span>
                          <Button
                            onClick={handleImageRemove}
                            size="sm"
                            className="h-4 w-4 p-0 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 transition-all duration-200 hover:scale-110"
                            disabled={isUploadingImage}
                          >
                            <span className="text-xs">×</span>
                          </Button>
                        </div>
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-32 max-h-16 rounded object-cover shadow-sm cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => setShowImagePopup(true)}
                            title="Click to view full size"
                          />
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                              <div className="flex flex-col items-center gap-1 text-white">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span className="text-xs">Processing...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={selectedImage ? "Describe what you want to know about this image..." : "Message Adiva AI... (Press Enter to send, Shift+Enter for new line)"}
                      className="w-full bg-transparent border-0 text-white text-sm sm:text-base placeholder:text-white/60 focus:ring-0 focus:outline-none resize-none min-h-[24px] max-h-[200px] py-2 sm:py-3 px-0 leading-relaxed"
                      style={{
                        '--tw-ring-color': 'transparent',
                        lineHeight: '1.5'
                      } as React.CSSProperties}
                      rows={1}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Help Button */}
                    <Tooltip content="Keyboard Shortcuts (Ctrl+?)">
                      <Button
                        onClick={() => setShowShortcuts(true)}
                        disabled={isTyping || isUploadingImage}
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}
                        title="Keyboard Shortcuts"
                      >
                        <span className="text-xs">?</span>
                      </Button>
                    </Tooltip>

                    {/* Image Upload Button */}
                    <Tooltip content={selectedImage ? "Change Image" : "Upload Image"}>
                      <Button
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isTyping || isUploadingImage}
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: selectedImage
                            ? `linear-gradient(135deg, #10b981, #059669)`
                            : isUploadingImage
                              ? `linear-gradient(135deg, #f59e0b, #d97706)`
                              : `rgba(255, 255, 255, 0.1)`,
                          border: selectedImage || isUploadingImage ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                        title={selectedImage ? "Change Image" : "Upload Image"}
                      >
                        {isUploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : selectedImage ? (
                          <span className="text-xs">📷</span>
                        ) : (
                          <span className="text-xs">📷</span>
                        )}
                      </Button>
                    </Tooltip>

                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            alert('Please select a valid image file');
                            return;
                          }

                          // Validate file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Image size must be less than 10MB');
                            return;
                          }

                          handleImageSelect(file);
                        }
                      }}
                      className="hidden"
                      disabled={isTyping || isUploadingImage}
                    />

                    <Tooltip content="Voice input">
                      <Button
                        onClick={toggleVoiceInput}
                        disabled={isTyping}
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200 hover:scale-110"
                        style={{
                          background: isListening
                            ? `linear-gradient(135deg, #ef4444, #ec4899)`
                            : `rgba(255, 255, 255, 0.1)`,
                          border: isListening ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                          color: isListening ? 'white' : 'rgba(255, 255, 255, 0.7)'
                        }}
                        title="Voice Input"
                        aria-pressed={isListening}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </Tooltip>

                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputValue.trim() && !selectedImage) || isTyping || isUploadingImage}
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: (!inputValue.trim() && !selectedImage) || isTyping || isUploadingImage
                          ? 'rgba(255, 255, 255, 0.1)'
                          : `linear-gradient(135deg, ${getCurrentTheme().primaryColor}, ${getCurrentTheme().secondaryColor})`,
                        border: 'none',
                        color: 'white'
                      }}
                      aria-label="Send message"
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Popup Modal */}
        {showImagePopup && imagePreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowImagePopup(false)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">📷</span>
                  Image Preview
                </h3>
                <Button
                  onClick={() => setShowImagePopup(false)}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 transition-all duration-200 hover:scale-110"
                >
                  <span className="text-sm">×</span>
                </Button>
              </div>

              {/* Image Content */}
              <div className="p-4 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Full size preview"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/70">
                  {selectedImage && (
                    <span>File: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowImagePopup(false)}
                    size="sm"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AIchat;
