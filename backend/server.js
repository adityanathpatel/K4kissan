const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'K4Kissan Backend is running!', timestamp: new Date() });
});

// Farmer Routes Placeholder
app.post('/api/farmer/product', (req, res) => {
    // TODO: Connect to Firebase Admin SDK or PostgreSQL here
    const product = req.body;
    console.log("Received new farmer product:", product);
    res.json({ success: true, message: 'Product received by backend', data: product });
});

// Buyer Routes Placeholder
app.post('/api/buyer/requirement', (req, res) => {
    // TODO: Connect to DB here
    const requirement = req.body;
    console.log("Received new buyer requirement:", requirement);
    res.json({ success: true, message: 'Requirement received by backend', data: requirement });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
