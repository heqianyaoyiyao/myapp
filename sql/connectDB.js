// const mysql = require('mysql')
// const config = require('./db_config')

// import mysql from 'mysql'

import mysql from 'mysql2/promise'
import config from './db_config.js'

const db = mysql.createPool(config)

// module.exports = db
export default db