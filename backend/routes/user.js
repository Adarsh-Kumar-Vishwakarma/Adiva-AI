import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import UserPreferences from '../models/UserPreferences.js';
import UserAnalytics from '../models/UserAnalytics.js';

const router = express.Router();

// GET /api/user/profile - Get user profile with all data
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const fullProfile = await user.getFullProfile();
    
    res.json({
      success: true,
      ...fullProfile
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/settings - Get user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const settings = await user.getSettings();
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// PUT /api/user/settings - Update user settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;
    
    const settings = await UserSettings.bulkUpdateSettings(userId, settingsData);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/user/settings/reset - Reset settings to defaults
router.post('/settings/reset', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const settings = await UserSettings.getOrCreateUserSettings(userId);
    await settings.resetToDefaults();
    
    res.json({
      success: true,
      settings,
      message: 'Settings reset to defaults'
    });
  } catch (error) {
    console.error('❌ Reset settings error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

// GET /api/user/preferences - Get user preferences
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const preferences = await user.getPreferences();
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('❌ Get preferences error:', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferencesData = req.body;
    
    const preferences = await UserPreferences.bulkUpdatePreferences(userId, preferencesData);
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('❌ Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// POST /api/user/preferences/reset - Reset preferences to defaults
router.post('/preferences/reset', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await UserPreferences.getOrCreateUserPreferences(userId);
    await preferences.resetToDefaults();
    
    res.json({
      success: true,
      preferences,
      message: 'Preferences reset to defaults'
    });
  } catch (error) {
    console.error('❌ Reset preferences error:', error);
    res.status(500).json({ error: 'Failed to reset preferences' });
  }
});

// GET /api/user/analytics - Get user analytics
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const analytics = await user.getAnalytics();
    const insights = analytics.getInsights();
    
    res.json({
      success: true,
      analytics,
      insights
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// GET /api/user/export - Export all user data
router.get('/export', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const exportData = await user.exportAllData();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error('❌ Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// GET /api/user/preferences/summary - Get preferences summary
router.get('/preferences/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [settings, preferences, analytics] = await Promise.all([
      user.getSettings(),
      user.getPreferences(),
      user.getAnalytics()
    ]);
    
    const summary = {
      user: {
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
      },
      preferences: {
        totalCategories: Object.keys(preferences.toJSON()).length,
        aiSettings: settings.aiSettings,
        appearance: settings.appearance,
        privacy: settings.privacy,
        chatPreferences: preferences.chatPreferences,
        behaviorPreferences: preferences.behaviorPreferences,
        featurePreferences: preferences.featurePreferences
      },
      analytics: {
        totalMessages: analytics.totalStats.totalMessages,
        totalTokens: analytics.totalStats.totalTokens,
        favoriteModel: analytics.modelUsage.reduce((max, current) => 
          current.count > max.count ? current : max
        )?.model || 'None',
        mostActiveHour: analytics.timePatterns.mostActiveHour,
        insights: analytics.getInsights()
      }
    };
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('❌ Get preferences summary error:', error);
    res.status(500).json({ error: 'Failed to get preferences summary' });
  }
});

// DELETE /api/user/account - Delete user account and all data
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.deleteUserData();
    
    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// POST /api/user/preferences/topics - Add preferred topic
router.post('/preferences/topics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const preferences = await UserPreferences.getOrCreateUserPreferences(userId);
    await preferences.addPreferredTopic(topic);
    
    res.json({
      success: true,
      preferences,
      message: 'Topic added successfully'
    });
  } catch (error) {
    console.error('❌ Add topic error:', error);
    res.status(500).json({ error: 'Failed to add topic' });
  }
});

// DELETE /api/user/preferences/topics/:topic - Remove preferred topic
router.delete('/preferences/topics/:topic', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic } = req.params;
    
    const preferences = await UserPreferences.getOrCreateUserPreferences(userId);
    await preferences.removePreferredTopic(topic);
    
    res.json({
      success: true,
      preferences,
      message: 'Topic removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove topic error:', error);
    res.status(500).json({ error: 'Failed to remove topic' });
  }
});

// POST /api/user/preferences/emojis - Add custom emoji
router.post('/preferences/emojis', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, emoji } = req.body;
    
    if (!name || !emoji) {
      return res.status(400).json({ error: 'Name and emoji are required' });
    }
    
    const preferences = await UserPreferences.getOrCreateUserPreferences(userId);
    await preferences.addCustomEmoji(name, emoji);
    
    res.json({
      success: true,
      preferences,
      message: 'Custom emoji added successfully'
    });
  } catch (error) {
    console.error('❌ Add emoji error:', error);
    res.status(500).json({ error: 'Failed to add custom emoji' });
  }
});

// POST /api/user/preferences/shortcuts - Add custom shortcut
router.post('/preferences/shortcuts', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, shortcut } = req.body;
    
    if (!action || !shortcut) {
      return res.status(400).json({ error: 'Action and shortcut are required' });
    }
    
    const preferences = await UserPreferences.getOrCreateUserPreferences(userId);
    await preferences.addCustomShortcut(action, shortcut);
    
    res.json({
      success: true,
      preferences,
      message: 'Custom shortcut added successfully'
    });
  } catch (error) {
    console.error('❌ Add shortcut error:', error);
    res.status(500).json({ error: 'Failed to add custom shortcut' });
  }
});

// GET /api/user/preferences/validate - Validate preferences data integrity
router.get('/preferences/validate', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [settings, preferences, analytics] = await Promise.all([
      user.getSettings(),
      user.getPreferences(),
      user.getAnalytics()
    ]);
    
    const validation = {
      settings: {
        isValid: true,
        categories: Object.keys(settings.toJSON()).length,
        issues: []
      },
      preferences: {
        isValid: true,
        categories: Object.keys(preferences.toJSON()).length,
        issues: []
      },
      analytics: {
        isValid: true,
        totalMessages: analytics.totalStats.totalMessages,
        totalTokens: analytics.totalStats.totalTokens,
        issues: []
      }
    };
    
    // Validate settings
    if (!settings.aiSettings.defaultModel) {
      validation.settings.isValid = false;
      validation.settings.issues.push('Missing default AI model');
    }
    
    if (settings.aiSettings.defaultTemperature < 0 || settings.aiSettings.defaultTemperature > 1) {
      validation.settings.isValid = false;
      validation.settings.issues.push('Invalid temperature value');
    }
    
    // Validate preferences
    if (!preferences.chatPreferences.defaultConversationTitle) {
      validation.preferences.isValid = false;
      validation.preferences.issues.push('Missing default conversation title');
    }
    
    if (preferences.chatPreferences.conversationLimit < 1 || preferences.chatPreferences.conversationLimit > 1000) {
      validation.preferences.isValid = false;
      validation.preferences.issues.push('Invalid conversation limit');
    }
    
    // Validate analytics
    if (analytics.totalStats.totalMessages < 0) {
      validation.analytics.isValid = false;
      validation.analytics.issues.push('Invalid message count');
    }
    
    const overallValid = validation.settings.isValid && validation.preferences.isValid && validation.analytics.isValid;
    
    res.json({
      success: true,
      valid: overallValid,
      validation,
      message: overallValid ? 'All preferences are valid' : 'Some preferences have issues'
    });
  } catch (error) {
    console.error('❌ Validate preferences error:', error);
    res.status(500).json({ error: 'Failed to validate preferences' });
  }
});

export default router;
