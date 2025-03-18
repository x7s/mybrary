const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const Publisher = require('../../models/Publisher');
const { authAdmin } = require('../../middleware/authMiddleware');

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

// Render list of publishers (admin only)
router.get('/publishers', authAdmin, async (req, res) => {
	try {
	  const publishers = await Publisher.find();
	  res.render('admin/publishers/index', { publishers });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/admin/dashboard');
	}
});

// Render edit publisher form (admin only)
router.get('/publishers/:id/edit', authAdmin, async (req, res) => {
	try {
	  const publisher = await Publisher.findById(req.params.id);
	  if (!publisher) {
			return res.redirect('/admin/publishers');
	  }
	  res.render('admin/publishers/edit', { publisher });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/admin/publishers');
	}
});

// Handle publisher update (admin only)
router.put('/publishers/:id', authAdmin, async (req, res) => {
	let publisher;
	try {
	  publisher = await Publisher.findById(req.params.id);
	  if (!publisher) {
			return res.redirect('/admin/publishers');
	  }
	  publisher.name = req.body.name;
	  publisher.username = req.body.username;
	  publisher.bio = req.body.bio;
	  if (req.body.password) {
		// Password will be hashed by the pre-save hook
			publisher.password = req.body.password;
	  }
	  await publisher.save();
	  res.redirect('/admin/publishers');
	}
	catch (err) {
	  console.error(err);
	  if (publisher) {
			res.render('admin/publishers/edit', {
		  publisher: publisher,
		  errorMessage: 'Error updating Publisher',
			});
	  }
	  else {
			res.redirect('/admin/publishers');
	  }
	}
});

// Handle publisher deletion (admin only)
router.delete('/publishers/:id', authAdmin, async (req, res) => {
	try {
	  await Publisher.findByIdAndDelete(req.params.id);
	  res.redirect('/admin/publishers');
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/admin/publishers');
	}
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