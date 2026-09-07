const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgres://postgres:tns7142006@localhost:6000/Redangle' }); 

pool.query("UPDATE event_details SET media_status = 'verified' WHERE media_status = 'Pending_Verification' AND photo_approved = true AND video_approved = true")
    .then(res => { 
        console.log('Updated rows:', res.rowCount); 
        process.exit(0); 
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
