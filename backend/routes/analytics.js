import express from "express";
import dotenv from 'dotenv';
import analyticsService from '../services/analyticsService.js';

dotenv.config();

const router = express.Router();

// Middleware to track analytics
const trackAnalytics = (req, res, next) => {
  const startTime = Date.now();
  
  // Track request
  analyticsService.trackRequest(req);
  
  // Override res.json to track response time
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    analyticsService.trackResponseTime(responseTime);
    
    // Track task type if available
    if (data.taskType) {
      analyticsService.trackTaskType(data.taskType);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Apply analytics tracking to all routes
router.use(trackAnalytics);

// GET /api/analytics/overview
router.get('/analytics/overview', (req, res) => {
  try {
    const overview = analyticsService.getOverview();
    return res.json(overview);
  } catch (error) {
    console.error('❌ Analytics overview error:', error);
    return res.status(500).json({ error: 'Failed to retrieve analytics overview' });
  }
});

// GET /api/analytics/daily
router.get('/analytics/daily', (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dailyStats = analyticsService.getDailyStats(days);
    return res.json(dailyStats);
  } catch (error) {
    console.error('❌ Daily analytics error:', error);
    return res.status(500).json({ error: 'Failed to retrieve daily analytics' });
  }
});

// GET /api/analytics/hourly
router.get('/analytics/hourly', (req, res) => {
  try {
    const hourlyStats = analyticsService.getHourlyStats();
    return res.json(hourlyStats);
  } catch (error) {
    console.error('❌ Hourly analytics error:', error);
    return res.status(500).json({ error: 'Failed to retrieve hourly analytics' });
  }
});

// GET /api/analytics/task-types
router.get('/analytics/task-types', (req, res) => {
  try {
    const overview = analyticsService.getOverview();
    const taskTypeStats = Object.entries(overview.taskTypeDistribution).map(([type, count]) => ({
      type,
      count,
      percentage: overview.totalRequests > 0 ? Math.round((count / overview.totalRequests) * 100) : 0
    }));
    
    return res.json({
      taskTypes: taskTypeStats,
      totalRequests: overview.totalRequests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Task type analytics error:', error);
    return res.status(500).json({ error: 'Failed to retrieve task type analytics' });
  }
});

// POST /api/analytics/track
router.post('/analytics/track', (req, res) => {
  try {
    const { event, data } = req.body;
    
    switch (event) {
      case 'conversation_started':
        analyticsService.trackConversation();
        break;
        
      case 'tokens_used':
        analyticsService.trackTokens(data.tokens || 0);
        break;
        
      case 'error_occurred':
        analyticsService.trackError();
        break;
        
      default:
        console.log(`📊 Unknown analytics event: ${event}`);
    }
    
    return res.json({ success: true, message: 'Analytics event tracked' });
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    return res.status(500).json({ error: 'Failed to track analytics event' });
  }
});

// DELETE /api/analytics/reset
router.delete('/analytics/reset', (req, res) => {
  try {
    analyticsService.reset();
    
    return res.json({ 
      success: true, 
      message: 'Analytics data reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Analytics reset error:', error);
    return res.status(500).json({ error: 'Failed to reset analytics data' });
  }
});

export default router;
