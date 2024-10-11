// server.js (as-is, but ensure 'categoriesList' matches your UI)
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
                return cb(new Error('Failed to create directory for category'));
            }
            cb(null, dest); // Set the file destination
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Store filename as timestamp + extension for uniqueness
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
}).single('image');

// Used to store uploaded photo filenames by category
const categories = {};
const categoriesList = ['Nature', 'Architecture', 'People', 'Animals'];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Home page to show categories and uploaded images
app.get('/', (req, res) => {
    res.render('index', { categories: categoriesList, categoriesData: categories });
});

// Upload endpoint
app.post('/upload', (req, res) => {
    const category = req.body.category;

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send("Error uploading file: " + err.message);
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
