const leadModel = require('../models/leadModel');
const interactionModel = require('../models/interactionModel');
const aiService = require('./aiService');

const createLead = async(data) => {
    if (!data.name) {
        const error = new Error('Name is required');
        error.status = 400;
        throw error;
    }
    if (!data.company) {
        const error = new Error('Company is required');
        error.status = 400;
        throw error;
    }
    return await leadModel.createLead(data);
};

const getAllLeads = async() => {
    return await leadModel.getAllLeads();
};

const getLeadById = async(id) => {
    const lead = await leadModel.getLeadById(id);
    if (!lead) {
        const error = new Error('Lead not found');
        error.status = 404;
        throw error;
    }
    return lead;
};

const updateLead = async(id, data) => {
    const lead = await leadModel.updateLead(id, data);
    if (!lead) {
        const error = new Error('Lead not found');
        error.status = 404;
        throw error;
    }
    return lead;
};

const deleteLead = async(id) => {
    const lead = await leadModel.deleteLead(id);
    if (!lead) {
        const error = new Error('Lead not found');
        error.status = 404;
        throw error;
    }
    return lead;
};

const recalculateLeadScore = async(id) => {
    const lead = await leadModel.getLeadById(id);
    if (!lead) {
        const error = new Error('Lead not found');
        error.status = 404;
        throw error;
    }
    const interactions =
        await interactionModel.getLeadInteractions(id);
    const aiResponse =
        await aiService.calculateLeadScore(
            lead,
            interactions
        );
    
    aiResponse.priority_score = aiResponse.priority_score.toLowerCase();
    const updatedLead =
        await leadModel.updateLeadAIScore(
            id,
            aiResponse
        );
    return updatedLead;
};

const generateFollowUp = async(id) => {
    const lead = await leadModel.getLeadById(id);
    if (!lead) {
        const error = new Error('Lead not found');
        error.status = 404;
        throw error;
    }
    const interactions = await interactionModel.getLeadInteractions(id);
    const followUp = await aiService.generateFollowUp(lead,interactions);
    return followUp;
};

const getFocusList = async() => {
    return await leadModel.getFocusList();
};

const getPipelineSummary = async() => {
    return await leadModel.getPipelineSummary();
};

module.exports = {
    createLead,
    getAllLeads,
    getLeadById,
    updateLead,
    deleteLead,
    recalculateLeadScore,
    generateFollowUp,
    getFocusList,
    getPipelineSummary
};