const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require("fs");
const axios = require("axios");
const { isAuthenticated, isNotAuthenticated, validateToken } = require('./middleware/auth.js');
const app = express();
const multer = require('multer');
const helper = require('./manager.js')
const PORT = 3000;
const SECRET_KEY = "your_secret_key";
const ai = require('./openai.js')

app.use(express.json());
app.use(cookieParser()); // make sure this is above your routes
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Serve static files from the 'public' directory 
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));
app.use('/dump', express.static(path.join(__dirname, 'public/static')));
app.use('/styles', express.static(path.join(__dirname, 'public/css')));


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public/static/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


const general = require('./routes/general.js');
const { title } = require("process");
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

app.get('/dashboard', isAuthenticated, (req, res) => {
    let posts = JSON.parse(fs.readFileSync('db/posts.json', 'utf8'));

    res.render('dashboard', {
        username: req.user.username,
        email: req.user.email,
        posts
    })
})

app.get('/maps', isAuthenticated, (req, res) => {
    res.render('maps', {
        username: req.user.username,
        email: req.user.email
    })
})

app.get('/assistant', isAuthenticated, (req, res) => {
    res.render('assistant', {
        username: req.user.username,
        email: req.user.email
    })
})

app.put('/generate', isAuthenticated, (req, res) => {
    console.log(req.body)

    let userData = {
        age: req.user.age,
        gender: req.user.gender,
        city: req.body.location,
        lookingFor: req.body.interest
    }

    ai.openAI(userData).then(output => {
        res.send(output)
    })
})


app.get('/post/:postId', isAuthenticated, (req, res) => {
    let postId = req.params.postId;
    console.log(postId)
    if (!postId) {
        return res.send('Missing post id!');
    }

    let posts = JSON.parse(fs.readFileSync(`db/posts.json`, 'utf8'))
    let index = posts.findIndex(e => e.id == postId)
    if (index == -1) {
        return res.send('Post not found!!')
    }


    let post = JSON.parse(fs.readFileSync(`db/posts/${postId}.json`, 'utf8'));
    res.render('post', {
        username: req.user.username,
        email: req.user.email,
        post,
        postInfo: posts[index],
        name: helper.getUsername(posts[index].author)
    })
})

app.get('/post', isAuthenticated, (req, res) => {
    res.render('new_post', {
        username: req.user.username,
        email: req.user.email
    });
})

app.get('/festivals', isAuthenticated, (req, res) => {
    res.render('festivals', {
        username: req.user.username,
        email: req.user.email
    })
})

app.put('/generate-festivals', isAuthenticated, (req, res) => {
    let place = req.body.location

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
      
    const currentDate = new Date();
    const currentMonth = monthNames[currentDate.getMonth()];

    ai.festivals(place, currentMonth).then(output => {
        res.send(output)
    })
})

app.post('/upload', upload.array('images', 20), isAuthenticated, (req, res) => {
    console.log(req.body)
    console.log(req.user)
    
    const fileNames = req.files.map(file => file.filename);
    console.log('Uploaded file names:', fileNames);


    // add to posts
    let posts = JSON.parse(fs.readFileSync('db/posts.json', 'utf8'));
    let postId = `post_${generateID(12)}`;

    const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    posts.push({
        id: postId,
        title: req.body.title,
        author: req.user.id,
        thumbnail: fileNames[0],
        createdOn: nowIST,
        location: `${req.body.city}, ${req.body.state}`,
        description: `${req.body.desc}`,
        likes: 0
    })

    fs.writeFileSync('db/posts.json', JSON.stringify(posts, null, '\t'));

    let postInfo = {
        location: {
            city: req.body.city,
            state: req.body.state,
            addressLine: req.body.addressLine,
            geo: {
                lat: req.body.latitude,
                long: req.body.longitude,
                address: req.body.address
            },
            images: fileNames,
        },
        howToReach: req.body.howToReach,
        bestTime: req.body.bestTime,
        budget: req.body.budget,
        comments: [],
        market: [],
    }

    fs.writeFileSync(`db/posts/${postId}.json`, JSON.stringify(postInfo, null, '\t'));
    // add post ID to users profile
    let user = JSON.parse(fs.readFileSync(`db/profiles/${req.user.id}.json`, 'utf8'));
    user.posts.push(postId);

    fs.writeFileSync(`db/profiles/${req.user.id}.json`, JSON.stringify(user, null, '\t'));


});




app.listen(PORT)
