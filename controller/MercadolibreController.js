const axios = require('axios');
const ProductsModel = require('../model/ProductModel');
const TokenController = require('../controller/TokenController');

//AUTH LOGIN
exports.getUrlAuth = async (app_id, redirect_uri) => {
    return "http://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=" + app_id + "&redirect_uri=" + redirect_uri;

}

exports.auth = async (code, redirect_uri) => {
    return await axios.post('https://api.mercadolibre.com/oauth/token?grant_type=authorization_code',
        {
            client_id: process.env.APP_ID,
            client_secret: process.env.APP_SECRET,
            code: code,
            redirect_uri: redirect_uri
        })
        .then(async response => {
            //console.log(response);
            await TokenController.update(response.data);
            return response.data
        })
        .catch(error => {
            console.log(error.data);
        })
}

exports.checkToken = async (access_token) => {
    //console.log(access_token);
    return await axios.get("https://api.mercadolibre.com/users/me?access_token=" + access_token)
        .then(response => {
            return response.data;
        })
        .catch(async error => {
            const refreshToken = await this.refreshToken();
            return refreshToken;
        })
}

exports.refreshToken = async () => {
    const token = await TokenController.view(process.env.USER_ID);
    return await axios.post("https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=" + process.env.APP_ID + "&client_secret=" + process.env.APP_SECRET + "&refresh_token=" + token.refresh_token)
        .then(async r => {
            //console.log(r);
            await TokenController.update(r.data);
            return r.data
        })
        .catch(e => {
            console.log(e);
            return e.data
        });
}

//CATEGORIES 
exports.getPredictionCategory = async (title) => {
    return axios.get("https://api.mercadolibre.com/sites/MLA/category_predictor/predict?title=" + title)
        .then(async r => {
            var data = {};
            data.dimensions = 0;
            var id = r.data.id;
            if (r.data.shipping_modes.indexOf("me2")) {
                dimensions = await this.getShippingDimension(id);
                if (dimensions) {
                    data.dimensions = dimensions;
                }
            }
            data.id = id;
            return data;
        })
        .catch(e => {
            console.log(e.response);
        })

}

exports.getGarantyCategory = async (cod, garanty) => {
    return axios.get("https://api.mercadolibre.com/categories/" + cod + "/sale_terms")
        .then(async r => {
            var days = r.data[r.data.length - 1].value_max_length;
            if (r.data[r.data.length - 1].id == 'MANUFACTURING_TIME') {
                return (garanty <= days) ? garanty : 0;
            } else {
                return 0;
            }
        })
        .catch(e => {
            console.log(e.response);
        })

}

exports.getShippingDimension = async (categorie) => {
    return await axios.get("https://api.mercadolibre.com/categories/" + categorie + "/shipping_preferences")
        .then(r => {
            if (r.data.dimensions != null) {
                dimensions = r.data.dimensions.height + "x" + r.data.dimensions.width + "x" + r.data.dimensions.length + "," + r.data.dimensions.weight;
            } else {
                dimensions = 0;
            }
            return Number(dimensions);
        })
        .catch(e => {
            console.log(e.response);
        })
}


//SHIPPING
exports.shippingPriceByDimension = async (dimension) => {
    return await axios.get("https://api.mercadolibre.com/sites/MLA/shipping_options?zip_code_from=2400&zip_code_to=1001&dimensions=" + dimensions)
        .then(r => {
            price = r["data"]["options"]["0"]["list_cost"] + 100;
            return price;
        })
        .catch(e => {
            console.log(e.response.data);
        })
}

