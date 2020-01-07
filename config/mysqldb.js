'user strict';

var mysql = require('mysql2/promise');

//local mysql db connection
var opts = {
    host: "hostname",
    port: "3306",
    user: "userid",
    password: "passwd",
    database: 'mockapi'
};

const pool = mysql.createPool(opts);

const dbTest = async () => {
    const connection = await pool.getConnection(async conn => conn);

    if (connection) {
        console.log("DB Connected!");
        connection.release();
    }

};

var test = dbTest();

module.exports = pool;