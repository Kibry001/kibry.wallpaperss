// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
}).single('photo'); // Field name in form

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Store photos by category
let categories = {};
const categoriesList = ['Nature', 'Architecture', 'People', 'Animals']; // Example categories

app.get('/', (req, res) => {
    res.render('index', { categories: categoriesList, categoriesData: categories });
});

app.get('/upload', (req, res) => {
    res.render('upload', { categories: categoriesList });
});

app.post('/upload', (req, res) => {
    const category = req.body.category;
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send("Error uploading file.");
        }
        
        if (!categories[category]) {
            categories[category] = []; // Initialize category array if it doesn't exist
        }
        
        // Store uploaded photo's filename in the corresponding category
        categories[category].push(req.file.filename);
        res.redirect('/');
    });
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
