const mongoose = require('mongoose');
const { Schema } = mongoose;

const Product = new Schema({
    title: {
        type: String,
        required: 'Ingresar titulo',
        uppercase: true
    },
    category: {
        type: String,
        trim: true,
        uppercase: true
    },
    subcategory: {
        type: String,
        uppercase: true
    },
    stock: Number,
    code: {
        web: {
            type: String,
            required: "Ingresar codigo",
            unique: true
        },
        erp: {
            type: String
        }
    },
    mercadolibre: Array,
    description: {
        text: String,
        ean: String,
        video: String,
    },
    images: Array,
    attributes: Array,
    shipping: Number,
    price: {
        default: {
            type: Number,
            required: "Ingresar precio lista"
        },
        discount: Number
    },
    date: {
        created_at: { type: Date },
        updated_at: { 
            type: Date, 
            default: Date.now
        }
    }
},{ 
    versionKey: false 
});

module.exports = mongoose.model('Product', Product);