exports.addItem = async (data, addShipping, percentPrice, type, garanty, token) => {
    //PREDICCION DE LA CATEGORIA VIA TITULO
    const category = await this.getPredictionCategory(data.title + data.category + data.subcategory);
    const garantyDays = Number((garanty != 0) ? await this.getGarantyCategory(category.id, garanty) : 0);
    //CALCULAR PRECIO ME2 X CATEGORIA
    var shipping = (addShipping === true && (category.dimensions !== null || category.dimensions !== undefined || category.dimensions !== 0)) ? await this.shippingPriceByDimension(category.dimensions) : 0;

    //CREATE OBJETO MELI
    const itemMeli = {};
    itemMeli.title = data.title;
    itemMeli.currency_id = "ARS";
    itemMeli.available_quantity = (data.stock) ? data.stock : 1;
    itemMeli.buying_mode = "buy_it_now";
    itemMeli.condition = "new";
    itemMeli.price = ((data.price.default * (percentPrice / 100) + data.price.default) + shipping).toFixed(2);
    itemMeli.description = { plain_text: data.description.text };
    itemMeli.pictures = [];
    itemMeli.attributes = [];
    itemMeli.attributes.push({ "id": "EAN", "name": "EAN", "value_id": null, "value_name": "7794940000796" });
    data.images.forEach(img => {
        itemMeli.pictures.push({ source: img.source });
    });
    itemMeli.video_id = data.description.video;
    itemMeli.listing_type_id = type;
    itemMeli.category_id = category.id;

    // SET MANUFACTURING_TIME
    if (garantyDays != 0) {
        itemMeli.sale_terms = [];
        itemMeli.sale_terms.id = "MANUFACTURING_TIME";
        itemMeli.sale_terms.value_id = null;
        itemMeli.sale_terms.value_name = garantyDays + " dias";
    }

    try {
        const itemPost = await axios.post("https://api.mercadolibre.com/items?access_token=" + token, itemMeli);
        const findMongoDb = await ProductsModel.findOne({ "code.web": data.code.web });
        await findMongoDb.mercadolibre.push({ type: type, shipping: addShipping, code: itemPost.data.id, price: itemMeli.price, percent: percentPrice });
        await findMongoDb.save();
        return ({ status: 200, title: itemMeli.title, type: type, shipping: addShipping, code: itemPost.data.id, price: itemMeli.price, percent: percentPrice });
    }
    catch (e) {
        return ({ status: 400, title: itemMeli.title, error: e.response.data });
    }
}

exports.editItem = async (itemId, data, addShipping, percentPrice, type, token) => {
    //PREDICCION DE LA CATEGORIA VIA TITULO
    const category = await this.getPredictionCategory(data.title + data.category + data.subcategory);
    //const garantyDays = Number((garanty != 0) ? await this.getGarantyCategory(category.id, garanty) : 0);

    //CALCULAR PRECIO ME2 X CATEGORIA
    var shipping = (addShipping === true && (category.dimensions !== null || category.dimensions !== undefined || category.dimensions !== 0)) ? await this.shippingPriceByDimension(category.dimensions) : 0;
    if (!data.stock) {
        await this.changeState(itemId, 'paused', token);
        return ({ status: 200, title: data.title, error: { message: "Anuncio pausado por bajo stock" } });
    } else {
        await this.changeState(itemId, 'active', token);
        //CREATE OBJETO MELI
        const itemMeli = {};
        itemMeli.title = data.title;
        itemMeli.available_quantity = data.stock;
        itemMeli.price = ((data.price.default * (percentPrice / 100) + data.price.default) + shipping).toFixed(2);
        itemMeli.video_id = data.description.video;
        itemMeli.pictures = [];
        itemMeli.attributes = [];
        itemMeli.attributes.push({ "id": "EAN", "name": "EAN", "value_id": null, "value_name": "7794940000796" });
        data.images.forEach(img => {
            itemMeli.pictures.push({ source: img.source });
        });

        // SET MANUFACTURING_TIME
        // if (garantyDays != 0) {
        //     itemMeli.sale_terms = [];
        //     itemMeli.sale_terms.id = "MANUFACTURING_TIME";
        //     itemMeli.sale_terms.value_id = null;
        //     itemMeli.sale_terms.value_name = garantyDays + " dias";
        // }

        try {
            const itemPost = await axios.put("https://api.mercadolibre.com/items/" + itemId + "?access_token=" + token, itemMeli);
            const findMongoDb = await ProductsModel.findOne({ "code.web": data.code.web });
            indexMeliObject = await findMongoDb.mercadolibre.findIndex(x => x.code === itemId);
            await findMongoDb.mercadolibre.splice(indexMeliObject, 1);
            await findMongoDb.mercadolibre.push({ type: type, shipping: addShipping, code: itemId, price: itemMeli.price, percent: percentPrice });
            await findMongoDb.save();
            return ({ status: 200, title: data.title, type: type, shipping: addShipping, code: itemPost.data.id, price: itemMeli.price, percent: percentPrice });
        }
        catch (e) {
            return ({ status: 400, title: data.title, error: e.response.data });
        }
    }
}

exports.changeState = (item_id, status, token) => {
    return axios.put("https://api.mercadolibre.com/items/" + item_id + "?access_token=" + token, { "status": status })
        .then(response => {
            //console.log(response.data);
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response);
            }
            console.log("Problem submitting New Post", error);
        });
}