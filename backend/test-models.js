import dotenv from 'dotenv';

dotenv.config();

async function testAvailableModels() {
  console.log('🧪 Testing Available AI Models...\n');

  try {
    // Test the AI models endpoint
    const response = await fetch('http://localhost:3001/api/ai-models');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Available AI Models:');
    console.log(`Total models: ${data.totalModels}`);
    console.log('\n📋 Model Details:');
    
    data.models.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.name} (${model.id})`);
      console.log(`   Provider: ${model.provider}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Max Tokens: ${model.maxTokens.toLocaleString()}`);
      console.log(`   Cost: $${model.costPer1kTokens}/1k tokens`);
      console.log(`   Capabilities: ${model.capabilities.join(', ')}`);
    });
    
    console.log('\n🎉 Model configuration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 3001');
  }
}

// Run the test
testAvailableModels();
