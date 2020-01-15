const mongoose = require('mongoose');
const { Schema } = mongoose;

const Token = new Schema({
    user_id: {
        type: Number,
        unique:true,
        required: 'require'        
    },
    access_token: {
        type: String,
        required: 'require'        
    },
    refresh_token: {
        type: String,
        required: 'require'        
    },
    date : {        
        type: Date,
        required: 'require'
    }
},{ 
    versionKey: false 
});

module.exports = mongoose.model('Token', Token);