import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Shield,
    Cpu,
    Bell,
    Eye,
    Download,
    Zap,
    Keyboard,
    Info,
    Settings2,
    Sparkles,
    Globe,
    Volume2,
    ShieldCheck,
    Trash2,
    Upload,
    RotateCcw,
    Database,
    Wifi,
    WifiOff,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    // Current settings
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    personality: 'friendly' | 'logical' | 'playful' | 'confident';
    setPersonality: (personality: 'friendly' | 'logical' | 'playful' | 'confident') => void;
    selectedTheme: string;
    setSelectedTheme: (theme: string) => void;
    sidebarThemeEnabled: boolean;
    setSidebarThemeEnabled: (enabled: boolean) => void;
    selectedLanguage: string;
    setSelectedLanguage: (language: string) => void;
    speechEnabled: boolean;
    setSpeechEnabled: (enabled: boolean) => void;
    defensiveMode: boolean;
    setDefensiveMode: (enabled: boolean) => void;
    availableModels: any[];
    availableThemes: any[];
    availableLanguages: Array<{ code: string; name: string }>;
    getCurrentTheme: () => any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    selectedModel,
    setSelectedModel,
    personality,
    setPersonality,
    selectedTheme,
    setSelectedTheme,
    sidebarThemeEnabled,
    setSidebarThemeEnabled,
    selectedLanguage,
    setSelectedLanguage,
    speechEnabled,
    setSpeechEnabled,
    defensiveMode,
    setDefensiveMode,
    availableModels,
    availableThemes,
    availableLanguages,
    getCurrentTheme
}) => {
    // New settings states
    const [saveHistory, setSaveHistory] = useState(true);
    const [autoDelete, setAutoDelete] = useState(false);
    const [shareAnalytics, setShareAnalytics] = useState(true);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState('2000');
    const [streamResponses, setStreamResponses] = useState(true);
    const [soundNotifications, setSoundNotifications] = useState(true);
    const [desktopNotifications, setDesktopNotifications] = useState(false);
    const [showTyping, setShowTyping] = useState(true);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const [enableCaching, setEnableCaching] = useState(true);
    const [lazyLoadImages, setLazyLoadImages] = useState(true);
    const [reduceAnimations, setReduceAnimations] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

    // Check backend status
    React.useEffect(() => {
        const checkBackendStatus = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/analytics/overview');
                setBackendStatus(response.ok ? 'online' : 'offline');
            } catch {
                setBackendStatus('offline');
            }
        };

        if (isOpen) {
            checkBackendStatus();
        }
    }, [isOpen]);

    // Handler functions
    const clearAllData = () => {
        if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const exportAllChats = () => {
        try {
            const chats = localStorage.getItem('chatAI_recentChats');
            const settings = {
                theme: selectedTheme,
                language: selectedLanguage,
                personality,
                model: selectedModel,
                speechEnabled,
                defensiveMode
            };

            const data = {
                chats: chats ? JSON.parse(chats) : [],
                settings,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `adiva-ai-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    const importChats = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        if (data.chats) {
                            localStorage.setItem('chatAI_recentChats', JSON.stringify(data.chats));
                        }
                        if (data.settings) {
                            // Apply imported settings
                            if (data.settings.theme) setSelectedTheme(data.settings.theme);
                            if (data.settings.language) setSelectedLanguage(data.settings.language);
                            if (data.settings.personality) setPersonality(data.settings.personality);
                            if (data.settings.model) setSelectedModel(data.settings.model);
                            if (data.settings.speechEnabled !== undefined) setSpeechEnabled(data.settings.speechEnabled);
                            if (data.settings.defensiveMode !== undefined) setDefensiveMode(data.settings.defensiveMode);
                        }
                        alert('Import successful!');
                        window.location.reload();
                    } catch (error) {
                        console.error('Import failed:', error);
                        alert('Import failed. Invalid file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const backupSettings = () => {
        const settings = {
            theme: selectedTheme,
            language: selectedLanguage,
            personality,
            model: selectedModel,
            speechEnabled,
            defensiveMode,
            saveHistory,
            autoDelete,
            shareAnalytics,
            temperature,
            maxTokens,
            streamResponses,
            soundNotifications,
            desktopNotifications,
            showTyping,
            highContrast,
            largeText,
            keyboardShortcuts,
            autoScroll,
            enableCaching,
            lazyLoadImages,
            reduceAnimations
        };

        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `adiva-ai-settings-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const restoreSettings = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target?.result as string);
                        // Apply all settings
                        Object.keys(settings).forEach(key => {
                            const setter = eval(`set${key.charAt(0).toUpperCase() + key.slice(1)}`);
                            if (typeof setter === 'function') {
                                setter(settings[key]);
                            }
                        });
                        alert('Settings restored successfully!');
                    } catch (error) {
                        console.error('Restore failed:', error);
                        alert('Restore failed. Invalid file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const clearCache = () => {
        if (window.confirm('Clear all cached data?')) {
            // Clear various caches
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
            localStorage.removeItem('chatAI_analytics');
            alert('Cache cleared successfully!');
        }
    };

    const checkUpdates = () => {
        alert('Checking for updates...\n\nThis feature will be implemented in a future version.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="settings-panel glass-dark border border-white/20 rounded-2xl shadow-2xl p-6 min-w-[1000px] max-w-6xl max-h-[90vh] overflow-y-auto"
                style={{
                    background: `linear-gradient(135deg, ${getCurrentTheme().primaryColor}05, ${getCurrentTheme().secondaryColor}05, ${getCurrentTheme().accentColor}05)`
                }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white text-2xl flex items-center gap-3">
                        <Settings2 className="h-6 w-6" style={{ color: getCurrentTheme().primaryColor }} />
                        Advanced Settings
                    </h3>
                    <Button
                        onClick={onClose}
                        className="h-8 w-8 p-0 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 transition-all duration-200 hover:scale-110"
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* AI Model Selection */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                AI Model
                            </h4>
                            <div className="space-y-2">
                                {availableModels.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${selectedModel === model.id
                                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200'
                                            : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">{model.name}</div>
                                        <div className="text-xs text-indigo-300 mt-1">{model.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Personality Settings */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Personality
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {(['friendly', 'logical', 'playful', 'confident'] as const).map((persona) => (
                                    <button
                                        key={persona}
                                        onClick={() => setPersonality(persona)}
                                        className={`p-3 rounded-xl transition-all duration-300 text-sm font-medium ${personality === persona
                                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200'
                                            : 'hover:bg-white/10 text-white border border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        {persona.charAt(0).toUpperCase() + persona.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
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
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Apply theme to sidebar</span>
                                    <Switch checked={sidebarThemeEnabled} onCheckedChange={setSidebarThemeEnabled} />
                                </div>
                            </div>
                        </div>

                        {/* Language Settings */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Globe className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Language
                            </h4>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white text-base"
                                style={{
                                    color: 'white',
                                    '--tw-ring-color': getCurrentTheme().primaryColor
                                } as React.CSSProperties}
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

                        {/* Speech Settings */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Volume2 className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Speech
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Enable Speech</span>
                                    <Switch checked={speechEnabled} onCheckedChange={setSpeechEnabled} />
                                </div>
                            </div>
                        </div>

                        {/* Response Settings */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Response
                            </h4>
                            <div className="flex items-center justify-between">
                                <span className="text-white text-sm">Defensive Mode</span>
                                <Switch checked={defensiveMode} onCheckedChange={setDefensiveMode} />
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Download className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Data Management
                            </h4>
                            <div className="space-y-3">
                                <Button
                                    onClick={exportAllChats}
                                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export All Chats
                                </Button>
                                <Button
                                    onClick={importChats}
                                    className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-400/30"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Chats
                                </Button>
                                <Button
                                    onClick={backupSettings}
                                    className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30"
                                >
                                    <Database className="h-4 w-4 mr-2" />
                                    Backup Settings
                                </Button>
                                <Button
                                    onClick={restoreSettings}
                                    className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-400/30"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restore Settings
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Privacy & Data Management */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Privacy & Data
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Save conversation history</span>
                                    <Switch checked={saveHistory} onCheckedChange={setSaveHistory} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Auto-delete old chats</span>
                                    <Switch checked={autoDelete} onCheckedChange={setAutoDelete} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Share usage analytics</span>
                                    <Switch checked={shareAnalytics} onCheckedChange={setShareAnalytics} />
                                </div>
                                <Button
                                    onClick={clearAllData}
                                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear All Data
                                </Button>
                            </div>
                        </div>

                        {/* Advanced AI Configuration */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Cpu className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Advanced AI
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-white text-sm block mb-2">Temperature (Creativity): {temperature}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${getCurrentTheme().primaryColor} 0%, ${getCurrentTheme().primaryColor} ${temperature * 100}%, rgba(255,255,255,0.2) ${temperature * 100}%, rgba(255,255,255,0.2) 100%)`
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-white text-sm block mb-2">Max Response Length</label>
                                    <select
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                                    >
                                        <option value="500">Short (500 tokens)</option>
                                        <option value="1000">Medium (1000 tokens)</option>
                                        <option value="2000">Long (2000 tokens)</option>
                                        <option value="4000">Very Long (4000 tokens)</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Stream responses</span>
                                    <Switch checked={streamResponses} onCheckedChange={setStreamResponses} />
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Bell className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Notifications
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Sound notifications</span>
                                    <Switch checked={soundNotifications} onCheckedChange={setSoundNotifications} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Desktop notifications</span>
                                    <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Typing indicators</span>
                                    <Switch checked={showTyping} onCheckedChange={setShowTyping} />
                                </div>
                            </div>
                        </div>

                        {/* Accessibility */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Eye className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Accessibility
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">High contrast mode</span>
                                    <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Large text</span>
                                    <Switch checked={largeText} onCheckedChange={setLargeText} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Keyboard shortcuts</span>
                                    <Switch checked={keyboardShortcuts} onCheckedChange={setKeyboardShortcuts} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Auto-scroll to new messages</span>
                                    <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                                </div>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Zap className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                Performance
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Enable caching</span>
                                    <Switch checked={enableCaching} onCheckedChange={setEnableCaching} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Lazy load images</span>
                                    <Switch checked={lazyLoadImages} onCheckedChange={setLazyLoadImages} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">Reduce animations</span>
                                    <Switch checked={reduceAnimations} onCheckedChange={setReduceAnimations} />
                                </div>
                                <Button
                                    onClick={clearCache}
                                    className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-400/30"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Clear Cache
                                </Button>
                            </div>
                        </div>



                        {/* System Info */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/20">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5" style={{ color: getCurrentTheme().primaryColor }} />
                                System Info
                            </h4>
                            <div className="space-y-2 text-sm text-indigo-300">
                                <div className="flex items-center justify-between">
                                    <span>Version:</span>
                                    <span className="text-white">1.0.0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Last updated:</span>
                                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Backend status:</span>
                                    <div className="flex items-center gap-1">
                                        {backendStatus === 'online' && <CheckCircle className="h-4 w-4 text-green-400" />}
                                        {backendStatus === 'offline' && <XCircle className="h-4 w-4 text-red-400" />}
                                        {backendStatus === 'checking' && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                                        <span className="text-white capitalize">{backendStatus}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>API version:</span>
                                    <span className="text-white">v1</span>
                                </div>
                                <Button
                                    onClick={checkUpdates}
                                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                                >
                                    <Wifi className="h-4 w-4 mr-2" />
                                    Check for Updates
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="mt-6 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border border-indigo-400/30 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        Close Settings
                    </Button>
                </div> */}
            </div>
        </div>
    );
};

export default SettingsPanel;
