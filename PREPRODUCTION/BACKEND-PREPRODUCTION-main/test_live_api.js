const axios = require('axios');
axios.patch('https://crmapi.redanglestudio.in/api/assigned-projects/LD-02/client-requirements', {
    projectType: 'Save the Video',
    referenceLink: 'http://test.com',
    imageNumbers: '1,2,3'
})
.then(res => console.log('Success:', res.data))
.catch(err => {
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    console.error('Error message:', err.message);
});
