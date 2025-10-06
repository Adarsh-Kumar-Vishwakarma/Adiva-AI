import express from "express";
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Available AI models configuration
const AI_MODELS = {
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    maxTokens: 16384,
    costPer1kTokens: 0.00015,
    description: 'Fast and efficient model for most tasks',
    capabilities: ['text-generation', 'conversation', 'analysis', 'coding', 'vision']
  },
  'claude-sonnet-4-20250514': {
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    description: 'Most intelligent Claude model for complex reasoning',
    capabilities: ['text-generation', 'conversation', 'analysis', 'coding', 'reasoning', 'math', 'vision']
  }
};

// GET /api/ai-models
router.get('/ai-models', (req, res) => {
  try {
    const models = Object.entries(AI_MODELS).map(([id, model]) => ({
      id,
      ...model
    }));
    
    return res.json({
      models,
      totalModels: models.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI models list error:', error);
    return res.status(500).json({ error: 'Failed to retrieve AI models' });
  }
});

// GET /api/ai-models/:modelId
router.get('/ai-models/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const model = AI_MODELS[modelId];
    
    if (!model) {
      return res.status(404).json({ error: 'AI model not found' });
    }
    
    return res.json({
      id: modelId,
      ...model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI model details error:', error);
    return res.status(500).json({ error: 'Failed to retrieve AI model details' });
  }
});

// POST /api/ai-models/generate
router.post('/ai-models/generate', async (req, res) => {
  try {
    const { 
      modelId = 'gpt-4o-mini', 
      messages, 
      temperature = 0.7, 
      maxTokens = 2000,
      systemPrompt,
      userPrompt 
    } = req.body;
    
    // Validate model
    if (!AI_MODELS[modelId]) {
      return res.status(400).json({ error: 'Invalid AI model specified' });
    }
    
    // Validate input
    if (!messages && !userPrompt) {
      return res.status(400).json({ error: 'Messages or userPrompt is required' });
    }
    
    // Prepare messages array
    let messageArray = [];
    
    if (systemPrompt) {
      messageArray.push({ role: 'system', content: systemPrompt });
    }
    
    if (messages) {
      messageArray.push(...messages);
    } else if (userPrompt) {
      messageArray.push({ role: 'user', content: userPrompt });
    }
    
    console.log(`🤖 Generating response with model: ${modelId}`);
    console.log(`📝 Message count: ${messageArray.length}`);
    console.log(`🌡️ Temperature: ${temperature}`);
    console.log(`🔢 Max tokens: ${maxTokens}`);
    
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: messageArray,
      temperature: Math.max(0, Math.min(2, temperature)), // Clamp between 0 and 2
      max_tokens: Math.min(maxTokens, AI_MODELS[modelId].maxTokens),
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    
    const aiResponse = response.choices[0].message.content;
    const usage = response.usage;
    
    console.log(`✅ Response generated successfully`);
    console.log(`📊 Tokens used: ${usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${((usage.total_tokens / 1000) * AI_MODELS[modelId].costPer1kTokens).toFixed(6)}`);
    
    return res.json({
      reply: aiResponse,
      model: modelId,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        estimatedCost: ((usage.total_tokens / 1000) * AI_MODELS[modelId].costPer1kTokens).toFixed(6)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI generation error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: "You've run out of OpenAI credits. Please upgrade your plan or add billing details.",
        code: 'INSUFFICIENT_QUOTA'
      });
    } else if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: "Invalid OpenAI API key. Please check your configuration.",
        code: 'INVALID_API_KEY'
      });
    } else if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment before trying again.",
        code: 'RATE_LIMIT_EXCEEDED'
      });
    } else if (error.code === 'context_length_exceeded') {
      return res.status(400).json({
        error: "Message too long. Please reduce the input length.",
        code: 'CONTEXT_LENGTH_EXCEEDED'
      });
    } else {
      return res.status(500).json({
        error: "Something went wrong with the AI generation.",
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// POST /api/ai-models/compare
router.post('/ai-models/compare', async (req, res) => {
  try {
    const { 
      prompt, 
      models = ['gpt-4o-mini', 'claude-sonnet-4-20250514'], 
      temperature = 0.7 
    } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for comparison' });
    }
    
    const results = [];
    
    for (const modelId of models) {
      if (!AI_MODELS[modelId]) {
        results.push({
          model: modelId,
          error: 'Model not found',
          success: false
        });
        continue;
      }
      
      try {
        const startTime = Date.now();
        let response;
        
        // Check if it's a Claude model
        if (modelId.startsWith('claude-')) {
          // Import ClaudeService dynamically to avoid circular imports
          const ClaudeService = (await import('../services/claudeService.js')).default;
          
          const claudeResponse = await ClaudeService.generateResponse({
            model: modelId,
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 1000,
            temperature
          });
          
          response = {
            choices: [{ message: { content: claudeResponse.content } }],
            usage: claudeResponse.usage
          };
        } else {
          // OpenAI model
          response = await openai.chat.completions.create({
            model: modelId,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: 1000,
          });
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push({
          model: modelId,
          response: response.choices[0].message.content,
          usage: response.usage,
          responseTime,
          estimatedCost: ((response.usage.total_tokens / 1000) * AI_MODELS[modelId].costPer1kTokens).toFixed(6),
          success: true
        });
        
      } catch (error) {
        results.push({
          model: modelId,
          error: error.message,
          success: false
        });
      }
    }
    
    return res.json({
      prompt,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Model comparison error:', error);
    return res.status(500).json({ error: 'Failed to compare AI models' });
  }
});

// GET /api/ai-models/capabilities
router.get('/ai-models/capabilities', (req, res) => {
  try {
    const capabilities = {};
    
    Object.entries(AI_MODELS).forEach(([modelId, model]) => {
      model.capabilities.forEach(capability => {
        if (!capabilities[capability]) {
          capabilities[capability] = [];
        }
        capabilities[capability].push({
          modelId,
          name: model.name,
          provider: model.provider
        });
      });
    });
    
    return res.json({
      capabilities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Capabilities error:', error);
    return res.status(500).json({ error: 'Failed to retrieve AI capabilities' });
  }
});

export default router;
