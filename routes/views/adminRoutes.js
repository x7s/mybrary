const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const statsCache = new NodeCache({ stdTTL: 300 });
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../public/uploads/publishers');
const Admin = require('../../models/Admin');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
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
		req.session.admin = { id: admin._id, username: admin.username };
		res.redirect('/admin/dashboard');
	}
	catch (err) {
		console.error(err);
		res.status(500).render('admin/login', { errorMessage: 'Server error' });
	}
});
// Profile route
router.get('/profile', authAdmin, async (req, res) => {
	try {
	  console.log('Admin profile route accessed');
	  const admin = await Admin.findById(req.session.admin.id);
	  if (!admin) {
			return res.redirect('/admin/login');
	  }
	  res.render('admin/profile', {
			admin,
			success: req.query.success || null,
			error: req.query.error || null,
	  });
	}
	catch (err) {
	  console.error('Profile error:', err);
	  res.redirect('/admin/dashboard?error=Failed to load profile');
	}
});
// Update admin profile
router.post('/profile', authAdmin, async (req, res) => {
	console.log('POST /admin/profile reached');
	console.log('Request body:', req.body);
	try {
	  const admin = await Admin.findById(req.session.admin.id);
	  console.log('Admin found:', !!admin);
	  admin.name = req.body.name;
	  admin.email = req.body.email;
	  if (req.body.currentPassword && req.body.newPassword) {
			console.log('Password change attempted');
			const isMatch = await admin.comparePassword(req.body.currentPassword);
			if (!isMatch) {
		  console.log('Password mismatch');
		  return res.redirect('/admin/profile?error=Current password is incorrect');
			}
			admin.password = req.body.newPassword;
	  }
	  await admin.save();
	  console.log('Admin saved successfully');
	  res.redirect('/admin/profile?success=Profile updated successfully');
	}
	catch (err) {
	  console.error('Profile update error:', err);
	  res.redirect('/admin/profile?error=Error updating profile');
	}
});
// Admin dashboard (protected route)
// Updated dashboard route with real statistics
router.get('/dashboard', authAdmin, async (req, res) => {
	try {
	  let stats = statsCache.get('dashboardStats');
	  let recentBooks = statsCache.get('recentBooks');
	  let popularBooks = statsCache.get('popularBooks');
	  if (!stats || !recentBooks || !popularBooks) {
			const results = await Promise.all([
		  (async () => ({
					books: await Book.countDocuments(),
					authors: await Author.countDocuments(),
					users: await Publisher.countDocuments(),
					newThisWeek: await Book.countDocuments({
			  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
					}),
		  }))(),
		  Book.find()
					.sort({ createdAt: -1 })
					.limit(5)
					.populate('author publisher')
					.lean(),
		  Book.find()
					.sort({ views: -1, createdAt: -1 })
					.limit(3)
					.populate('author')
					.lean(),
			]);
			[stats, recentBooks, popularBooks] = results;
			statsCache.set('dashboardStats', stats);
			statsCache.set('recentBooks', recentBooks);
			statsCache.set('popularBooks', popularBooks);
	  }
	  res.render('admin/dashboard', {
			req,
			stats,
			recentBooks,
			popularBooks,
			lastUpdated: new Date(),
	  });
	}
	catch (err) {
	  console.error('Dashboard error:', err);
	  res.render('admin/dashboard', {
			req,
			stats: { books: 0, authors: 0, users: 0, newThisWeek: 0 },
			recentBooks: [],
			popularBooks: [],
	  });
	}
});
// Render list of publishers (admin only) - UPDATED VERSION
router.get('/publishers', authAdmin, async (req, res) => {
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
	  res.render('admin/publishers/index', {
			publishers,
			currentPage: page,
			totalPages,
			perPage: limit,
			req,
	  });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/admin/dashboard');
	}
});
// Render edit publisher form (admin only) - updated VERSION for administration
router.get('/publishers/:id/edit', authAdmin, async (req, res) => {
	try {
	  const publisher = await Publisher.findById(req.params.id);
	  if (!publisher) {
			return res.redirect('/admin/publishers');
	  }
	  res.render('admin/publishers/edit', {
			publisher,
			req,
			errorMessage: null,
			query: req.query,
	  });
	}
	catch (err) {
	  console.error(err);
	  res.redirect('/admin/publishers');
	}
});
// Handle publisher update (admin only)
router.put('/publishers/:id', authAdmin, async (req, res) => {
	try {
		const publisher = await Publisher.findById(req.params.id);
		if (!publisher) {
		  return res.redirect('/admin/publishers?error=Publisher not found');
		}
		if (req.files && req.files.avatar) {
			const avatar = req.files.avatar;
			if (!fs.existsSync(uploadDir)) {
			  fs.mkdirSync(uploadDir, { recursive: true });
			}
			const filename = `${publisher._id}${path.extname(avatar.name)}`;
			const filepath = path.join(uploadDir, filename);
			await avatar.mv(filepath);
			publisher.avatar = `/uploads/publishers/${filename}`;
		  }
	  publisher.name = req.body.name;
	  publisher.bio = req.body.bio;
	  publisher.phone = req.body.phone || undefined;
	  publisher.email = req.body.email;
	  publisher.address = {
			street: req.body.street,
			city: req.body.city,
			postalCode: req.body.postalCode,
			country: req.body.country,
	  };
	  publisher.website = req.body.website;
	  if (req.body.password && req.body.password.trim() !== '') {
			if (req.body.password.length < 6) {
		  return res.render('admin/publishers/edit', {
					publisher: { ...publisher.toObject(), ...req.body },
					errorMessage: 'Паролата трябва да е поне 6 символа',
					query: req.query,
		  });
			}
			publisher.password = req.body.password;
	  }
	  await publisher.save();
	  req.flash('success', 'Потребителят беше успешно актуализиран');
	  res.redirect(`/admin/publishers?page=${req.query.page || 1}&limit=${req.query.limit || 10}`);
	}
	catch (err) {
	  console.error('Update error:', err);
	  if (err.code === 11000) {
			const field = err.message.includes('email') ? 'Имейл адресът' : 'Потребителското име';
			return res.render('admin/publishers/edit', {
		  publisher: { ...req.body, _id: req.params.id },
		  errorMessage: `${field} вече съществува`,
		  query: req.query,
			});
	  }
	  res.render('admin/publishers/edit', {
			publisher: { ...req.body, _id: req.params.id },
			errorMessage: 'Грешка при актуализиране: ' + err.message,
			query: req.query,
	  });
	}
});
// Handle publisher deletion (admin only)
router.delete('/publishers/:id', authAdmin, async (req, res) => {
	try {
	  if (req.query.confirm !== 'true') {
			return res.status(400).json({ error: 'Confirmation required' });
	  }
	  await Publisher.findByIdAndDelete(req.params.id);
	  res.json({ success: true });
	}
	catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Server error' });
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