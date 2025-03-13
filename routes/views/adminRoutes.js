const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');

// Render admin login form
router.get('/login', (req, res) => {
	res.render('admin/login');
});

// Handle admin login
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const admin = await Admin.findOne({ username });
		if (!admin) {
			return res.status(400).render('admin/login', { errorMessage: 'Invalid username or password' });
		}
		const isMatch = await admin.comparePassword(password);
		if (!isMatch) {
			return res.status(400).render('admin/login', { errorMessage: 'Invalid username or password' });
		}
		// Set session for the authenticated admin
		req.session.admin = admin;
		res.redirect('/admin/dashboard');
	}
	catch (err) {
		console.error(err);
		res.status(500).render('admin/login', { errorMessage: 'Server error' });
	}
});

// Admin dashboard (protected route)
router.get('/dashboard', (req, res) => {
	if (!req.session.admin) {
		return res.redirect('/admin/login');
	}
	res.render('admin/dashboard');
});

// Admin logout
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		}
		res.redirect('/admin/login');
	});
});

module.exports = router;