const mongoose = require('mongoose'); 
const config  = require('dotenv').config();
mongoose.connect('mongodb+srv://'+config.parsed.MONGO_USER+':'+config.parsed.MONGO_PASS+'@'+config.parsed.MONGO_HOST+'/'+config.parsed.MONGO_DB+'?retryWrites=true&w=majority', function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

