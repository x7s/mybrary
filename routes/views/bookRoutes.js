const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');

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
router.get('/new', authMiddleware, async (req, res) => {
	try {
		const authors = await Author.find();
		const publishers = await Publisher.find();
		res.render('books/new', { book: new Book(), authors, publishers });
	}
	catch {
		res.redirect('/books');
	}
});

// Create book (SSR form submission)
router.post('/', authMiddleware, async (req, res) => {
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
router.get('/:id/edit', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
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

// Delete books (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
	try {
	  await Books.findByIdAndDelete(req.params.id);
	  res.redirect('/books');
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/books');
	}
});

module.exports = router;