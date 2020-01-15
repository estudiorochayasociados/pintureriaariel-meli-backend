const express = require('express');
const UserController = require('../controller/UserController');
const Middelware = require("../config/Middleware");
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get("/", Middelware.checkToken, async (req, res) => {
    const get = await UserController.list();
    res.status(200).send(get);
})

router.get("/check-token",Middelware.checkToken, (req, res) => {
    console.log(req);
    res.status(200).json({"status":true});
})
 

router.get("/:id", Middelware.checkToken ,async (req, res) => {
    let view = await UserController.view(req.params.id);
    res.status(200).json(view);
})

router.post("/", Middelware.checkToken, async (req, res) => {
    const response = await UserController.create(req.body);
    res.status(200).send({ response });
})
 
router.post('/auth', async (req, res) => {
    const login = await UserController.login(req.body.email, req.body.password);
    if (login) {
        const token = jwt.sign({check:true}, process.env.JWT, {
            expiresIn: "1h"
        });
        res.json({
            message: 'Autenticación correcta',
            token: token
        });
    } else {
        res.json({ error: "Usuario o contraseña incorrectos" })
    }
})

router.put("/", Middelware.checkToken, async (req, res) => {
    let view = await UserController.view(req.params.id);
    res.status(200).json(view);
})

router.delete("/:id", Middelware.checkToken, async (req, res) => {
    let del = await UserController.delete(req.params.id);
    res.status(200).json(del);
})

module.exports = router;