const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, default: 'No description provided' },
		publishDate: { type: Date, required: true },
		pageCount: { type: Number, required: true },
		coverImage: { type: Buffer },
		coverImageType: { type: String },
		// 📌 Запазваме само пътя
		coverImagePath: { type: String, required: true },
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
		publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
	},
	// Добавя createdAt и updatedAt
	{ timestamps: true },
);

// 📌 Virtual property за извличане на пълния път до изображението

bookSchema.virtual('coverImageUrl').get(function() {
	return `/uploads/${this.coverImagePath}`;
});
/*
bookSchema.virtual('coverImagePath').get(function() {
	if (this.coverImage != null && this.coverImageType != null) {
		return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
	}
});
*/
module.exports = mongoose.model('Book', bookSchema);
