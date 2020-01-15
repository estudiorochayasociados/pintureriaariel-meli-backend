const express = require("express");
const config = require("./config"); 
const app = express();

//settings
app.use(config.morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(config.cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    next();
});

app.listen(process.env.PORT); 
//Routes
app.use('/mercadolibre', require("./routes/MercadolibreRoute"));
app.use('/product', require("./routes/ProductRoute"));
app.use('/user', require("./routes/UserRoute"));

