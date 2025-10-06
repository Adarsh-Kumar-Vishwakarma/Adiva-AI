import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Claude AI Service
 * Handles all interactions with Anthropic's Claude API
 */
class ClaudeService {
  /**
   * Generate a response using Claude AI
   * @param {Object} params - Parameters for the API call
   * @param {string} params.model - Claude model to use
   * @param {Array} params.messages - Array of message objects
   * @param {number} params.maxTokens - Maximum tokens to generate
   * @param {number} params.temperature - Temperature for response generation
   * @param {string} params.systemPrompt - System prompt (optional)
   * @returns {Promise<Object>} Response from Claude API
   */
  static async generateResponse({
    model = 'claude-sonnet-4-20250514',
    messages = [],
    maxTokens = 2000,
    temperature = 0.7,
    systemPrompt = null
  }) {
    try {
      console.log(`🤖 Claude API call - Model: ${model}`);
      console.log(`📝 Messages count: ${messages.length}`);
      console.log(`🔑 Anthropic API Key present: ${!!process.env.ANTHROPIC_API_KEY}`);

      // Prepare the request parameters
      const requestParams = {
        model,
        max_tokens: Math.min(maxTokens, 200000), // Claude's max is 200k
        temperature: Math.max(0, Math.min(1, temperature)), // Claude's range is 0-1
        messages: messages
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      const response = await claude.messages.create(requestParams);

      console.log(`✅ Claude response generated successfully`);
      console.log(`📊 Response length: ${response.content[0].text.length} characters`);

      return {
        content: response.content[0].text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        stop_reason: response.stop_reason
      };

    } catch (error) {
      console.error('❌ Claude API Error:', error);
      throw error;
    }
  }

  /**
   * Generate a response with image using Claude AI
   * @param {Object} params - Parameters for the API call
   * @param {string} params.model - Claude model to use
   * @param {Array} params.messages - Array of message objects with image
   * @param {number} params.maxTokens - Maximum tokens to generate
   * @param {number} params.temperature - Temperature for response generation
   * @param {string} params.systemPrompt - System prompt (optional)
   * @returns {Promise<Object>} Response from Claude API
   */
  static async generateResponseWithImage({
    model = 'claude-sonnet-4-20250514', // Use Opus for vision tasks
    messages = [],
    maxTokens = 2000,
    temperature = 0.7,
    systemPrompt = null
  }) {
    try {
      console.log(`🖼️ Claude Vision API call - Model: ${model}`);
      console.log(`📝 Messages count: ${messages.length}`);
      console.log(`🔑 Anthropic API Key present: ${!!process.env.ANTHROPIC_API_KEY}`);

      // Prepare the request parameters
      const requestParams = {
        model,
        max_tokens: Math.min(maxTokens, 200000),
        temperature: Math.max(0, Math.min(1, temperature)),
        messages: messages
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      const response = await claude.messages.create(requestParams);

      console.log(`✅ Claude vision response generated successfully`);
      console.log(`📊 Response length: ${response.content[0].text.length} characters`);

      return {
        content: response.content[0].text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        stop_reason: response.stop_reason
      };

    } catch (error) {
      console.error('❌ Claude Vision API Error:', error);
      throw error;
    }
  }

  /**
   * Check if a model is a Claude model
   * @param {string} modelId - Model identifier
   * @returns {boolean} True if it's a Claude model
   */
  static isClaudeModel(modelId) {
    return modelId && modelId.startsWith('claude-');
  }

  /**
   * Get the appropriate Claude model for a task
   * @param {string} taskType - Type of task (coding, analysis, etc.)
   * @param {boolean} hasImage - Whether the task involves image processing
   * @returns {string} Recommended Claude model
   */
  static getRecommendedModel(taskType, hasImage = false) {
    // Always return claude-sonnet-4-20250514 for all tasks
    return 'claude-sonnet-4-20250514';
  }

  /**
   * Convert OpenAI-style messages to Claude format
   * @param {Array} openaiMessages - Messages in OpenAI format
   * @returns {Array} Messages in Claude format
   */
  static convertMessagesToClaudeFormat(openaiMessages) {
    return openaiMessages.map(msg => {
      if (msg.role === 'assistant') {
        return {
          role: 'assistant',
          content: msg.content
        };
      } else if (msg.role === 'user') {
        return {
          role: 'user',
          content: msg.content
        };
      } else if (msg.role === 'system') {
        // Claude handles system prompts differently
        return {
          role: 'user',
          content: `System: ${msg.content}`
        };
      }
      return msg;
    });
  }

  /**
   * Handle Claude-specific error responses
   * @param {Error} error - Error from Claude API
   * @returns {Object} Formatted error response
   */
  static handleError(error) {
    console.error('❌ Claude Service Error:', error);

    if (error.status === 401) {
      return {
        error: "Invalid Anthropic API key. Please check your configuration.",
        code: 'INVALID_API_KEY'
      };
    } else if (error.status === 429) {
      return {
        error: "Rate limit exceeded. Please wait a moment before trying again.",
        code: 'RATE_LIMIT_EXCEEDED'
      };
    } else if (error.status === 400) {
      return {
        error: "Invalid request to Claude API. Please check your input.",
        code: 'INVALID_REQUEST'
      };
    } else if (error.status === 500) {
      return {
        error: "Claude API is temporarily unavailable. Please try again later.",
        code: 'SERVICE_UNAVAILABLE'
      };
    } else {
      return {
        error: "Something went wrong with the Claude AI service.",
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

export default ClaudeService;
