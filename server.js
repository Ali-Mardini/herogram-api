const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const app = express();
const port = process.env.PORT || 5000;

const { auth } = require('express-oauth2-jwt-bearer');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files
app.use(express.static(path.join(__dirname, 'dist')));


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

const uri = process.env.MONGO_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Auth0 JWT authentication middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Routes
const fileRoutes = require('./routes/fileRoutes');

// Apply checkJwt middleware to routes that require authentication
app.use('/api/files', fileRoutes); // All /api/files routes require authentication

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
