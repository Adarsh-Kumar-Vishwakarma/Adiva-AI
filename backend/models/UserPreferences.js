import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Chat Preferences
  chatPreferences: {
    defaultConversationTitle: {
      type: String,
      default: 'New Chat',
      maxlength: [100, 'Default conversation title cannot exceed 100 characters']
    },
    autoSaveConversations: {
      type: Boolean,
      default: true
    },
    conversationLimit: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    messageHistoryLimit: {
      type: Number,
      default: 50,
      min: 1,
      max: 1000
    },
    showTimestamp: {
      type: Boolean,
      default: true
    },
    showModelInfo: {
      type: Boolean,
      default: false
    },
    showTokenCount: {
      type: Boolean,
      default: false
    }
  },
  
  // UI Preferences
  uiPreferences: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    chatLayout: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    messageBubbles: {
      type: Boolean,
      default: true
    },
    showAvatars: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    lineHeight: {
      type: String,
      enum: ['tight', 'normal', 'relaxed'],
      default: 'normal'
    }
  },
  
  // Behavior Preferences
  behaviorPreferences: {
    autoFocusInput: {
      type: Boolean,
      default: true
    },
    sendOnEnter: {
      type: Boolean,
      default: true
    },
    showWelcomeMessage: {
      type: Boolean,
      default: true
    },
    rememberLastModel: {
      type: Boolean,
      default: true
    },
    rememberLastSettings: {
      type: Boolean,
      default: true
    },
    autoSuggestions: {
      type: Boolean,
      default: true
    }
  },
  
  // Feature Preferences
  featurePreferences: {
    enableImageUpload: {
      type: Boolean,
      default: true
    },
    enableVoiceInput: {
      type: Boolean,
      default: false
    },
    enableVoiceOutput: {
      type: Boolean,
      default: false
    },
    enableCodeHighlighting: {
      type: Boolean,
      default: true
    },
    enableMarkdownRendering: {
      type: Boolean,
      default: true
    },
    enableMathRendering: {
      type: Boolean,
      default: true
    },
    enableLinkPreview: {
      type: Boolean,
      default: true
    }
  },
  
  // Learning Preferences
  learningPreferences: {
    preferredTopics: [{
      type: String,
      maxlength: [50, 'Topic cannot exceed 50 characters']
    }],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    },
    explanationDetail: {
      type: String,
      enum: ['brief', 'moderate', 'detailed'],
      default: 'moderate'
    }
  },
  
  // Customization Preferences
  customizationPreferences: {
    customCSS: {
      type: String,
      default: null,
      maxlength: [10000, 'Custom CSS cannot exceed 10,000 characters']
    },
    customEmojis: [{
      name: {
        type: String,
        required: true,
        maxlength: [20, 'Emoji name cannot exceed 20 characters']
      },
      emoji: {
        type: String,
        required: true,
        maxlength: [10, 'Emoji cannot exceed 10 characters']
      }
    }],
    customShortcuts: [{
      action: {
        type: String,
        required: true,
        maxlength: [50, 'Action cannot exceed 50 characters']
      },
      shortcut: {
        type: String,
        required: true,
        maxlength: [20, 'Shortcut cannot exceed 20 characters']
      }
    }]
  }
}, {
  timestamps: true
});

// Index for user lookup
userPreferencesSchema.index({ user: 1 }, { unique: true });

// Method to reset to default preferences
userPreferencesSchema.methods.resetToDefaults = function() {
  this.chatPreferences = {
    defaultConversationTitle: 'New Chat',
    autoSaveConversations: true,
    conversationLimit: 100,
    messageHistoryLimit: 50,
    showTimestamp: true,
    showModelInfo: false,
    showTokenCount: false
  };
  
  this.uiPreferences = {
    sidebarCollapsed: false,
    chatLayout: 'comfortable',
    messageBubbles: true,
    showAvatars: true,
    fontSize: 'medium',
    lineHeight: 'normal'
  };
  
  this.behaviorPreferences = {
    autoFocusInput: true,
    sendOnEnter: true,
    showWelcomeMessage: true,
    rememberLastModel: true,
    rememberLastSettings: true,
    autoSuggestions: true
  };
  
  this.featurePreferences = {
    enableImageUpload: true,
    enableVoiceInput: false,
    enableVoiceOutput: false,
    enableCodeHighlighting: true,
    enableMarkdownRendering: true,
    enableMathRendering: true,
    enableLinkPreview: true
  };
  
  this.learningPreferences = {
    preferredTopics: [],
    difficultyLevel: 'intermediate',
    learningStyle: 'visual',
    explanationDetail: 'moderate'
  };
  
  this.customizationPreferences = {
    customCSS: null,
    customEmojis: [],
    customShortcuts: []
  };
  
  return this.save();
};

// Method to add preferred topic
userPreferencesSchema.methods.addPreferredTopic = function(topic) {
  if (!this.learningPreferences.preferredTopics.includes(topic)) {
    this.learningPreferences.preferredTopics.push(topic);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove preferred topic
userPreferencesSchema.methods.removePreferredTopic = function(topic) {
  const index = this.learningPreferences.preferredTopics.indexOf(topic);
  if (index > -1) {
    this.learningPreferences.preferredTopics.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add custom emoji
userPreferencesSchema.methods.addCustomEmoji = function(name, emoji) {
  const existingIndex = this.customizationPreferences.customEmojis.findIndex(
    item => item.name === name
  );
  
  if (existingIndex > -1) {
    this.customizationPreferences.customEmojis[existingIndex].emoji = emoji;
  } else {
    this.customizationPreferences.customEmojis.push({ name, emoji });
  }
  
  return this.save();
};

// Method to add custom shortcut
userPreferencesSchema.methods.addCustomShortcut = function(action, shortcut) {
  const existingIndex = this.customizationPreferences.customShortcuts.findIndex(
    item => item.action === action
  );
  
  if (existingIndex > -1) {
    this.customizationPreferences.customShortcuts[existingIndex].shortcut = shortcut;
  } else {
    this.customizationPreferences.customShortcuts.push({ action, shortcut });
  }
  
  return this.save();
};

// Method to export preferences
userPreferencesSchema.methods.exportPreferences = function() {
  return {
    chatPreferences: this.chatPreferences,
    uiPreferences: this.uiPreferences,
    behaviorPreferences: this.behaviorPreferences,
    featurePreferences: this.featurePreferences,
    learningPreferences: this.learningPreferences,
    customizationPreferences: this.customizationPreferences,
    exportedAt: new Date(),
    version: '1.0'
  };
};

// Static method to get or create user preferences
userPreferencesSchema.statics.getOrCreateUserPreferences = async function(userId) {
  let preferences = await this.findOne({ user: userId });
  
  if (!preferences) {
    preferences = new this({ user: userId });
    await preferences.save();
  }
  
  return preferences;
};

// Static method to bulk update preferences
userPreferencesSchema.statics.bulkUpdatePreferences = async function(userId, preferencesData) {
  const preferences = await this.getOrCreateUserPreferences(userId);
  
  // Update each category if provided
  Object.keys(preferencesData).forEach(category => {
    if (preferences[category] && typeof preferences[category] === 'object') {
      Object.assign(preferences[category], preferencesData[category]);
    }
  });
  
  return preferences.save();
};

export default mongoose.model('UserPreferences', userPreferencesSchema);

