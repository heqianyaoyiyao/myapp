// var express = require('express');
import express from "express";
const router = express.Router();

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// module.exports = router;
export default router
