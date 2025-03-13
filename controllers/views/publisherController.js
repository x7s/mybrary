const Publisher = require('../../models/Publisher');

exports.renderNewForm = (req, res) => {
	res.render('publishers/new', { publisher: new Publisher() });
};

exports.createPublisher = async (req, res) => {
	const publisher = new Publisher(req.body);
	try {
		await publisher.save();
		res.redirect(`/publishers/${publisher.id}`);
	}
	catch {
		res.render('publishers/new', {
			publisher: publisher,
			errorMessage: 'Error creating publisher',
		});
	}
};