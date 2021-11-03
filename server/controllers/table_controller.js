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
        var table_name = process.env.TABLE_NAME;
        con.query(`SELECT * FROM ${table_name}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            // When query is done, release the connection
            con.release();
            console.log('Database Connection Released');
            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            res.render('home', { result, column_name, table_name, helpers: { inc: function (value) { return value + 1; } } });
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

            //TODO Add where statemtn from env
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
                console.log('Record Insert Success');
                res.render('add_record', { alert: 'Record added successfully!' });
            })

        })
    })
}

exports.edit = (req, res) => {
    pool.getConnection((err, con) => {
        if (err) throw err; // Failed to connect
        console.log('Connected to Database');

        con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
            con.release();
            console.log('Database Connection Released');
            if (error) throw error;

            var column_name = [];
            Object.keys(fields).forEach(key => {
                column_name.push(fields[key]["name"]);
            });

            var index = parseInt(req.params.id) - 1;
            var instance = result[index];
            var body = `<form class="row g-3 needs-validation" method="POST" action="/editrecord/${req.params.id}" novalidate>`;
            for (let x in column_name) {
                body += `<div class="form-floating"><input type="text" class="form-control" id="floatingInputValue" placeholder=" " value="${instance[column_name[x]]}" name=${parseInt(x) + 1}><label for="floatingInputValue"> ${column_name[x]}</label></div>`
            }
            res.render('edit_record', { body });
        })
    })
}

exports.update = (req, res) => {
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
            var updateSQL = `UPDATE ${process.env.TABLE_NAME} SET `;
            for (let x in column_name) {
                updateSQL += `${column_name[x]} = ?, `;
                VALUES.push(req.body[y]);
                y++;
            }
            updateSQL = updateSQL.substring(0, updateSQL.length - 2);
            updateSQL += ` WHERE ${column_name[0]} = ${req.body[1]}`;
            con.query(updateSQL, VALUES, (err, result) => {
                if (error) throw error;
                console.log('Record Update Success');
                con.query(`SELECT * FROM ${process.env.TABLE_NAME}${process.env.WHERE_STATEMENT}`, (error, result, fields) => {
                    con.release();
                    console.log('Database Connection Released');
                    if (error) throw error;

                    var column_name = [];
                    Object.keys(fields).forEach(key => {
                        column_name.push(fields[key]["name"]);
                    });

                    var index = parseInt(req.params.id) - 1;
                    var instance = result[index];
                    var body = `<form class="row g-3 needs-validation" method="POST" action="/editrecord/${req.params.id}" novalidate>`;
                    for (let x in column_name) {
                        body += `<div class="row mb-3"><label class="col-sm-4 col-form-label">${column_name[x]}</label><div class="col-sm-7"><input type="text" class="form-control" value="${instance[column_name[x]]}" name=${parseInt(x) + 1}></div></div>`
                    }
                    res.render('edit_record', { body, alert: `Record ${column_name[0]} ${instance[column_name[0]]} updated successfully!` });
                })
            })
        })
    })
}