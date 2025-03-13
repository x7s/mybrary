const express = require('express');
const router = express.Router();
const Author = require('../../models/Author');
const authMiddleware = require('../../middleware/authMiddleware');
const Book = require('../../models/Book');

// Render author list
router.get('/', async (req, res) => {
	try {
		const authors = await Author.find();
		res.render('authors/index', { authors, req });
	}
	catch {
		res.redirect('/');
	}
});

// Render new author form
router.get('/new', authMiddleware, (req, res) => {
	res.render('authors/new', { author: new Author() });
});

// Create author (SSR form submission)
router.post('/', authMiddleware, async (req, res) => {
	const author = new Author({
		name: req.body.name,
		bio: req.body.bio,
	});
	try {
		await author.save();
		res.redirect(`/authors/${author.id}`);
	}
	catch {
		res.render('authors/new', {
			author: author,
			errorMessage: 'Error creating Author',
		});
	}
});

// Show author details with books
/*
router.get('/:id', async (req, res) => {
	try {
		const author = await Author.findById(req.params.id);
		if (!author) {
			return res.redirect('/authors');
		}

		// Fetch books written by this author
		const books = await Book.find({ author: author.id }).populate('publisher');

		// Pass books to the template
		res.render('authors/show', { author, books });
	}
	catch (error) {
		console.error(error);
		res.redirect('/authors');
	}
}); */
// Show author details with books
router.get('/:id', async (req, res) => {
	try {
	  const author = await Author.findById(req.params.id);
	  if (!author) {
			return res.redirect('/authors');
	  }

	  // Fetch books written by this author
	  const books = await Book.find({ author: author.id }).populate('publisher');

	  res.render('authors/show', { author, books, req });
	}
	catch (error) {
	  console.error(error);
	  res.redirect('/authors');
	}
});

// Render edit author form
router.get('/:id/edit', authMiddleware, async (req, res) => {
	try {
		const author = await Author.findById(req.params.id);
		if (!author) {
			return res.redirect('/authors');
		}
		res.render('authors/edit', { author });
	}
	catch {
		res.redirect('/authors');
	}
});

// Handle author update
router.put('/:id', authMiddleware, async (req, res) => {
	let author;
	try {
		author = await Author.findById(req.params.id);
		if (!author) {
			return res.redirect('/authors');
		}
		author.name = req.body.name;
		author.bio = req.body.bio;
		await author.save();
		res.redirect(`/authors/${author.id}`);
	}
	catch {
		if (author) {
			res.render('authors/edit', {
				author: author,
				errorMessage: 'Error updating Author',
			});
		}
		else {
			res.redirect('/authors');
		}
	}
});

// Delete author (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
	try {
	  await Author.findByIdAndDelete(req.params.id);
	  res.redirect('/authors');
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/authors');
	}
});

module.exports = router;