const axios = require('axios');

const API_BASE_URL = 'http://localhost:4210/api/v1';

async function loginAndGetToken() {
  const resp = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: 'admin@gmail.com',
    password: 'password@123'
  }, { headers: { 'Content-Type': 'application/json' } });
  const token = resp.data.accessToken
    || resp.headers['x-access-token']
    || (resp.headers['authorization'] ? resp.headers['authorization'].replace('Bearer ', '') : undefined);
  if (!token) throw new Error('No token received from login');
  return token;
}

async function run() {
  try {
    console.log('Authenticating...');
    const token = await loginAndGetToken();
    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log('\n1) PUT /settings/family (create or update)');
    const upsertBody = {
      familyName: 'The Johnson Family',
      familyBio: 'We love capturing moments together',
      familyPhoto: '/photos/johnson-cover.jpg'
    };
    const putResp = await axios.put(`${API_BASE_URL}/settings/family`, upsertBody, { headers: { ...authHeaders, 'Content-Type': 'application/json' } });
    console.log('Status:', putResp.status);
    console.log('Response:', JSON.stringify(putResp.data, null, 2));

    console.log('\n2) GET /settings/family (requires auth)');
    const getAuthResp = await axios.get(`${API_BASE_URL}/settings/family`, { headers: authHeaders });
    console.log('Status:', getAuthResp.status);
    console.log('Response:', JSON.stringify(getAuthResp.data, null, 2));

    console.log('\n3) GET /settings/family/public (no auth)');
    const getPublicResp = await axios.get(`${API_BASE_URL}/settings/family/public`);
    console.log('Status:', getPublicResp.status);
    console.log('Response:', JSON.stringify(getPublicResp.data, null, 2));

    console.log('\n✅ Settings controller tests completed');
  } catch (err) {
    console.error('\n❌ Settings controller test failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

run();


