const express = require('express');
const router = express.Router();
const { isAuthenticated, isNotAuthenticated, validateToken } = require('../middleware/auth.js');

// Front-End Routes
router.get("/", (req, res) => {
    res.render('landing')
});

// Authentication System
router.get("/register", isNotAuthenticated, (req, res) => {
    res.render("register");
});

router.get("/login", isNotAuthenticated, (req, res) => {
    res.render("login");
});

module.exports = router;