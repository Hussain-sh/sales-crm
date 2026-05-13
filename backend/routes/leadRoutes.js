const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');

const {
    createLead,
    getAllLeads,
    getLeadById,
    updateLead,
    deleteLead,
    recalculateLeadScore,
    generateFollowUp,
    getFocusList,
    getPipelineSummary
} = require('../controllers/leadController');

router.post('/', asyncHandler(createLead));
router.get('/', asyncHandler(getAllLeads));
router.get('/focus-list', asyncHandler(getFocusList));
router.get('/pipeline-summary', asyncHandler(getPipelineSummary));
router.get('/:id', asyncHandler(getLeadById));
router.patch('/:id', asyncHandler(updateLead));
router.delete('/:id', asyncHandler(deleteLead));
router.post('/:id/recalculate-score', asyncHandler(recalculateLeadScore));
router.post('/:id/generate-followup', asyncHandler(generateFollowUp));


module.exports = router;