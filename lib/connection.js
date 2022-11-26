const mysql = require('mysql2'); 

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'test',
        password: 'bootcamp',
        database: 'employee_db'
      },  
)

module.exports = db; 