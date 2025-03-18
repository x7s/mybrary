const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
	getAllAuthors,
	getAuthorById,
	createAuthor,
	updateAuthor,
	deleteAuthor,
} = require('../../controllers/api/authorController');

// Валидация за POST заявка (създаване на автор)
router.post(
	'/',
	[
		check('name').notEmpty().withMessage('Name is required'),
		check('bio').optional().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters long'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	createAuthor,
);

// API Endpoints
router.get('/', getAllAuthors);
router.get('/:id', getAuthorById);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);

module.exports = router;