const express = require('express');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
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

// Import View routes
const adminRoutes = require('./routes/views/adminRoutes');
const viewAuthorRoutes = require('./routes/views/authorRoutes');
const viewBookRoutes = require('./routes/views/bookRoutes');
const publisherRoutes = require('./routes/views/publisherRoutes');
const loginRoutes = require('./routes/views/loginRoutes');
const publisherAuthRoutes = require('./routes/views/publisherAuthRoutes');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

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
        cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
    }),
);

// Middleware to pass session data to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
// Middleware за глобална обработка на грешки
app.use(errorHandler);

// For API
app.use(express.json());

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
app.use('/publishers', publisherRoutes);
app.use('/', loginRoutes);
app.use('/publishers', publisherAuthRoutes);

// Homepage
app.get('/', async (req, res) => {
    try {
        const books = await Book.find()
            .populate('author')
            .populate('publisher')
            .limit(10)
            .sort({ createdAt: -1 });
        res.render('index', { books });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
