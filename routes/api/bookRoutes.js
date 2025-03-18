const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
	getAllBooks,
	getBookById,
	createBook,
	updateBook,
	deleteBook,
} = require('../../controllers/api/bookController');
const { authAdmin } = require('../../middleware/authMiddleware');

// Валидация за POST (създаване на книга)
router.post(
	'/',
	[
		check('title').notEmpty().withMessage('Title is required'),
		check('author').notEmpty().withMessage('Author is required'),
		check('description').optional().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters long'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	createBook,
);

// Защита на DELETE маршрута
router.delete('/:id', authAdmin, deleteBook);

// API Endpoints
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);

module.exports = router;
