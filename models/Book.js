const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: 'No description provided',
	},
	publishYear: {
		type: Date,
	},
	publishDate: {
		type: Date,
		required: true,
	},
	pageCount: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	coverImage: {
		type: Buffer,
	},
	coverImageType: {
		type: String,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Author',
		required: true,
	},
	publisher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Publisher',
		required: true,
	},
});

bookSchema.virtual('coverImagePath').get(function() {
	if (this.coverImage != null && this.coverImageType != null) {
		return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
	}
});

module.exports = mongoose.model('Book', bookSchema);