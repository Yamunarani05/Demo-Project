const axios = require('axios');
axios.get('http://localhost:5001/api/employee/EMP-12/assigned-projects') // Try any employee ID that might have assignments
  .then(res => {
     console.log(JSON.stringify(res.data.data, null, 2));
  })
  .catch(console.error);
