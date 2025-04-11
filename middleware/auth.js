const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');

const SECRET_KEY = "your_secret_key";

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;  // Attach user info to request object
        next();
    } catch (err) {
        return res.redirect("/login");
    }
};

const isNotAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    // If no token exists, the user is not logged in, so continue with the login flow
    if (!token) {
        return next();
    }

    try {
        // If the token is valid, redirect to the dashboard since the user is already logged in
        jwt.verify(token, SECRET_KEY);
        return res.redirect("/dashboard");  // User already logged in
    } catch (err) {
        // If the token is invalid, proceed with the login flow
        return next();
    }
};

const validateToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token is missing or invalid" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Attach the decoded user information to the req object
        req.user = decoded;

        // Call the next middleware/route handler
        next();
    } catch (err) {
        // Token is invalid or expired
        return res.status(403).json({ error: "Token is invalid or expired" });
    }
};

module.exports = { isAuthenticated, isNotAuthenticated, validateToken }
