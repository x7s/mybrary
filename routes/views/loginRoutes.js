const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const Publisher = require('../../models/Publisher');

// Render login form
router.get('/login', (req, res) => {
	res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
	const { username, password } = req.body;

	try {
		// Check if the user is an admin
		const admin = await Admin.findOne({ username });
		if (admin) {
			const isMatch = await admin.comparePassword(password);
			if (isMatch) {
				req.session.admin = admin;
				return res.redirect('/admin/dashboard');
			}
		}

		// Check if the user is a publisher
		const publisher = await Publisher.findOne({ username });
		if (publisher) {
			const isMatch = await publisher.comparePassword(password);
			if (isMatch) {
				req.session.publisher = publisher;
				return res.redirect('/publishers/dashboard');
			}
		}

		// If no match, show error
		res.status(400).render('login', { errorMessage: 'Invalid username or password' });
	}
	catch (err) {
		console.error(err);
		res.status(500).render('login', { errorMessage: 'Server error' });
	}
});

// Handle logout
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		}
		res.redirect('/');
	});
});

module.exports = router;