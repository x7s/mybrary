const Book = require('../../models/Book');

exports.getAllBooks = async (req, res) => {
	try {
		const books = await Book.find().populate('author').populate('publisher');
		res.json(books);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getBookById = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id)
			.populate('author')
			.populate('publisher');
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		res.json(book);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.createBook = async (req, res) => {
	try {
		const book = new Book(req.body);
		await book.save();
		res.status(201).json(book);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updateBook = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		book.title = req.body.title || book.title;
		book.author = req.body.author || book.author;
		book.publisher = req.body.publisher || book.publisher;
		book.publishDate = req.body.publishDate || book.publishDate;
		book.pageCount = req.body.pageCount || book.pageCount;
		book.description = req.body.description || book.description;
		const updatedBook = await book.save();
		res.json(updatedBook);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteBook = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		await book.remove();
		res.json({ message: 'Book deleted' });
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};