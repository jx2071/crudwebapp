const express = require('express');
const exphb = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//Parsing middlware
//Parsing application/s-www-form-urlencoded
app.use(bodyParser.urlencoded({ entended: false }));
//Parsing application/json
app.use(bodyParser.json());

//Static files
app.use(express.static('./public'));

app.engine('hbs', exphb({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//Connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_Host,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});



//Router
const routes = require('./server/routes/table');
app.use('/', routes);
//Start server
app.listen(port, () => console.log(`Listening on port ${port}`));