const express = require('express');
const router = express.Router();
const { authAdmin } = require('../../middleware/authMiddleware');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');
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
	// Debugging
	console.log('Session:', req.session);
	console.log('Accessing /books/new route...');
	try {
		const authors = await Author.find();
		const publishers = await Publisher.find();
		res.render('books/new', {
			book: new Book(),
			authors,
			publishers,
			// CSRF token for security
			csrfToken: req.csrfToken(),
		});
	}
	catch {
		res.redirect('/books');
	}
});

// Create book (SSR form submission)
/*
router.post('/', authAdmin, async (req, res) => {
	const book = new Book({
		title: req.body.title,
		author: req.body.author,
		publisher: req.body.publisher,
		publishDate: new Date(req.body.publishDate),
		pageCount: req.body.pageCount,
		description: req.body.description,
	});
	try {
		await book.save();
		res.redirect(`/books/${book.id}`);
	}
	catch {
		res.render('books/new', {
			book: book,
			errorMessage: 'Error creating Book',
		});
	}
}); */
// 📌 Route за създаване на нова книга
router.post('/', authAdmin, async (req, res) => {
	try {
		if (!req.files || !req.files.coverImage) {
			return res.status(400).json({ error: 'Cover image is required' });
		}

		// 📌 Взимаме файла от заявката
		const coverImage = req.files.coverImage;

		// 📌 Разширение на файла
		const ext = path.extname(coverImage.name);

		// 📌 Създаваме уникално име
		const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

		// 📌 Път за запазване
		const uploadPath = path.join(__dirname, '../../uploads', fileName);

		// 📌 Запазване на файла
		await coverImage.mv(uploadPath);

		// 📌 Създаваме новата книга
		const book = new Book({
			title: req.body.title,
			author: req.body.author,
			publisher: req.body.publisher,
			publishDate: new Date(req.body.publishDate),
			pageCount: req.body.pageCount,
			description: req.body.description,
			// Запазваме само името, не целия път
			coverImagePath: fileName,
		});

		await book.save();
		res.redirect(`/books/${book.id}`);
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error creating book' });
	}
});

// Show book details
router.get('/:id', async (req, res) => {
	try {
		const book = await Book.findById(req.params.id)
			.populate('author')
			.populate('publisher');
		res.render('books/show', { book, req });
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
	  book.publishYear = new Date(req.body.publishYear);
	  book.publishDate = new Date(req.body.publishDate);
	  book.pageCount = req.body.pageCount;
	  book.description = req.body.description;
	  await book.save();
	  res.redirect(`/books/${book.id}`);
	}
	/* catch {
	  if (book) {
			res.render('books/edit', {
		  book: book,
		  errorMessage: 'Error updating Book',
			});
	  }
	  else {
			res.redirect('/books');
	  }
	}*/
	catch (err) {
		console.error(err);
		if (book) {
		  // If there's an error, re-render the edit form with the necessary data
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

// 📌 Route за качване на файл с FilePond
router.post('/upload', authAdmin, async (req, res) => {
	try {
		if (!req.files || !req.files.coverImage) {
			return res.status(400).json({ error: 'Cover image is required' });
		}

		const coverImage = req.files.coverImage;
		const ext = path.extname(coverImage.name);
		const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
		const uploadPath = path.join(__dirname, '../../uploads', fileName);

		await coverImage.mv(uploadPath);

		// 📌 FilePond очаква да върнем името на файла
		res.status(200).json({ filePath: fileName });
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error uploading file' });
	}
});

// 📌 Route за изтриване на качени файлове (ако потребителят отмени качването)
router.delete('/delete-uploaded', authAdmin, async (req, res) => {
	try {
		const filePath = path.join(__dirname, '../../uploads', req.body.filePath);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		res.status(200).json({ message: 'File deleted' });
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error deleting file' });
	}
});

// Delete books (protected route)
router.delete('/:id', authAdmin, async (req, res) => {
	try {
	// ✅ ПРАВИЛНО: Използваме "Book"
 	   await Book.findByIdAndDelete(req.params.id);
 	   res.redirect('/books');
	}
	catch (err) {
 	   console.error(err);
 	   res.redirect('/books');
	}
});

module.exports = router;