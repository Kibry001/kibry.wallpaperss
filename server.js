// server.js
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Set storage engine to memory
const storage = multer.memoryStorage();

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit to 10MB
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
    upload(req, res, (err) => {
        const category = req.body.category;
        if (err) {
            return res.status(400).send("Error uploading file: " + err.message);
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        // Initialize category array if it doesn't exist
        if (!categories[category]) {
            categories[category] = [];
        }

        // Store uploaded photo's buffer and filename in the corresponding category
        const uploadedImage = {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
        };
        categories[category].push(uploadedImage);

        // Generate a URL for the uploaded image
        const imageUrl = `/uploads/${category}/${req.file.originalname}`;

        // Respond with the URL of the uploaded image
        res.status(200).json({ message: 'File uploaded successfully!', url: imageUrl });
 
    });
});

// Serve uploaded images based on category and filename
app.get('/uploads/:category/:filename', (req, res) => {
    const { category, filename } = req.params;

    // Find the image in the category
    const image = categories[category]?.find(img => img.originalname === filename);

    if (!image) {
        return res.status(404).send('Image not found');
    }

    // Set the correct content type based on the uploaded file's mimetype
    res.set('Content-Type', image.mimetype);
    res.send(image.buffer); // Send the buffer directly
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
