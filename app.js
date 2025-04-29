const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const flash = require('express-flash');
const path = require('path');
const session = require('express-session');
const Book = require('./models/Book');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import API routes
const apiAuthorRoutes = require('./routes/api/authorRoutes');
const apiBookRoutes = require('./routes/api/bookRoutes');
const apiPublisherRoutes = require('./routes/api/publisherRoutes');
const uploadRoutes = require('./routes/api/uploadRoutes');

// Import View routes
const adminRoutes = require('./routes/views/adminRoutes');
const viewAuthorRoutes = require('./routes/views/authorRoutes');
const viewBookRoutes = require('./routes/views/bookRoutes');
const publisherRoutes = require('./routes/views/publisherRoutes');
const loginRoutes = require('./routes/views/loginRoutes');
const publisherAuthRoutes = require('./routes/views/publisherAuthRoutes');

dotenv.config();

// Ensure SESSION_SECRET is set in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
	throw new Error('SESSION_SECRET must be set in production!');
}

const app = express();

// Security middleware
app.use(
	helmet({
		// Disable CSP if not configured
		contentSecurityPolicy: false,
		// Adjust for compatibility with certain libraries
		crossOriginEmbedderPolicy: false,
	}),
);
app.use(cors());

// Enable file uploads
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: '/tmp/',
	limits: { fileSize: 5 * 1024 * 1024 },
	abortOnLimit: true,
	responseOnLimit: 'File size too large',
}));
// Serve uploaded files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload', uploadRoutes);

// Connect to the database
connectDB();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Configure express-session
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'your-secret-key',
		resave: false,
		saveUninitialized: false,
		cookie: {
			// HTTPS only in production
			secure: process.env.NODE_ENV === 'production',
			// Prevent XSS attacks
			httpOnly: true,
			// Protect against CSRF attacks
			sameSite: 'strict',
		},
	}),
);


// Middleware to pass session data to all views
app.use((req, res, next) => {
	// console.log('Admin session:', req.session.admin);
	res.locals.session = req.session;
	next();
});
// Global error handling middleware
app.use(errorHandler);

// For API
app.use(express.json());

// For PUT and DELETE methods
app.use(methodOverride('_method'));
app.use(flash());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files with caching
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Rate limiting middleware
const apiLimiter = rateLimit({
	// 15 minutes
	windowMs: 15 * 60 * 1000,
	// Max 100 requests per IP
	max: 100,
	message: { error: 'Too many requests, please try again later.' },
});

const authorLimiter = rateLimit({
	// 15 minutes
	windowMs: 15 * 60 * 1000,
	// Lower limit for author-related routes
	max: 50,
	message: { error: 'Too many requests to authors, please try again later.' },
});

// Add these before your routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Apply rate-limiting to specific routes
app.use('/api/', apiLimiter);
app.use('/api/authors', authorLimiter);
app.use('/api/books', apiLimiter);
app.use('/api/publishers', apiLimiter);

// API Routes
app.use('/api/authors', apiAuthorRoutes);
app.use('/api/books', apiBookRoutes);
app.use('/api/publishers', apiPublisherRoutes);

// View Routes
app.use('/admin', adminRoutes);
app.use('/books', viewBookRoutes);
app.use('/authors', viewAuthorRoutes);
app.use('/publishers', publisherRoutes);
app.use('/', loginRoutes);
app.use('/publishers', publisherAuthRoutes);

// Homepage
app.get('/', async (req, res) => {
	try {
		const books = await Book.find()
			// Fetch only necessary fields
			.select('title author publisher createdAt')
			// Fetch only the author's name
			.populate('author', 'name')
			// Fetch only the publisher's name
			.populate('publisher', 'name')
			.limit(10)
			.sort({ createdAt: -1 });
		res.render('index', { books });
	}
	catch (error) {
		console.error('Error fetching books:', error.message);
		res.status(500).render('error', { message: 'An error occurred while loading the homepage.' });
	}
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
	server.close(() => {
		console.log('Server shut down gracefully.');
		process.exit(0);
	});
});