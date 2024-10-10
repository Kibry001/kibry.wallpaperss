// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for checking and creating directories
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
    res.render('upload', { categories: categoriesList });
});

// Handle the image upload and store it in the respective category
app.post('/upload', (req, res) => {
    const category = req.body.category;
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send("Error uploading file.");
        }

        // Initialize category array if it doesn't exist
        if (!categories[category]) {
            categories[category] = [];
        }

        // Store uploaded photo's filename in the corresponding category
        categories[category].push(req.file.filename);
        res.redirect('/');
    });
});

// Serve uploaded images based on category and filename
app.get('/uploads/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    res.sendFile(path.join(__dirname, 'uploads', category, filename));
});

// Display images for a selected category dynamically
app.get('/category/:name', (req, res) => {
    const categoryName = req.params.name;
    const images = categories[categoryName] || [];
    res.render('category', { categoryName, images });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
