// Shared analytics service for tracking usage across all routes
class AnalyticsService {
  constructor() {
    this.data = {
      totalRequests: 0,
      totalTokens: 0,
      totalConversations: 0,
      dailyStats: {},
      hourlyStats: {},
      errorCount: 0,
      averageResponseTime: 0,
      responseTimes: [],
      taskTypes: {
        coding: 0,
        writing: 0,
        analysis: 0,
        math: 0,
        creative: 0,
        education: 0,
        general: 0
      },
      userAgents: {},
      ipAddresses: {}
    };
  }

  // Track a new request
  trackRequest(req) {
    this.data.totalRequests++;
    
    // Track daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!this.data.dailyStats[today]) {
      this.data.dailyStats[today] = {
        requests: 0,
        conversations: 0,
        errors: 0
      };
    }
    this.data.dailyStats[today].requests++;
    
    // Track hourly stats
    const hour = new Date().getHours();
    if (!this.data.hourlyStats[hour]) {
      this.data.hourlyStats[hour] = 0;
    }
    this.data.hourlyStats[hour]++;
    
    // Track user agent
    const userAgent = req.get('User-Agent') || 'Unknown';
    this.data.userAgents[userAgent] = (this.data.userAgents[userAgent] || 0) + 1;
    
    // Track IP address
    const ip = req.ip || req.connection.remoteAddress;
    this.data.ipAddresses[ip] = (this.data.ipAddresses[ip] || 0) + 1;
  }

  // Track response time
  trackResponseTime(responseTime) {
    this.data.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times for average calculation
    if (this.data.responseTimes.length > 1000) {
      this.data.responseTimes.shift();
    }
    
    // Calculate average response time
    this.data.averageResponseTime = this.data.responseTimes.reduce((a, b) => a + b, 0) / this.data.responseTimes.length;
  }

  // Track tokens used
  trackTokens(tokens) {
    this.data.totalTokens += tokens;
  }

  // Track conversation
  trackConversation() {
    this.data.totalConversations++;
  }

  // Track error
  trackError() {
    this.data.errorCount++;
  }

  // Track task type
  trackTaskType(taskType) {
    if (this.data.taskTypes[taskType]) {
      this.data.taskTypes[taskType]++;
    }
  }

  // Get analytics overview
  getOverview() {
    return {
      totalRequests: this.data.totalRequests,
      totalConversations: this.data.totalConversations,
      totalTokens: this.data.totalTokens,
      errorCount: this.data.errorCount,
      averageResponseTime: Math.round(this.data.averageResponseTime),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      taskTypeDistribution: this.data.taskTypes,
      topUserAgents: Object.entries(this.data.userAgents)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([agent, count]) => ({ agent, count })),
      topIPAddresses: Object.entries(this.data.ipAddresses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      timestamp: new Date().toISOString()
    };
  }

  // Get daily stats
  getDailyStats(days = 7) {
    const dailyStats = [];
    
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push({
        date: dateStr,
        requests: this.data.dailyStats[dateStr]?.requests || 0,
        conversations: this.data.dailyStats[dateStr]?.conversations || 0,
        errors: this.data.dailyStats[dateStr]?.errors || 0
      });
    }
    
    return {
      dailyStats: dailyStats.reverse(),
      totalDays: parseInt(days),
      timestamp: new Date().toISOString()
    };
  }

  // Get hourly stats
  getHourlyStats() {
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      requests: this.data.hourlyStats[hour] || 0
    }));
    
    return {
      hourlyStats,
      timestamp: new Date().toISOString()
    };
  }

  // Reset analytics
  reset() {
    this.data = {
      totalRequests: 0,
      totalTokens: 0,
      totalConversations: 0,
      dailyStats: {},
      hourlyStats: {},
      errorCount: 0,
      averageResponseTime: 0,
      responseTimes: [],
      taskTypes: {
        coding: 0,
        writing: 0,
        analysis: 0,
        math: 0,
        creative: 0,
        education: 0,
        general: 0
      },
      userAgents: {},
      ipAddresses: {}
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
