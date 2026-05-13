const leadService = require('../services/leadService')

const createLead = async (req, res) => {
    const lead = await leadService.createLead(req.body);
    res.status(201).json({
        message: 'Lead created successfully',
        lead
    });
}

const getAllLeads = async(req, res) => {
    const leads = await leadService.getAllLeads();
    res.status(200).json({
        success: true,
        count: leads.length,
        leads
    });
};

const getLeadById = async(req, res) => {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);
    res.status(200).json({
        success: true,
        lead
    });
};

const updateLead = async(req, res) => {
    const { id } = req.params;
    const lead = await leadService.updateLead(id, req.body);
    res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        lead
    });
};

const deleteLead = async(req, res) => {
    const { id } = req.params
    await leadService.deleteLead(id);
    res.status(200).json({
        success: true,
        message: 'Lead deleted successfully'
    });
};

const recalculateLeadScore = async(req, res) => {
    const { id } = req.params;
    const lead =
        await leadService.recalculateLeadScore(id);
    res.status(200).json({
        success: true,
        message: 'Lead score updated successfully',
        lead
    });
};

const generateFollowUp = async(req, res) => {
    const { id } = req.params;
    const followUp = await leadService.generateFollowUp(id);
    res.status(200).json({
        success: true,
        follow_up_message: followUp
    });
};

const getFocusList = async(req, res) => {
    const focusList =
        await leadService.getFocusList();
    res.status(200).json({
        success: true,
        count: focusList.length,
        focus_list: focusList
    });
};

const getPipelineSummary = async(req, res) => {
    const summary =
        await leadService.getPipelineSummary();
    res.status(200).json({
        success: true,
        summary
    });
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