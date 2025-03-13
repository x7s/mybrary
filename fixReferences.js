const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Connection error:', err));

// Define the Book model (ensure it matches your schema)
const Book = mongoose.model('Book', new mongoose.Schema({
	title: String,
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
	publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
	// Other fields...
}));

// Replace these IDs with the actual IDs of your default author and publisher
const defaultAuthorId = '64f1c7a9b2d4a3d7f8a7b1c2';
const defaultPublisherId = '64f1c7a9b2d4a3d7f8a7b1c3';

async function fixReferences() {
	try {
		// Update books with missing or invalid author
		await Book.updateMany(
			{ $or: [{ author: { $exists: false } }, { author: null }] },
			{ $set: { author: defaultAuthorId } },
		);

		// Update books with missing or invalid publisher
		await Book.updateMany(
			{ $or: [{ publisher: { $exists: false } }, { publisher: null }] },
			{ $set: { publisher: defaultPublisherId } },
		);

		console.log('Invalid references fixed successfully!');
	}
	catch (error) {
		console.error('Error fixing references:', error);
	}
	finally {
		mongoose.connection.close();
	}
}

fixReferences();