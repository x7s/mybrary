const express = require('express');
const router = express.Router();
const Publisher = require('../../models/Publisher');
const { authAdmin } = require('../../middleware/authMiddleware');

// Render publisher registration form
router.get('/register', (req, res) => {
	res.render('publishers/register');
});

// Handle publisher registration
router.post('/register', async (req, res) => {
	const { name, username, password, bio } = req.body;

	// Validation
	if (!name || !username || !password) {
		return res.status(400).render('publishers/register', { errorMessage: 'All fields are required' });
	}
	if (password.length < 6) {
		return res.status(400).render('publishers/register', { errorMessage: 'Password must be at least 6 characters' });
	}

	try {
		// Check if username already exists
		const existingPublisher = await Publisher.findOne({ username });
		if (existingPublisher) {
			return res.status(400).render('publishers/register', { errorMessage: 'Username already exists' });
		}

		// Create new publisher
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
		// Find publisher by username
		const publisher = await Publisher.findOne({ username });
		if (!publisher) {
			return res.status(400).render('publishers/login', { errorMessage: 'Invalid username or password' });
		}

		// Compare passwords
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
	res.render('publishers/dashboard');
});

// Render publisher edit form (publisher only)
router.get('/edit', authAdmin, async (req, res) => {
	try {
	  const publisher = await Publisher.findById(req.session.publisher._id);
	  if (!publisher) {
			return res.redirect('/publishers/dashboard');
	  }
	  res.render('publishers/edit', { publisher });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/publishers/dashboard');
	}
});

// Handle publisher update (publisher only)
router.put('/edit', authAdmin, async (req, res) => {
	let publisher;
	try {
	  publisher = await Publisher.findById(req.session.publisher._id);
	  if (!publisher) {
			return res.redirect('/publishers/dashboard');
	  }
	  publisher.name = req.body.name;
	  publisher.username = req.body.username;
	  publisher.bio = req.body.bio;
	  if (req.body.password) {
		// Password will be hashed by the pre-save hook
			publisher.password = req.body.password;
	  }
	  await publisher.save();
	  res.redirect('/publishers/dashboard');
	}
	catch (err) {
	  console.error(err);
	  if (publisher) {
			res.render('publishers/edit', {
		  publisher: publisher,
		  errorMessage: 'Error updating Publisher',
			});
	  }
	  else {
			res.redirect('/publishers/dashboard');
	  }
	}
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