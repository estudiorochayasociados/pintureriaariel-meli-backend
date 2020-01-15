const mongoose = require('mongoose');
const { Schema } = mongoose;

const Config = new Schema({
    gold_especial_percent: {
        type: String,
        required: 'require'        
    },
    gold_pro_percent: {
        type: String,
        required: 'require'        
    },
    shipping: {
        type: Boolean,
        required: 'require'
    }
},{ 
    versionKey: false 
});

module.exports = mongoose.model('Config', Config);