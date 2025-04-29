const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { fileTypeFromBuffer } = require('file-type');

router.post('/upload', async (req, res) => {
	try {
		if (!req.files || !req.files.filepond) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const file = req.files.filepond;
		const type = await fileTypeFromBuffer(file.data);

		// Validate file
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(type?.mime)) {
			throw new Error('Invalid file type');
		}
		if (file.size > 5 * 1024 * 1024) {
			throw new Error('File too large (max 5MB)');
		}

		// Create directories
		const uploadDir = path.join(__dirname, '../../uploads');
		const coversDir = path.join(uploadDir, 'covers');
		const thumbsDir = path.join(uploadDir, 'thumbnails');
		[uploadDir, coversDir, thumbsDir].forEach(dir => {
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		});

		// Process files
		const filename = `book-${Date.now()}${path.extname(file.name)}`;
		const coverPath = path.join(coversDir, filename);
		const thumbPath = path.join(thumbsDir, filename);

		await Promise.all([
			sharp(file.data).resize(1200).toFile(coverPath),
			sharp(file.data).resize(300).toFile(thumbPath),
		]);

		res.json({
			// Full path
			filePath: `/uploads/covers/${filename}`,
			// Full path
			thumbPath: `/uploads/thumbnails/${filename}`,
		});
	}
	catch (error) {
		console.error('Upload error:', error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;