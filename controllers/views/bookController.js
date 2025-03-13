const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');

exports.renderNewForm = async (req, res) => {
	try {
		const authors = await Author.find();
		const publishers = await Publisher.find();
		res.render('books/new', { book: new Book(), authors, publishers });
	}
	catch {
		res.redirect('/books');
	}
};

exports.createBook = async (req, res) => {
	const book = new Book(req.body);
	try {
		await book.save();
		res.redirect(`/books/${book.id}`);
	}
	catch {
		res.render('books/new', {
			book: book,
			errorMessage: 'Error creating book',
		});
	}
};