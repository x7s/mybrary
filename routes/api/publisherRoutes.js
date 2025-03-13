const express = require('express');
const router = express.Router();
const {
	getAllPublishers,
	getPublisherById,
	createPublisher,
	updatePublisher,
	deletePublisher,
} = require('../../controllers/api/publisherController');

// API Endpoints
router.get('/', getAllPublishers);
router.get('/:id', getPublisherById);
router.post('/', createPublisher);
router.put('/:id', updatePublisher);
router.delete('/:id', deletePublisher);

module.exports = router;