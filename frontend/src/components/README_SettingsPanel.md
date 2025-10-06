# SettingsPanel Component

A comprehensive settings panel for the Adiva AI chat application with advanced configuration options.

## Features

### 🎨 **Appearance & Theme**
- **AI Model Selection**: Choose from available AI models
- **Personality Settings**: Friendly, Logical, Playful, Confident
- **Theme Selection**: 8 different color themes with live preview
- **Sidebar Theme Control**: Apply themes to sidebar or keep fixed colors
- **Language Settings**: 13 supported languages

### 🛡️ **Privacy & Data Management**
- **Save conversation history**: Toggle conversation persistence
- **Auto-delete old chats**: Automatic cleanup of old conversations
- **Share usage analytics**: Control data sharing preferences
- **Clear All Data**: Complete data reset functionality

### 🤖 **Advanced AI Configuration**
- **Temperature Control**: Adjust AI creativity (0.0 - 1.0)
- **Max Response Length**: Control response token limits
- **Stream Responses**: Enable/disable streaming responses
- **Defensive Mode**: Enhanced reasoning and evidence

### 🔔 **Notifications & Alerts**
- **Sound Notifications**: Audio feedback for interactions
- **Desktop Notifications**: Browser notification support
- **Typing Indicators**: Show when AI is processing

### ♿ **Accessibility & Usability**
- **High Contrast Mode**: Enhanced visibility
- **Large Text**: Improved readability
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Auto-scroll**: Automatic scrolling to new messages

### ⚡ **Performance & Optimization**
- **Enable Caching**: Improve response times
- **Lazy Load Images**: Optimize image loading
- **Reduce Animations**: Minimize motion for better performance
- **Clear Cache**: Manual cache management

### 💾 **Data Management**
- **Export All Chats**: Backup conversations to JSON
- **Import Chats**: Restore conversations from backup
- **Backup Settings**: Export configuration settings
- **Restore Settings**: Import configuration settings

### ⌨️ **Keyboard Shortcuts**
- **Enter**: Send message
- **Shift + Enter**: New line
- **Ctrl + V**: Voice input
- **Ctrl + ,**: Open settings
- **Ctrl + N**: New chat
- **Ctrl + A**: Analytics
- **Ctrl + E**: Export chat
- **Esc**: Clear input

### 📊 **System Information**
- **Version Display**: Current application version
- **Backend Status**: Real-time connection status
- **Update Checker**: Check for application updates
- **API Version**: Current API version information

## Usage

```tsx
import SettingsPanel from './SettingsPanel';

// In your component
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
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls panel visibility |
| `onClose` | `() => void` | Close handler function |
| `selectedModel` | `string` | Currently selected AI model |
| `setSelectedModel` | `(model: string) => void` | Model selection handler |
| `personality` | `'friendly' \| 'logical' \| 'playful' \| 'confident'` | AI personality |
| `setPersonality` | `(personality: Personality) => void` | Personality handler |
| `selectedTheme` | `string` | Current theme ID |
| `setSelectedTheme` | `(theme: string) => void` | Theme selection handler |
| `sidebarThemeEnabled` | `boolean` | Sidebar theme toggle |
| `setSidebarThemeEnabled` | `(enabled: boolean) => void` | Sidebar theme handler |
| `selectedLanguage` | `string` | Current language code |
| `setSelectedLanguage` | `(language: string) => void` | Language handler |
| `speechEnabled` | `boolean` | Speech synthesis toggle |
| `setSpeechEnabled` | `(enabled: boolean) => void` | Speech handler |
| `defensiveMode` | `boolean` | Defensive mode toggle |
| `setDefensiveMode` | `(enabled: boolean) => void` | Defensive mode handler |
| `availableModels` | `any[]` | List of available AI models |
| `availableThemes` | `any[]` | List of available themes |
| `availableLanguages` | `Array<{code: string, name: string}>` | Supported languages |
| `getCurrentTheme` | `() => any` | Function to get current theme object |

## Features Added

### New Settings Categories:
1. **Privacy & Data Management** - Complete data control
2. **Advanced AI Configuration** - Fine-tune AI behavior
3. **Notifications** - Customize alerts and feedback
4. **Accessibility** - Improve usability for all users
5. **Performance** - Optimize application performance
6. **Data Management** - Import/export functionality
7. **System Information** - Application status and updates
8. **Keyboard Shortcuts** - Complete shortcut reference

### Enhanced Functionality:
- **Real-time Backend Status** - Live connection monitoring
- **Data Export/Import** - Complete backup and restore
- **Advanced AI Controls** - Temperature and token management
- **Accessibility Features** - High contrast, large text, keyboard navigation
- **Performance Optimization** - Caching and lazy loading controls
- **Comprehensive Shortcuts** - Full keyboard support

## Styling

The component uses:
- **Glass morphism design** with backdrop blur effects
- **Dynamic theming** that adapts to selected color schemes
- **Responsive layout** with grid system for different screen sizes
- **Smooth animations** and hover effects
- **Consistent spacing** and typography

## Dependencies

- React 18+
- Lucide React (icons)
- Tailwind CSS (styling)
- Custom UI components (Button, Switch)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Plugin system for custom settings
- [ ] Settings search functionality
- [ ] Settings categories with collapsible sections
- [ ] Settings validation and error handling
- [ ] Settings migration between versions
- [ ] Advanced keyboard shortcut customization
- [ ] Settings profiles for different users
- [ ] Cloud sync for settings across devices
