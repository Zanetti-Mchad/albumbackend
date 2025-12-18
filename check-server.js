const axios = require('axios');

async function checkServer() {
  try {
    console.log('Checking server connection...');
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Server is running');
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('❌ Could not connect to server:', error.message);
  }
}

checkServer();
