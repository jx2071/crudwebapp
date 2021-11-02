const mysql = require('mysql');

//Create connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_Host,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


// View table
exports.view = (req, res) => {

    //Connect to DB
    pool.getConnection((err, con) => {
        if (err) throw err; // Failed to connect
        console.log('Connected to Database');

        con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            // When query is done, release the connection
            con.release();
            console.log('Database Connection Released');
            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            res.render('home', { result, column_name });
        })
    })
}

exports.find = (req, res) => {
    //Connect to DB
    pool.getConnection((err, con) => {
        if (err) throw err; // Failed to connect
        console.log('Connected to Database');


        let searchTerm = req.body.search;
        con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            // When query is done, release the connection

            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            var searchSQL = '';
            var LIKE = []
            for (let x in column_name) {
                searchSQL += column_name[x] + ' LIKE ? OR ';
                LIKE.push('%' + searchTerm + '%');
            }
            searchSQL = searchSQL.substring(0, searchSQL.length - 3);

            con.query(`SELECT * FROM ${process.env.TABLE_NAME} WHERE (${searchSQL})`, LIKE, (error, result, fields) => {
                con.release();
                console.log('Database Connection Released');
                if (error) throw error;
                res.render('home', { result, column_name });
            })
        })
    })
}

exports.form = (req, res) => {
    pool.getConnection((err, con) => {
        if (err) throw err; // Failed to connect
        console.log('Connected to Database');

        con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            // When query is done, release the connection
            con.release();
            console.log('Database Connection Released');
            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            res.render('add_record', { result, column_name, helpers: { inc: function (value) { return value + 1; } } });
        })
    })
}

exports.insert = (req, res) => {
    pool.getConnection((err, con) => {
        if (err) throw err; // Failed to connect
        console.log('Connected to Database');

        con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            var y = 1;
            var VALUES = [];
            var insertSQL = `INSERT INTO ${process.env.TABLE_NAME} VALUES (`;
            for (let x in column_name) {
                VALUES.push(req.body[y]);
                y++;
                insertSQL += '?, ';
            }
            insertSQL = insertSQL.substring(0, insertSQL.length - 2);
            insertSQL += ')';


            con.query(insertSQL, VALUES, (error, result) => {
                // When query is done, release the connection
                con.release();
                console.log('Database Connection Released');
                if (error) throw error;
                console.log('Success');
                res.render('add_record', { alert: 'Record added successfully!' });
            })

        })
    })
}