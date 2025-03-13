const express = require('express');
const router = express.Router();
const Publisher = require('../../models/Publisher');
const Book = require('../../models/Book');

// Render list of publishers
router.get('/', async (req, res) => {
	try {
	  const publishers = await Publisher.find();
	  res.render('publishers/index', { publishers });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/');
	}
});

// Render new publisher form
router.get('/new', (req, res) => {
	res.render('publishers/new', { publisher: new Publisher() });
});

// Create publisher (SSR form submission)
router.post('/', async (req, res) => {
	const publisher = new Publisher({
		name: req.body.name,
		location: req.body.location,
		foundedYear: req.body.foundedYear,
	});
	try {
		await publisher.save();
		res.redirect(`/publishers/${publisher.id}`);
	}
	catch {
		res.render('publishers/new', {
			publisher: publisher,
			errorMessage: 'Error creating Publisher',
		});
	}
});

// Show publisher details with books
router.get('/:id', async (req, res) => {
	try {
		const publisher = await Publisher.findById(req.params.id);
		const books = await Book.find({ publisher: publisher.id }).populate('author');
		res.render('publishers/show', { publisher, books });
	}
	catch {
		res.redirect('/publishers');
	}
});

module.exports = router;