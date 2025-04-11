const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require("fs");
const axios = require("axios");

app.use(express.json());
app.use(cookieParser()); // make sure this is above your routes
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const general = require('./routes/general.js');
app.use('/', general);

app.get('/test', (req, res) => {
   res.render('index')
});

app.listen(PORT)
