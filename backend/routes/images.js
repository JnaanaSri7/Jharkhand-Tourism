const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadImage } = require('../middleware/upload');
const {
  uploadImages,
  getImageById,
  getImageByFilename,
  getAllImages,
  deleteImage,
  getImagesForPlace,
  getImageByDestinationName
} = require('../controllers/imagesController');

// Upload multiple images
router.post('/upload', uploadImage.array('images', 50), uploadImages);

// Get all images metadata
router.get('/', getAllImages);

// Get image by ID (for display)
router.get('/:id', getImageById);

// Get image by filename (for download)
router.get('/download/:filename', getImageByFilename);

// Get images for a specific place
router.get('/place/:placeId', getImagesForPlace);

// Get image URL by destination name
router.get('/destination/:destinationName', getImageByDestinationName);

// Get image by place name (for chatbot usage) - with fallback support
router.get('/place-name/:placeName', async (req, res) => {
  try {
    const { placeName } = req.params;
    console.log(`🖼️ Images: Fetching image for place: "${placeName}"`);

    const knownImages = [
      "Angrabari Temple.png", "Anjan Dham.jpg", "Baidyanath Temple.jpg", "Barso Pani Cave.jpeg",
      "Basukinath Mandir.jpg", "Bhatinda Falls.jpg", "Canary Hill.jpeg", "Chandil Dam.jpg",
      "Damakol Waterfall.jpeg", "Dharni Pahar.jpg", "Dimna Lake.jpg", "Geological Museum.jpg",
      "Harnav Dam.jpg", "Hirni Falls.jpg", "Hundru Falls.jpg", "Jagannath Mandir.jpg",
      "Jawaharlal Nehru Biological Park.png", "Jubilee Park.jpg", "Kelaghagh Dam.jpg",
      "Koel River Front.jpg", "Lawapani waterfall.jpg", "Lodh Falls.png", "Mahadebsal Temple.jpg",
      "Massanjore Dam.jpg", "Miclai Ghat.jpg", "Moti Jharna Waterfall.jpg", "Nagaruntari Temple.jpg",
      "Navratangarh Fort.jpg", "Netarhat Hills.jpg", "Palamu Fort.jpg", "Panchghagh Falls.jpg",
      "Parasnath Hill.jpg", "Patratu Valley.jpg", "Sankh River.jpg", "Sukhaldari Falls.jpeg",
      "Tamasin Waterfall.jpg", "Tenughat Dam.jpg", "Trikut Hill.jpg", "Usri Falls.JPG",
      "Vrindaha Waterfalls.jpg"
    ];

    const cleanPlaceName = placeName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedFile = knownImages.find(file => {
      const cleanFileName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanFileName === cleanPlaceName || cleanFileName.includes(cleanPlaceName) || cleanPlaceName.includes(cleanFileName);
    });

    if (matchedFile) {
      console.log(`🖼️ Images: Matched image "${matchedFile}" for "${placeName}"`);
      const publicPath = path.join(__dirname, '..', '..', 'public', 'arvrPics', matchedFile);
      const dbPath = path.join(__dirname, '..', '..', 'db', 'arvrPics', matchedFile);

      if (fs.existsSync(publicPath)) {
        const ext = path.extname(matchedFile).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return fs.createReadStream(publicPath).pipe(res);
      } else if (fs.existsSync(dbPath)) {
        const ext = path.extname(matchedFile).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return fs.createReadStream(dbPath).pipe(res);
      } else {
        return res.redirect(302, `/arvrPics/${encodeURIComponent(matchedFile)}`);
      }
    }

    return res.status(404).json({
      success: false,
      message: `No image found for place: ${placeName}`
    });
  } catch (error) {
    console.error('🖼️ Images error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete image by ID
router.delete('/:id', deleteImage);

module.exports = router;
