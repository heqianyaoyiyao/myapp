// const mysql = require('mysql')

// const dbConfig = require('./db_config')

import mysql from 'mysql'
import dbConfig from './db_config.js'

const connection = mysql.createConnection(dbConfig);
 
connection.connect();

connection.query('SELECT * FROM `user` WHERE id=2', (error, results, fields) => {
  if (error) {
    throw error;
  }
  console.log('Results:', results);
});

connection.end((err) => {
  if(err) throw err
  console.log('close')
})