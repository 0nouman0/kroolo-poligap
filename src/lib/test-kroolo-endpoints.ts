// Utility to test Kroolo AI endpoints
export const testKrooloEndpoints = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL;
  const aiUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI;

  console.log('Testing Kroolo AI endpoints...');
  console.log('Base URL:', baseUrl);
  console.log('AI URL:', aiUrl);

  const results = {
    baseUrlReachable: false,
    aiUrlReachable: false,
    globalChatEndpoint: false,
    chatWithAiEndpoint: false,
    extractFileEndpoint: false
  };

  // Test base URL
  try {
    const response = await fetch(`${baseUrl}/health`, { method: 'GET' });
    results.baseUrlReachable = response.status < 500;
    console.log('Base URL health check:', response.status);
  } catch (error) {
    console.log('Base URL not reachable:', error);
  }

  // Test AI URL
  try {
    const response = await fetch(`${aiUrl}/health`, { method: 'GET' });
    results.aiUrlReachable = response.status < 500;
    console.log('AI URL health check:', response.status);
  } catch (error) {
    console.log('AI URL not reachable:', error);
  }

  // Test global chat endpoint
  try {
    const response = await fetch(`${aiUrl}/global-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Hello, this is a test message',
        user_id: 'test',
        organization_id: 'test',
        session_id: 'test',
        enable: true
      })
    });
    results.globalChatEndpoint = response.status < 500;
    console.log('Global chat endpoint test:', response.status);
  } catch (error) {
    console.log('Global chat endpoint error:', error);
  }

  // Test chat with AI endpoint
  try {
    const response = await fetch(`${baseUrl}/kroolo-ai/chat-with-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Hello, this is a test message'
      })
    });
    results.chatWithAiEndpoint = response.status < 500;
    console.log('Chat with AI endpoint test:', response.status);
  } catch (error) {
    console.log('Chat with AI endpoint error:', error);
  }

  // Test extract file endpoint
  try {
    const testFile = new Blob(['This is a test file content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile, 'test.txt');

    const response = await fetch(`${aiUrl}/extract-file-data`, {
      method: 'POST',
      body: formData
    });
    results.extractFileEndpoint = response.status < 500;
    console.log('Extract file endpoint test:', response.status);
  } catch (error) {
    console.log('Extract file endpoint error:', error);
  }

  console.log('Endpoint test results:', results);
  return results;
};

// Function to be called from browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testKrooloEndpoints = testKrooloEndpoints;
}