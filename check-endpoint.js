const axios = require('axios');

async function checkEndpoint() {
  try {
    console.log('Checking /api/v1/auth/register endpoint...');
    const response = await axios.options('http://localhost:3000/api/v1/auth/register');
    console.log('✅ Endpoint is accessible');
    console.log('Allowed methods:', response.headers['allow'] || 'Not specified');
  } catch (error) {
    console.error('❌ Could not access endpoint:', error.message);
  }
}

checkEndpoint();
