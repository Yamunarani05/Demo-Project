const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const token = jwt.sign(
  { id: '3', email: 'mukil2870@gmail.com', name: 'DEMO 3', role: 'client' },
  JWT_SECRET,
  { expiresIn: '30d' }
);

async function test() {
  try {
    const reqRes = await axios.get('http://localhost:5002/api/preproduction/raw-data-links?type=Save%20the%20Date', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(reqRes.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
