const express = require('express');
const config = require('dotenv').config();
const Middelware = require("../config/Middleware");
const ProductController = require('../controller/ProductController');
const router = express.Router();

router.get("/update-products-with-web", async (req, res) => {
    var get = await ProductController.updateProductsWithWeb(config.parsed.JSON_PRODUCT);
    res.send(get);
})


router.post("/update-web", Middelware.checkToken, async (req, res) => {
    const get = await ProductController.updateWeb(req.body.item);
    res.status(200).send(get);
})

router.get("/", Middelware.checkToken, async (req, res) => {
    const get = await ProductController.list();
    res.status(200).send(get);
})

router.get("/:id", Middelware.checkToken, async (req, res) => {
    console.log(req.params.id);
    let view = await ProductController.view(req.params.id);
    res.status(200).json(view);
})

router.post("/", Middelware.checkToken, async (req, res) => {
    const get = await ProductController.create(req.body);
    res.status(200).send({ get });
})

router.put("/", Middelware.checkToken, async (req, res) => {
    const get = await ProductController.update(req.body);
    res.status(200).send({ get });
})
module.exports = router;