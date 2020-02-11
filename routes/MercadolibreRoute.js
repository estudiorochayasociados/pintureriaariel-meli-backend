const express = require('express');
const Middleware = require("../config/Middleware");
const MercadolibreController = require('../controller/MercadolibreController');
const TokenController = require('../controller/TokenController');
const ConfigController = require('../controller/ConfigController');
const router = express.Router();

//login user
router.get("/auth", async function (req, res) {
    const url = await MercadolibreController.getUrlAuth(process.env.APP_ID, process.env.REDIRECT_URI + "/mercadolibre/login");
    res.redirect(url);
});

router.get("/login", async function (req, res) {
    const auth = await MercadolibreController.auth(req.query.code, process.env.REDIRECT_URI + "/mercadolibre/login");
    if (auth) {
        res.json(auth)
    }
});

router.get("/refresh-token", async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    console.log(process.env.USER_ID);
    console.log(token);
    const reAuth = await MercadolibreController.checkToken(token.access_token);
    if (reAuth) {
        res.json(reAuth)
    } else {
        res.send(400);
    }
});

//items
router.post("/item", Middleware.checkToken, async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const add = await MercadolibreController.addItem(req.body.item, req.body.shipping, req.body.percent, req.body.type, req.body.garanty, token.access_token);
    res.status(200).send(add);
});

router.put("/item/:id", Middleware.checkToken, async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const edit = await MercadolibreController.editItem(req.params.id, req.body.item, req.body.shipping, req.body.percent, req.body.type, token.access_token);
    res.status(200).send(edit);
});

router.get("/item/:id", Middleware.checkToken, async (req, res) => {
    const get = await MercadolibreController.getItem(req.params.id, token.access_token);
    res.status(200).send({ get });
});


router.post('/change-status/:id', async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const obj = await MercadolibreController.changeState(req.params.id, req.body.status, token.access_token);
    res.status(200).send(token.access_token);
})

//ventas
router.get("/orders", Middleware.checkToken, async (req, res) => {
    MercadolibreController.getOrders(token.access_token, process.env.USER_ID, 1).then((err, data) => {
        if (err) res.send(400).json(err.data);
        res.json({ data });
    });
});

router.get("/ordersGetAll", Middleware.checkToken, async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const orders = [];
    for (i = 1300; i < 2000; i++) {
        console.log(i)
        const r = await MercadolibreController.getOrders(token.access_token, process.env.USER_ID, i);
        r.forEach(async element => {
            var buyer = (element.buyer);
            const data = [];
            data.nombre = buyer.first_name;
            data.apellido = buyer.last_name;
            data.email = buyer.email;
            data.celular = buyer.phone;
            data.telefono = buyer.alternative_phone;
            data.dni = buyer.billing_info.doc_number;
            //await user.create(data);
            console.log(data);
        });
    }
    res.json({ r });
});

//Configs
router.post("/config", Middleware.checkToken, async (req, res) => {
    console.log(req.body);
    const insertConfig = await ConfigController.create(req.body);
    res.json(insertConfig);
});

router.put("/config", Middleware.checkToken, async (req, res) => {

    const updateConfig = await ConfigController.update(req.body);
    res.json(updateConfig);
});

router.get("/config", async (req, res) => {
    const list = await ConfigController.list();
    res.json(list);
});

module.exports = router;