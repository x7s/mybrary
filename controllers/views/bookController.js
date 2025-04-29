const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');
const imageUploader = require('../../utils/imageUploader');

exports.renderNewForm = async (req, res) => {
	try {
		const [authors, publishers] = await Promise.all([
			Author.find(),
			Publisher.find(),
		]);

		res.render('books/new', {
			book: new Book(),
			authors,
			publishers,
		});
	}
	catch (error) {
		console.error('Error rendering new book form:', error);
		res.redirect('/books');
	}
};
exports.index = async (req, res) => {
	try {
	  const books = await Book.find()
			.populate('author')
			.populate('publisher')
			// Add lean() to ensure virtuals are available
			.lean();

	  // Debug: Check what's being sent to the view
	  console.log('Sample book data:', {
			title: books[0]?.title,
			coverImagePath: books[0]?.coverImagePath,
			// Check if virtual exists
			coverImageUrl: books[0]?.coverImageUrl,
	  });

	  res.render('index', { books });
	}
	catch (error) {
	  console.error('Error fetching books:', error);
	  res.redirect('/');
	}
};
exports.createBook = async (req, res) => {
	try {
	  const bookData = req.body;
	  const book = new Book(bookData);

	  // Process cover image if uploaded
	  if (req.files?.cover) {
			try {
		  const { coverPath, thumbPath } = await imageUploader.processBookCover(req.files.cover);
		  book.coverImagePath = coverPath;
		  book.thumbnailPath = thumbPath;
			}
			catch (uploadError) {
		  const [authors, publishers] = await Promise.all([
					Author.find(),
					Publisher.find(),
		  ]);
		  return res.render('books/new', {
					book: bookData,
					authors,
					publishers,
					errorMessage: uploadError.message,
		  });
			}
	  }

	  await book.save();
	  // DEBUG: Verify paths were saved
	  console.log('Saved book:', {
			id: book.id,
			coverPath: book.coverImagePath,
			thumbPath: book.thumbnailPath,
	  });
	  res.redirect(`/books/${book.id}`);
	}
	catch (error) {
	  console.error('Error creating book:', error);
	  const [authors, publishers] = await Promise.all([
			Author.find(),
			Publisher.find(),
	  ]);
	  res.render('books/new', {
			book: req.body,
			authors,
			publishers,
			errorMessage: 'Error creating book. Please try again.',
	  });
	}
};