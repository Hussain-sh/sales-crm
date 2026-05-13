const interactionModel = require('../models/interactionModel');
const leadModel = require('../models/leadModel');

const createInteraction = async(leadId, data) => {
    if (!data.interaction_note) {
        const error = new Error('Interaction note is required');
        error.status = 400;
        throw error;
    }
    const interaction =
        await interactionModel.createInteraction(
            leadId,
            data
        );
    await leadModel.updateLastInteractionAt(
        leadId
    );
    return interaction;
};

const getLeadInteractions = async(leadId) => {
    return await interactionModel.getLeadInteractions(leadId);
};

module.exports = {
    createInteraction,
    getLeadInteractions
};