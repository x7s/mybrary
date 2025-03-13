const Author = require('../../models/Author');

exports.renderNewForm = (req, res) => {
	res.render('authors/new', { author: new Author() });
};

exports.createAuthor = async (req, res) => {
	const author = new Author(req.body);
	try {
		await author.save();
		res.redirect(`/authors/${author.id}`);
	}
	catch {
		res.render('authors/new', {
			author: author,
			errorMessage: 'Error creating author',
		});
	}
};