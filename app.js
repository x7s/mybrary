const express = require('express');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const session = require('express-session');
const Book = require('./models/Book');

// Import API routes
const apiAuthorRoutes = require('./routes/api/authorRoutes');
const apiBookRoutes = require('./routes/api/bookRoutes');
const apiPublisherRoutes = require('./routes/api/publisherRoutes');

// Import View routes
const adminRoutes = require('./routes/views/adminRoutes');
const viewAuthorRoutes = require('./routes/views/authorRoutes');
const viewBookRoutes = require('./routes/views/bookRoutes');
const viewPublisherRoutes = require('./routes/views/publisherRoutes');
const publisherAuthRoutes = require('./routes/views/publisherAuthRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
// For API
app.use(express.json());
// Configure express-session
app.use(
	session({
	  secret: process.env.SESSION_SECRET || 'your-secret-key',
	  resave: false,
	  saveUninitialized: false,
	  cookie: { secure: false },
	}),
);
// For forms
app.use(express.urlencoded({ extended: true }));
// For PUT and DELETE methods
app.use(methodOverride('_method'));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/authors', apiAuthorRoutes);
app.use('/api/books', apiBookRoutes);
app.use('/api/publishers', apiPublisherRoutes);

// View Routes
app.use('/admin', adminRoutes);
app.use('/authors', viewAuthorRoutes);
app.use('/books', viewBookRoutes);
app.use('/publisher', viewPublisherRoutes);
app.use('/publishers', publisherAuthRoutes);

// Homepage
app.get('/', async (req, res) => {
	try {
		const books = await Book.find()
			.populate('author')
			.populate('publisher')
			// Limit to 10 recently added books
			.limit(10)
			// Sort by creation date (newest first)
			.sort({ createdAt: -1 });
		res.render('index', { books });
	}
	catch (error) {
		console.error(error);
		res.status(500).send('Server Error');
	}
});
// Admin part
app.use(
	session({
	  secret: 'thisismysecurekeynow',
	  resave: false,
	  saveUninitialized: false,
	  // Cookies set to true if using HTTPS
	  cookie: { secure: false },
	}),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});