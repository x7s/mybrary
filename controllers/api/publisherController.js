const Publisher = require('../../models/Publisher');

exports.getAllPublishers = async (req, res) => {
	try {
		const publishers = await Publisher.find();
		res.json(publishers);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getPublisherById = async (req, res) => {
	try {
		const publisher = await Publisher.findById(req.params.id);
		if (!publisher) {
			return res.status(404).json({ message: 'Publisher not found' });
		}
		res.json(publisher);
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.createPublisher = async (req, res) => {
	try {
		const publisher = new Publisher(req.body);
		await publisher.save();
		res.status(201).json(publisher);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updatePublisher = async (req, res) => {
	try {
		const publisher = await Publisher.findById(req.params.id);
		if (!publisher) {
			return res.status(404).json({ message: 'Publisher not found' });
		}
		publisher.name = req.body.name || publisher.name;
		publisher.location = req.body.location || publisher.location;
		publisher.foundedYear = req.body.foundedYear || publisher.foundedYear;
		const updatedPublisher = await publisher.save();
		res.json(updatedPublisher);
	}
	catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deletePublisher = async (req, res) => {
	try {
		const publisher = await Publisher.findById(req.params.id);
		if (!publisher) {
			return res.status(404).json({ message: 'Publisher not found' });
		}
		await publisher.remove();
		res.json({ message: 'Publisher deleted' });
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
};