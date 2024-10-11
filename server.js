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
                console.error('Directory creation error:', err); // Log the error
                return cb(err); // Pass the error to the callback
            }
            cb(null, dest); // Set the file destination
        });
    },
    filename: (req, file, cb) => {
        // Ensure filename is safe and avoids overwriting
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
}).single('image'); // Ensure this matches the input name in your form

// Used to store uploaded photo filenames by category
const categories = {};

// Set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Home page to show categories and uploaded images
app.get('/', (req, res) => {
    res.render('index', { categories: Object.keys(categories) });
});

// Handle the image upload and store it in the respective category
app.post('/upload', (req, res) => {
    const category = req.body.category;

    // Check if category is provided
    if (!category || typeof category !== 'string' || category.trim() === '') {
        return res.status(400).send("No valid category provided.");
    }

    upload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err); // Log any upload errors
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({ error: err.message });
            } else {
                // An unknown error occurred when uploading.
                return res.status(400).json({ error: 'An unknown error occurred. Please try again.' });
            }
        }

        // Initialize category array if it doesn't exist
        if (!categories[category]) {
            categories[category] = [];
        }

        // Store uploaded photo's filename in the corresponding category
        if (req.file) {
            categories[category].push(req.file.filename);
            res.json({ message: "File uploaded successfully.", filename: req.file.filename });
        } else {
            res.status(400).json({ error: "File upload failed, no file found." });
        }
    });
});

// Serve uploaded images based on category and filename
app.get('/uploads/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    res.sendFile(path.join(__dirname, 'uploads', category, filename), (err) => {
        if (err) {
            console.error('File send error:', err); // Log any potential errors
            res.status(err.status || 500).end();
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
