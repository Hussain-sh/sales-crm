const interactionService = require('../services/interactionService');

const createInteraction = async(req, res) => {
    const { id } = req.params;
    const interaction = await interactionService.createInteraction(
        id,
        req.body
    );
    res.status(201).json({
        success: true,
        message: 'Interaction created successfully',
        interaction
    });

};

const getLeadInteractions = async(req, res) => {
    const { id } = req.params;
    const interactions = await interactionService.getLeadInteractions(id);
    res.status(200).json({
        success: true,
        count: interactions.length,
        interactions
    });
};

module.exports = {
    createInteraction,
    getLeadInteractions
};