const mysql = require('mysql')
const config = require('./db_config')

const db = mysql.createPool(config)

module.exports = db