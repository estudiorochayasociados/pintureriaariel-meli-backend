const axios = require('axios');
const cron = require('node-cron');
const jwt = require("jsonwebtoken");

exports.refreshToken = (async () => {
    await axios.get(process.env.URL + "/mercadolibre/refresh-token").then(r => { console.log(r.data) });
});

exports.checkToken = ((req, res, next) => { 
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, process.env.JWT, (err, decoded) => {
            if (err) {
                return res.json({ message: 'Token inválida' });
            } else {
                next();
            }
        });
    } else {
        res.send({
            message: 'Token no proveída.'
        });
    }
});

cron.schedule("* 45 * * * *", async () => {
    await this.refreshToken();
});