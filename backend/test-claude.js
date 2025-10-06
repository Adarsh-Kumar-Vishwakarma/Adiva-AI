import dotenv from 'dotenv';
import ClaudeService from './services/claudeService.js';

dotenv.config();

async function testClaudeIntegration() {
  console.log('🧪 Testing Claude AI Integration...\n');

  // Check if API key is present
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please add your Anthropic API key to the .env file');
    return;
  }

  console.log('✅ Anthropic API key found');

  try {
    // Test 1: Basic text generation
    console.log('\n📝 Test 1: Basic text generation');
    const response1 = await ClaudeService.generateResponse({
      model: 'claude-sonnet-4-20250514',
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you tell me a short joke about programming?'
        }
      ],
      maxTokens: 100,
      temperature: 0.7
    });

    console.log('✅ Basic response received:');
    console.log(`Content: ${response1.content}`);
    console.log(`Tokens used: ${response1.usage.total_tokens}`);

    // Test 2: System prompt
    console.log('\n📝 Test 2: System prompt');
    const response2 = await ClaudeService.generateResponse({
      model: 'claude-sonnet-4-20250514',
      messages: [
        {
          role: 'user',
          content: 'What is 2+2?'
        }
      ],
      systemPrompt: 'You are a helpful math tutor. Always show your work step by step.',
      maxTokens: 150,
      temperature: 0.3
    });

    console.log('✅ System prompt response received:');
    console.log(`Content: ${response2.content}`);
    console.log(`Tokens used: ${response2.usage.total_tokens}`);

    // Test 3: Model detection
    console.log('\n📝 Test 3: Model detection');
    console.log(`Is claude-sonnet-4-20250514 a Claude model? ${ClaudeService.isClaudeModel('claude-sonnet-4-20250514')}`);
    console.log(`Is gpt-4o-mini a Claude model? ${ClaudeService.isClaudeModel('gpt-4o-mini')}`);

    // Test 4: Recommended model
    console.log('\n📝 Test 4: Model recommendations');
    console.log(`Recommended for coding: ${ClaudeService.getRecommendedModel('coding')}`);
    console.log(`Recommended for general: ${ClaudeService.getRecommendedModel('general')}`);
    console.log(`Recommended for image: ${ClaudeService.getRecommendedModel('analysis', true)}`);

    // Test 5: Message conversion
    console.log('\n📝 Test 5: Message conversion');
    const openaiMessages = [
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];
    const claudeMessages = ClaudeService.convertMessagesToClaudeFormat(openaiMessages);
    console.log('Converted messages:', JSON.stringify(claudeMessages, null, 2));

    console.log('\n🎉 All tests passed! Claude AI integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.status === 401) {
      console.log('💡 This looks like an API key issue. Please check your ANTHROPIC_API_KEY.');
    } else if (error.status === 429) {
      console.log('💡 Rate limit exceeded. Please wait a moment and try again.');
    } else {
      console.log('💡 Check the error details above for more information.');
    }
  }
}

// Run the test
testClaudeIntegration();
