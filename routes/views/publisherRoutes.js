const express = require('express');
const router = express.Router();
const Publisher = require('../../models/Publisher');
const Book = require('../../models/Book');
router.get('/', async (req, res) => {
	try {
	  const page = parseInt(req.query.page) || 1;
	  const limit = parseInt(req.query.limit) || 10;
	  const skip = (page - 1) * limit;
	  const totalPublishers = await Publisher.countDocuments();
	  const totalPages = Math.ceil(totalPublishers / limit);
	  const publishers = await Publisher.find()
			.sort({ name: 1 })
			.skip(skip)
			.limit(limit);
	  res.render('publishers/index', {
			publishers,
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
router.get('/new', (req, res) => {
	res.render('publishers/new', { publisher: new Publisher() });
});
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