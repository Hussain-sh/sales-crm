const express = require('express');

const router = express.Router({ mergeParams: true });

const asyncHandler = require('../utils/asyncHandler');

const {
    createInteraction,
    getLeadInteractions
} = require('../controllers/interactionController');

router.post('/', asyncHandler(createInteraction));

router.get('/', asyncHandler(getLeadInteractions));

module.exports = router;