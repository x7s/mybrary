const express = require('express');
const router = express.Router();
const Publisher = require('../../models/Publisher');

// Render publisher registration form
router.get('/register', (req, res) => {
	res.render('publishers/register');
});

// Handle publisher registration
router.post('/register', async (req, res) => {
	const { name, username, password, bio } = req.body;
	try {
		const existingPublisher = await Publisher.findOne({ username });
		if (existingPublisher) {
			return res.status(400).render('publishers/register', { errorMessage: 'Username already exists' });
		}
		const publisher = new Publisher({ name, username, password, bio });
		await publisher.save();
		res.redirect('/publishers/login');
	}
	catch (err) {
		console.error(err);
		res.status(500).render('publishers/register', { errorMessage: 'Server error' });
	}
});

// Render publisher login form
router.get('/login', (req, res) => {
	res.render('publishers/login');
});

// Handle publisher login
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const publisher = await Publisher.findOne({ username });
		if (!publisher) {
			return res.status(400).render('publishers/login', { errorMessage: 'Invalid username or password' });
		}
		const isMatch = await publisher.comparePassword(password);
		if (!isMatch) {
			return res.status(400).render('publishers/login', { errorMessage: 'Invalid username or password' });
		}
		// Set session for the authenticated publisher
		req.session.publisher = publisher;
		res.redirect('/publishers/dashboard');
	}
	catch (err) {
		console.error(err);
		res.status(500).render('publishers/login', { errorMessage: 'Server error' });
	}
});

// Publisher dashboard (protected route)
router.get('/dashboard', (req, res) => {
	if (!req.session.publisher) {
		return res.redirect('/publishers/login');
	}
	res.render('publishers/dashboard', { publisher: req.session.publisher });
});

// Publisher logout
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		}
		res.redirect('/publishers/login');
	});
});

module.exports = router;