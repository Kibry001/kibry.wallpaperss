// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category; // Get the category from the request body
        const dest = path.join(__dirname, 'uploads', category); // Build the category directory path
        
        // Ensure the directory exists; if not, create it
        fs.mkdir(dest, { recursive: true }, (err) => {
            if (err) {
                console.error('Failed to create directory:', err); // Log the error
                return cb(new Error('Failed to create directory for category'));
            }
            cb(null, dest); // Set the file destination
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
}).single('image'); // Adjusted the field name to 'image'

// Used to store uploaded photo filenames by category
const categories = {};
const categoriesList = ['Nature', 'Architecture', 'People', 'Animals']; // Example categories

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Home page to show categories and uploaded images
app.get('/', (req, res) => {
    res.render('index', { categories: categoriesList, categoriesData: categories });
});

// Upload page
app.get('/upload', (req, res) => {
    res.render('upload
