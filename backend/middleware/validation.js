import { body, param, query, validationResult } from 'express-validator';

// Validation rules for chat endpoints
export const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message must be between 1 and 10,000 characters'),
  
  body('conversationId')
    .optional()
    .isString()
    .withMessage('Conversation ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation ID must be between 1 and 100 characters'),
  
  body('systemPrompt')
    .optional()
    .isString()
    .withMessage('System prompt must be a string')
    .isLength({ max: 5000 })
    .withMessage('System prompt must not exceed 5,000 characters'),
  
  body('userPrompt')
    .optional()
    .isString()
    .withMessage('User prompt must be a string')
    .isLength({ max: 10000 })
    .withMessage('User prompt must not exceed 10,000 characters')
];

// Validation rules for AI models endpoints
export const aiModelsValidation = [
  body('modelId')
    .optional()
    .isIn(['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'])
    .withMessage('Invalid AI model specified'),
  
  body('messages')
    .optional()
    .isArray()
    .withMessage('Messages must be an array')
    .custom((messages) => {
      if (messages && messages.length > 0) {
        for (const message of messages) {
          if (!message.role || !message.content) {
            throw new Error('Each message must have role and content');
          }
          if (!['system', 'user', 'assistant'].includes(message.role)) {
            throw new Error('Message role must be system, user, or assistant');
          }
          if (typeof message.content !== 'string') {
            throw new Error('Message content must be a string');
          }
        }
      }
      return true;
    }),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 128000 })
    .withMessage('Max tokens must be between 1 and 128,000'),
  
  body('systemPrompt')
    .optional()
    .isString()
    .withMessage('System prompt must be a string')
    .isLength({ max: 5000 })
    .withMessage('System prompt must not exceed 5,000 characters'),
  
  body('userPrompt')
    .optional()
    .isString()
    .withMessage('User prompt must be a string')
    .isLength({ max: 10000 })
    .withMessage('User prompt must not exceed 10,000 characters')
];

// Validation rules for model comparison
export const modelComparisonValidation = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required for comparison')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Prompt must be between 1 and 5,000 characters'),
  
  body('models')
    .optional()
    .isArray()
    .withMessage('Models must be an array')
    .custom((models) => {
      if (models && models.length > 0) {
        const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
        for (const model of models) {
          if (!validModels.includes(model)) {
            throw new Error(`Invalid model: ${model}. Valid models are: ${validModels.join(', ')}`);
          }
        }
      }
      return true;
    }),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2')
];

// Validation rules for analytics endpoints
export const analyticsValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  
  body('event')
    .optional()
    .isIn(['conversation_started', 'tokens_used', 'error_occurred'])
    .withMessage('Invalid analytics event'),
  
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

// Validation rules for conversation history
export const conversationValidation = [
  param('conversationId')
    .trim()
    .notEmpty()
    .withMessage('Conversation ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation ID must be between 1 and 100 characters')
];

// Validation rules for model ID parameter
export const modelIdValidation = [
  param('modelId')
    .trim()
    .notEmpty()
    .withMessage('Model ID is required')
    .isIn(['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'])
    .withMessage('Invalid AI model specified')
];

// Generic validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  if (req.body.message) {
    req.body.message = req.body.message.trim();
  }
  
  if (req.body.systemPrompt) {
    req.body.systemPrompt = req.body.systemPrompt.trim();
  }
  
  if (req.body.userPrompt) {
    req.body.userPrompt = req.body.userPrompt.trim();
  }
  
  if (req.body.prompt) {
    req.body.prompt = req.body.prompt.trim();
  }
  
  // Sanitize conversation ID
  if (req.body.conversationId) {
    req.body.conversationId = req.body.conversationId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }
  
  next();
};

// Rate limiting validation
export const validateRateLimit = (req, res, next) => {
  // This would integrate with your rate limiter
  // For now, just pass through
  next();
};

// Content length validation
export const validateContentLength = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      success: false,
      message: 'Request too large',
      maxSize: '10MB',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}; 