const mongoose = require('mongoose');
// const path = require('path');

const bookSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, default: 'No description provided' },
		publishDate: { type: Date, required: true },
		pageCount: { type: Number, required: true },
		coverImagePath: { type: String },
		thumbnailPath: { type: String },
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
		publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
	},
	{ timestamps: true },
);

// Virtual properties
bookSchema.virtual('coverImageUrl').get(function() {
	if (this.coverImagePath) {
	  return this.coverImagePath.startsWith('/uploads/')
			? this.coverImagePath
			: `/uploads/covers/${this.coverImagePath}`;
	}
	return '/uploads/default-cover.png';
});

// Add this to ensure virtuals are included in queries
bookSchema.set('toObject', { virtuals: true });
bookSchema.set('toJSON', { virtuals: true });

bookSchema.virtual('thumbnailUrl').get(function() {
	if (!this.thumbnailPath) return '/uploads/default-thumbnail.png';
	return this.thumbnailPath.startsWith('/uploads/')
	  ? this.thumbnailPath
	  : `/uploads/thumbnails/${this.thumbnailPath}`;
});

module.exports = mongoose.model('Book', bookSchema);