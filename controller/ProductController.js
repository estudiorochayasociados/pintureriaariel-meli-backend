const axios = require('axios');
const ProductsModel = require('../model/ProductModel');
const { removeSpecialChars } = require('../controller/HelpersController');

exports.updateProductsWithWeb = async (link) => {
    var add = [];
    var update = [];
    var totalArray = [];
    this.setStock(0);
    return axios.get(link)
        .then(async r => {
            for await (const item of r.data) {
                var itemSearch = await this.view(item.data.cod_producto);
                if (itemSearch) {
                    const images = [];
                    itemSearch.title = removeSpecialChars(item.data.titulo);
                    itemSearch.description.text = item.data.desarrollo;
                    itemSearch.description.video = (item.data.video) ? item.data.video : process.env.VIDEO_ITEM;
                    itemSearch.stock = (item.data.stock) ? item.data.stock : 0;
                    itemSearch.code.web = item.data.cod_producto;
                    // itemSearch.mercadolibre = item.mercadolibre;
                    itemSearch.price.default = item.data.precio;
                    itemSearch.category = removeSpecialChars(item.category.data.titulo);
                    itemSearch.subcategory = removeSpecialChars(item.subcategory.data.titulo);
                    item.images.forEach(img => {
                        images.push({ "source": img.ruta, "order": img.orden })
                    });
                    itemSearch.images = images;
                    this.update(itemSearch);
                    update.push({ product: itemSearch.title });
                } else {
                    const data = {};
                    data.description = {};
                    data.code = {};
                    data.price = {};
                    const images = [];
                    data.title = removeSpecialChars(item.data.titulo);
                    data.description.text = item.data.desarrollo;
                    data.description.video = (data.description.video) ? data.description.video : process.env.VIDEO_ITEM;
                    data.stock = (item.data.stock) ? item.data.stock : 0;
                    data.code.web = item.data.cod_producto;
                    // data.mercadolibre = item.mercadolibre;
                    data.price.default = item.data.precio;
                    data.category = removeSpecialChars(item.category.data.titulo);
                    data.subcategory = removeSpecialChars(item.subcategory.data.titulo);
                    item.images.forEach(img => {
                        images.push({ "source": img.ruta, "order": img.orden })
                    });
                    data.images = images;
                    this.create(data);
                    add.push({ product: data.title });
                }
            }
            totalArray.push({ "add": add, "update": update });
            return await totalArray;
        })
}


exports.updateWeb = async (item) => {
    this.setStock(0);
    var itemSearch = (item.data.cod_producto) ? await this.view(item.data.cod_producto) : false;
    if (itemSearch) {
        const images = [];
        itemSearch.title = removeSpecialChars(item.data.titulo);
        itemSearch.description.text = item.data.desarrollo;
        itemSearch.description.video = (item.data.video) ? item.data.video : process.env.VIDEO_ITEM;
        itemSearch.stock = (item.data.stock) ? item.data.stock : 0;
        itemSearch.code.web = item.data.cod_producto;
        // itemSearch.mercadolibre = item.mercadolibre;
        itemSearch.price.default = item.data.precio;
        itemSearch.category = removeSpecialChars(item.category.data.titulo);
        itemSearch.subcategory = removeSpecialChars(item.subcategory.data.titulo);
        item.images.forEach(img => {
            images.push({ "source": img.ruta, "order": img.orden })
        });
        itemSearch.images = images;
        if (this.update(itemSearch)) {
            return ({ status: 200, type: "update", title: item.data.titulo });
        } else {
            return ({ status: 500, type: "update", title: item.data.titulo });
        }
    } else {
        const data = {};
        data.description = {};
        data.code = {};
        data.price = {};
        const images = [];
        data.title = removeSpecialChars(item.data.titulo);
        data.description.text = item.data.desarrollo;
        data.description.video = (data.description.video) ? data.description.video : process.env.VIDEO_ITEM;
        data.stock = (item.data.stock) ? item.data.stock : 0;
        data.code.web = item.data.cod_producto;
        // data.mercadolibre = item.mercadolibre;
        data.price.default = item.data.precio;
        data.category = removeSpecialChars(item.category.data.titulo);
        data.subcategory = removeSpecialChars(item.subcategory.data.titulo);
        item.images.forEach(img => {
            images.push({ "source": img.ruta, "order": img.orden })
        });
        data.images = images;
        if (this.create(itemSearch)) {
            return ({ status: 200, type: "create", title: item.data.titulo });
        } else {
            return ({ status: 500, type: "create", title: item.data.titulo });
        }
    }
}

exports.list = async () => {
    return ProductsModel.find();
    //return ProductsModel.find().limit(100);
}

exports.create = (item) => {
    var data = new ProductsModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return ProductsModel.update({ 'code.web': item.code.web }, { $set: item }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = function (codigo) {
    return ProductsModel.findOne({ 'code.web': codigo }, (err, res) => { return res });
};

exports.setStock = function (stock) {
    return ProductsModel.updateMany({}, { stock: stock })
}