const express = require('express');
const router = express.Router();
const { authAdmin } = require('../../middleware/authMiddleware');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
// Render book list
router.get('/', async (req, res) => {
	try {
		const books = await Book.find().populate('author').populate('publisher');
		res.render('books/index', { books, req });
	}
	catch {
		res.redirect('/');
	}
});
// Render new book form
router.get('/new', authAdmin, async (req, res) => {
	try {
		const authors = await Author.find();
		const publishers = await Publisher.find();
		res.render('books/new', {
			book: new Book(),
			authors,
			publishers,
		});
	}
	catch {
		res.redirect('/books');
	}
});
router.post('/', authAdmin, async (req, res) => {
	try {
	  if (!req.files?.coverImage) {
			return res.status(400).json({ error: 'Cover image is required' });
	  }
	  const coverImage = req.files.coverImage;
	  const ext = path.extname(coverImage.name);
	  const fileName = `book-${Date.now()}${ext}`;
	  const uploadDir = path.join(__dirname, '../../uploads');
	  const coversDir = path.join(uploadDir, 'covers');
	  const thumbsDir = path.join(uploadDir, 'thumbnails');
	  [uploadDir, coversDir, thumbsDir].forEach(dir => {
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	  });
	  const coverPath = path.join(coversDir, fileName);
	  const thumbPath = path.join(thumbsDir, fileName);
	  await Promise.all([
			coverImage.mv(coverPath),
			sharp(coverImage.data).resize(300).toFile(thumbPath),
	  ]);
	  const book = new Book({
			title: req.body.title,
			author: req.body.author,
			authorbio: req.body.authorbio,
			publisher: req.body.publisher,
			publishDate: new Date(req.body.publishDate),
			pageCount: req.body.pageCount,
			description: req.body.description,
			coverImagePath: `/uploads/covers/${fileName}`,
			thumbnailPath: `/uploads/thumbnails/${fileName}`,
	  });
	  await book.save();
	  res.redirect(`/books/${book.id}`);
	}
	catch (err) {
	  console.error(err);
	  const authors = await Author.find();
	  const publishers = await Publisher.find();
	  res.render('books/new', {
			book: req.body,
			authors,
			publishers,
			errorMessage: 'Error creating book',
	  });
	}
});
// Show book details
router.get('/:id', async (req, res) => {
	try {
		const books = await Book.find().populate('author');
		const book = await Book.findById(req.params.id)
			.populate('author')
			.populate('publisher');
		res.render('books/show', { book, books, req });
	}
	catch {
		res.redirect('/books');
	}
});
// Render edit book form
router.get('/:id/edit', authAdmin, async (req, res) => {
	try {
	  const book = await Book.findById(req.params.id);
	  const authors = await Author.find();
	  const publishers = await Publisher.find();
	  res.render('books/edit', { book, authors, publishers });
	}
	catch (err) {
		console.error(err);
		res.redirect('/books');
	}
});
// Handle book update
router.put('/:id', authAdmin, async (req, res) => {
	let book;
	try {
	  book = await Book.findById(req.params.id);
	  if (!book) {
			return res.redirect('/books');
	  }
	  book.title = req.body.title;
	  book.author = req.body.author;
	  book.publisher = req.body.publisher;
	  // book.publishYear = new Date(req.body.publishYear);
	  book.publishDate = new Date(req.body.publishDate);
	  book.pageCount = req.body.pageCount;
	  book.description = req.body.description;
	  await book.save();
	  res.redirect(`/books/${book.id}`);
	}
	catch (err) {
		console.error(err);
		if (book) {
		  const authors = await Author.find();
		  const publishers = await Publisher.find();
		  res.render('books/edit', {
				book: book,
				authors: authors,
				publishers: publishers,
				errorMessage: 'Error updating Book',
		  });
		}
		else {
		  res.redirect('/books');
		}
	  }
});
router.post('/upload', authAdmin, async (req, res) => {
	try {
	  if (!req.files?.filepond) {
			return res.status(400).json({ error: 'No file uploaded' });
	  }
	  const file = req.files.filepond;
	  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
	  if (!allowedTypes.includes(file.mimetype)) {
			return res.status(400).json({ error: 'Only JPEG, PNG or WebP images allowed' });
	  }
	  const ext = path.extname(file.name).toLowerCase();
	  const filename = `book-${Date.now()}${ext}`;
	  const uploadDir = path.join(__dirname, '../../uploads');
	  const coversDir = path.join(uploadDir, 'covers');
	  const thumbsDir = path.join(uploadDir, 'thumbnails');
	  [uploadDir, coversDir, thumbsDir].forEach(dir => {
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	  });
	  const coverPath = path.join(coversDir, filename);
	  const thumbPath = path.join(thumbsDir, filename);
	  await Promise.all([
			file.mv(coverPath),
			sharp(file.data)
				.resize(300)
				.toFile(thumbPath),
		]);
	  res.json({
			filePath: `/uploads/covers/${filename}`,
			thumbPath: `/uploads/thumbnails/${filename}`,
	  });
	}
	catch (err) {
	  console.error('Upload error:', err);
	  res.status(500).json({ error: err.message });
	}
});
router.delete('/delete-uploaded', authAdmin, async (req, res) => {
	try {
	  const filename = path.basename(req.body.filePath);
	  const filesToDelete = [
			path.join(__dirname, '../../uploads/covers', filename),
			path.join(__dirname, '../../uploads/thumbnails', filename),
	  ];
	  filesToDelete.forEach(filePath => {
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
	  });
	  res.status(200).json({ message: 'Files deleted' });
	}
	catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Error deleting files' });
	}
});
// Delete books (protected route)
router.delete('/:id', authAdmin, async (req, res) => {
	try {
		await Book.findByIdAndDelete(req.params.id);
		res.redirect('/books');
	}
	catch (err) {
 	   console.error(err);
 	   res.redirect('/books');
	}
});

module.exports = router;