const Author = require('../../models/Author');

exports.getAllAuthors = async (req, res) => {
	try {
		const authors = await Author.find();
		res.json(authors);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAuthorById = async (req, res) => {
	try {
		const author = await Author.findById(req.params.id);
		if (!author) {
			return res.status(404).json({ message: 'Author not found' });
		}
		res.json(author);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.createAuthor = async (req, res) => {
	try {
		const author = new Author(req.body);
		await author.save();
		res.status(201).json(author);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updateAuthor = async (req, res) => {
	try {
		const author = await Author.findById(req.params.id);
		if (!author) {
			return res.status(404).json({ message: 'Author not found' });
		}
		author.name = req.body.name || author.name;
		author.bio = req.body.bio || author.bio;
		const updatedAuthor = await author.save();
		res.json(updatedAuthor);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteAuthor = async (req, res) => {
	try {
		const author = await Author.findById(req.params.id);
		if (!author) {
			return res.status(404).json({ message: 'Author not found' });
		}
		await author.remove();
		res.json({ message: 'Author deleted' });
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};