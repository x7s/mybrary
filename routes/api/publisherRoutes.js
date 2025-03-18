const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
	getAllPublishers,
	getPublisherById,
	createPublisher,
	updatePublisher,
	deletePublisher,
} = require('../../controllers/api/publisherController');
const { authAdmin } = require('../../middleware/authMiddleware');

// Валидация за POST (създаване на издател)
router.post(
	'/',
	[
		check('name').notEmpty().withMessage('Name is required'),
		check('description').optional().isLength({ max: 500 }).withMessage('Description must be at most 500 characters long'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	createPublisher,
);

// Защита на DELETE маршрута
router.delete('/:id', authAdmin, deletePublisher);

// API Endpoints
router.get('/', getAllPublishers);
router.get('/:id', getPublisherById);
router.put('/:id', updatePublisher);

module.exports = router;
