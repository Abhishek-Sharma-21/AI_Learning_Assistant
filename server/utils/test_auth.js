import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/users';

async function testAuth() {
  console.log('--- Testing JWT Auth Flow ---');

  try {
    // 1. Register
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    console.log('Register Response:', regData);

    if (!regData.token) throw new Error('No token after registration');

    const token = regData.token;

    // 2. Access Profile (Success)
    const profileRes = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    console.log('Profile Response (Authorized):', profileData);

    // 3. Login
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);

    // 4. Access Profile (Fail - no token)
    const failRes = await fetch(`${API_URL}/profile`);
    const failData = await failRes.json();
    console.log('Profile Response (Unauthorized):', failData);

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

console.log('NOTE: Ensure the server is running on port 5000 before running this script.');
// testAuth(); // Uncomment to run
