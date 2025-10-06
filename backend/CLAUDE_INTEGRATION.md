# Claude AI Integration Guide

This document explains how Claude AI (Anthropic) has been integrated into your AI assistant project alongside the existing OpenAI integration.

## 🚀 Features Added

### 1. **Multiple AI Models Support**
- **OpenAI Models**: GPT-4o Mini
- **Claude Models**: Claude Sonnet 4

### 2. **Smart Model Selection**
- Automatic detection of Claude vs OpenAI models
- Intelligent model recommendations based on task type
- Support for both text and image processing

### 3. **Unified API Interface**
- Same API endpoints work with both providers
- Consistent error handling and response format
- Seamless switching between models

## 📋 Setup Instructions

### 1. **Install Dependencies**
```bash
cd backend
npm install @anthropic-ai/sdk
```

### 2. **Environment Variables**
Add your Anthropic API key to your `.env` file:

```env
# Existing OpenAI key
OPENAI_API_KEY=your_openai_api_key_here

# New Anthropic key
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. **Get Your Anthropic API Key**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## 🤖 Available AI Models

| Model | Provider | Description | Best For | Cost/1k tokens |
|-------|----------|-------------|----------|----------------|
| `gpt-4o-mini` | OpenAI | Fast and efficient model | Most tasks, quick responses | $0.00015 |
| `claude-sonnet-4-20250514` | Anthropic | Most intelligent Claude model | All tasks including complex reasoning, coding, analysis, vision, math | $0.003 |

## 🔧 API Usage

### Text Chat
```javascript
// Frontend - Model selection is automatic
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello, Claude!",
    modelId: "claude-sonnet-4-20250514", // Claude model
    conversationId: "chat_123"
  })
});
```

### Image Processing
```javascript
// Frontend - Image processing with Claude
const formData = new FormData();
formData.append('image', imageFile);
formData.append('message', 'What do you see?');
formData.append('modelId', 'claude-sonnet-4-20250514'); // Claude with vision

const response = await fetch('/api/chat-with-image', {
  method: 'POST',
  body: formData
});
```

## 🧪 Testing

### Run the Test Script
```bash
cd backend
node test-claude.js
```

This will test:
- ✅ API key validation
- ✅ Basic text generation
- ✅ System prompts
- ✅ Model detection
- ✅ Message conversion
- ✅ Error handling

### Manual Testing
1. Start your backend: `npm run dev`
2. Start your frontend: `npm run dev`
3. In the AI chat interface, select a Claude model
4. Send a message and verify Claude responds

## 🔍 Code Structure

### New Files Added
- `backend/services/claudeService.js` - Claude AI service layer
- `backend/test-claude.js` - Integration test script
- `backend/CLAUDE_INTEGRATION.md` - This documentation

### Modified Files
- `backend/routes/ai-models.js` - Added Claude models
- `backend/routes/chat.js` - Added Claude support
- `backend/env.example` - Added Anthropic API key
- `frontend/src/components/AIchat.tsx` - Model selection UI

## 🎯 Key Features

### 1. **Automatic Model Detection**
```javascript
// Backend automatically detects Claude models
if (ClaudeService.isClaudeModel(modelId)) {
  // Use Claude API
} else {
  // Use OpenAI API
}
```

### 2. **Smart Model Recommendations**
```javascript
// Get best model for specific tasks
const model = ClaudeService.getRecommendedModel('coding'); // Returns claude-3-5-sonnet
const visionModel = ClaudeService.getRecommendedModel('analysis', true); // Returns claude-3-opus
```

### 3. **Unified Error Handling**
```javascript
// Both providers use the same error format
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## 🔒 Security & Best Practices

### 1. **API Key Management**
- Store keys in environment variables
- Never commit keys to version control
- Use different keys for development/production

### 2. **Rate Limiting**
- Both providers have rate limits
- Implement exponential backoff for retries
- Monitor usage in analytics

### 3. **Cost Management**
- Claude models have different pricing
- Monitor token usage
- Set usage limits if needed

## 🚨 Troubleshooting

### Common Issues

#### 1. **"Invalid API Key" Error**
```bash
# Check your .env file
cat .env | grep ANTHROPIC_API_KEY

# Verify the key is correct
node test-claude.js
```

#### 2. **"Rate Limit Exceeded" Error**
- Wait a few minutes before retrying
- Implement exponential backoff
- Consider upgrading your Anthropic plan

#### 3. **Model Not Found Error**
- Check model ID spelling
- Ensure model is available in your region
- Verify your Anthropic account has access

#### 4. **Image Processing Issues**
- Use Claude 3 Opus for best image support
- Check image file size (max 10MB)
- Ensure image format is supported

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG_MODE=true
```

## 📊 Monitoring & Analytics

The integration includes comprehensive analytics:
- Token usage tracking
- Response time monitoring
- Error rate tracking
- Model performance comparison

View analytics in the frontend or check backend logs.

## 🔄 Migration from OpenAI-Only

If you're migrating from OpenAI-only setup:

1. **No Breaking Changes**: Existing functionality continues to work
2. **Gradual Migration**: Switch models one by one
3. **A/B Testing**: Compare responses between providers
4. **Fallback Support**: Automatic fallback to OpenAI if Claude fails

## 🎉 Next Steps

1. **Test the Integration**: Run `node test-claude.js`
2. **Add Your API Key**: Update your `.env` file
3. **Try Different Models**: Test various Claude models
4. **Monitor Performance**: Check analytics and logs
5. **Customize Prompts**: Optimize for Claude's strengths

## 📚 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Model Comparison](https://docs.anthropic.com/claude/models)
- [Rate Limits & Pricing](https://docs.anthropic.com/claude/pricing)
- [Best Practices Guide](https://docs.anthropic.com/claude/docs)

---

**Need Help?** Check the logs, run the test script, or review the error messages for specific guidance.
