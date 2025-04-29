const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { fileTypeFromBuffer } = require('file-type');

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

module.exports = {
	async processBookCover(file) {
		// 1. Validate file
		if (!file) throw new Error('No file uploaded');
		if (file.size > MAX_FILE_SIZE) throw new Error('File too large (max 5MB)');

		// 2. Verify file type
		const type = await fileTypeFromBuffer(file.data);
		if (!type || !ALLOWED_TYPES.includes(type.mime)) {
			throw new Error('Only JPEG, PNG, or WebP images are allowed');
		}

		// 3. Create directories if they don't exist
		const uploadsDir = path.join(__dirname, '../uploads');
		const coversDir = path.join(uploadsDir, 'covers');
		const thumbsDir = path.join(uploadsDir, 'thumbnails');

		[uploadsDir, coversDir, thumbsDir].forEach(dir => {
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		});

		// 4. Generate unique filename
		const filename = `book-${Date.now()}${path.extname(file.name)}`;
		const coverPath = path.join(coversDir, filename);
		const thumbPath = path.join(thumbsDir, filename);

		// 5. Process images
		await Promise.all([
			// Save original (resized to max 1200px width)
			sharp(file.data)
				.resize(1200)
				.toFile(coverPath),

			// Create thumbnail (300px width)
			sharp(file.data)
				.resize(300)
				.toFile(thumbPath),
		]);

		return {
			coverPath: `/uploads/covers/${filename}`,
			thumbPath: `/uploads/thumbnails/${filename}`,
		};
	},
};