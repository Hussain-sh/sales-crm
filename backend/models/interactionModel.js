const pool = require('../config/db');

const createInteraction = async(leadId, data) => {

    const query = `
        INSERT INTO lead_interactions (
            lead_id,
            interaction_note,
            interaction_type
        )
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const values = [
        leadId,
        data.interaction_note,
        data.interaction_type || 'manual_note'
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getLeadInteractions = async(leadId) => {

    const query = `
        SELECT *
        FROM lead_interactions
        WHERE lead_id = $1
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [leadId]);

    return result.rows;
};

module.exports = {
    createInteraction,
    getLeadInteractions
};