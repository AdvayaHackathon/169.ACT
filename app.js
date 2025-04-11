const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require("fs");
const axios = require("axios");
const { isAuthenticated, isNotAuthenticated, validateToken } = require('./middleware/auth.js');
const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key";

app.use(express.json());
app.use(cookieParser()); // make sure this is above your routes
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const general = require('./routes/general.js');
app.use('/', general);

function getIndiaTime() {
    let options = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };

    let indiaDateTime = new Intl.DateTimeFormat("en-US", options).format(new Date());
    return indiaDateTime;
}

function generateID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

app.post("/register", isNotAuthenticated, async (req, res) => {
    const { username, email, password, age, gender } = req.body;
    console.log(req.body)
    
    // Read existing users
    let users = JSON.parse(fs.readFileSync("db/users.json", "utf-8"));

    // Check if email or username already exists
    if (users.some((user) => user.email === email)) {
        return res.redirect("/register?status=1");
    }
    
    if (users.some((user) => user.username === username)) {
        return res.redirect("/register?status=2");
    }

    // Generate user ID and timestamp
    let id = generateID(24);
    let datetime = getIndiaTime();

    // Add user to database
    users.push({ username, email, password, age, gender, id, createdAt: datetime });
    fs.writeFileSync("db/users.json", JSON.stringify(users, null, "\t"));

    // Create user profile
    let structure = {
        isAmbassador: false,
        posts: [],
        saved: [],
        liked: []
    };
    fs.writeFileSync(`db/profiles/${id}.json`, JSON.stringify(structure, null, "\t"));

    res.redirect('/login?status=0');
    
});

app.post("/login", isNotAuthenticated, (req, res) => {
    const { email, password } = req.body;
    
    // Find user
    let users = JSON.parse(fs.readFileSync("db/users.json", "utf-8"));
    const user = users.find(
        (user) => user.email === email && user.password === password
    );

    if (!user) {
        return res.redirect("/login?status=1");
    }

    // Generate token
    const token = jwt.sign({ email: user.email, username: user.username, age: user.age, gender: user.gender, id: user.id }, SECRET_KEY);

    res.cookie("token", token, {
        httpOnly: true,    // Make sure the cookie is only accessible by the server
        // maxAge: 3600000,   // 1 hour in milliseconds NO EXPIRY
        // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        secure: false,
    });

    // console.log({ message: "Login successful", token });
    res.redirect('/dashboard')
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login')
});

app.listen(PORT)
