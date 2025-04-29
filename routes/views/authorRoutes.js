const express = require('express');
const router = express.Router();
const Author = require('../../models/Author');
const { authAdmin } = require('../../middleware/authMiddleware');
const Book = require('../../models/Book');
// Render author list with pagination
router.get('/', async (req, res) => {
	try {
	  const page = parseInt(req.query.page) || 1;
	  const limit = parseInt(req.query.limit) || 10;
	  const skip = (page - 1) * limit;
	  const totalAuthors = await Author.countDocuments();
	  const totalPages = Math.ceil(totalAuthors / limit);
	  const authors = await Author.find()
	  		.sort({ name: 1 })
			.skip(skip)
			.limit(limit);
	  res.render('authors/index', {
			authors,
			currentPage: page,
			totalPages,
			perPage: limit,
			req,
	  });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/');
	}
});
// Render new author form
router.get('/new', authAdmin, (req, res) => {
	res.render('authors/new', { author: new Author() });
});
// Create author (SSR form submission)
router.post('/', authAdmin, async (req, res) => {
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
router.get('/:id', async (req, res) => {
	try {
	  const author = await Author.findById(req.params.id);
	  if (!author) {
			return res.redirect('/authors');
	  }
	  const books = await Book.find({ author: author.id }).populate('publisher');
	  res.render('authors/show', { author, books, req });
	}
	catch (error) {
	  console.error(error);
	  res.redirect('/authors');
	}
});
// Render edit author form
router.get('/:id/edit', authAdmin, async (req, res) => {
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
router.put('/:id', authAdmin, async (req, res) => {
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
router.delete('/:id', authAdmin, async (req, res) => {
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