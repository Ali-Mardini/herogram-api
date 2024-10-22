const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Save file with a timestamp to avoid conflicts
  },
});

const upload = multer({ storage: storage });
// API route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
	if (!req.file) {
	  return res.status(400).json({ error: 'No file uploaded' });
	}
	const { uploadedBy } = req.body;
  
	try {
	  // Log the uploaded file info
	  console.log('File uploaded successfully:', req.file);
  
	  // Save file metadata to MongoDB
	  const newFile = new File({
		originalname: req.file.originalname,
		filename: req.file.filename,
		path: req.file.path,
		size: req.file.size,
		tags: [],
		uploadedBy: uploadedBy,
	  });
  
	  await newFile.save(); // Save to database
  
	  res.status(201).json({
		message: 'File uploaded and metadata saved successfully',
		file: {
		  originalname: req.file.originalname,
		  filename: req.file.filename,
		  path: req.file.path,
		  size: req.file.size,
		  tags: [],
		  uploadedBy: uploadedBy
		}
	  });
	} catch (error) {
	  console.error('Error saving file metadata:', error);
	  res.status(500).json({ error: 'Error saving file metadata' });
	}
  });
  
  

// Fetch all files
router.get('/', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Generate a shareable link
router.put('/share/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Simulate generating a shareable link
    file.shareableLink = `https://myapp.com/public/${file._id}`;
    await file.save();
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Error generating shareable link' });
  }
});

// Download file
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error downloading file' });
    }
  });
});

module.exports = router;
