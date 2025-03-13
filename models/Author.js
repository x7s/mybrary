const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	bio: {
		type: String,
		default: 'No bio provided',
	},
	books: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Book',
	}],
});

module.exports = mongoose.model('Author', authorSchema);