const pool = require('../config/db');

const createLead = async(data) => {
    const query = `
        INSERT INTO leads (
            name,
            company,
            industry,
            deal_size,
            stage
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [
        data.name,
        data.company,
        data.industry || null,
        data.deal_size || 0,
        data.stage || 'new'
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllLeads = async() => {
    const query = `
        SELECT *
        FROM leads
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getLeadById = async(id) => {
    const query = `
        SELECT *
        FROM leads
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateLead = async(id, data) => {

    const fields = [];
    const values = [];

    let index = 1;

    for (const key in data) {

        fields.push(`${key} = $${index}`);

        values.push(data[key]);

        index++;
    }

    fields.push(`updated_at = now()`);

    values.push(id);

    const query = `
        UPDATE leads
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

const deleteLead = async(id) => {
    const query = `
        DELETE FROM leads
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateLeadAIScore = async(id, data) => {
    const query = `
        UPDATE leads
        SET
            priority_score = $1,
            priority_reason = $2,
            ai_focus_reason = $3,
            updated_at = now()
        WHERE id = $4
        RETURNING *
    `;
    const values = [
        data.priority_score,
        data.priority_reason,
        data.ai_focus_reason,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateLastInteractionAt = async(id) => {
    const query = `
        UPDATE leads
        SET
            last_interaction_at = now(),
            updated_at = now()
        WHERE id = $1
    `;
    await pool.query(query, [id]);
};

const getFocusList = async() => {
    const query = `
        SELECT
            id,
            name,
            company,
            stage,
            priority_score,
            ai_focus_reason,
            last_interaction_at
        FROM leads
        WHERE
            priority_score IS NOT NULL
            AND stage NOT IN ('closed', 'lost')
        ORDER BY
            CASE
                WHEN priority_score = 'high' THEN 1
                WHEN priority_score = 'medium' THEN 2
                ELSE 3
            END,
            last_interaction_at ASC
        LIMIT 5
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getPipelineSummary = async() => {
    const totalValueQuery = `
        SELECT
            COALESCE(SUM(deal_size), 0)
                AS total_pipeline_value
        FROM leads
        WHERE stage != 'lost'
    `;
    
    const stageDistributionQuery = `
        SELECT
            stage,
            COUNT(*) AS count
        FROM leads
        GROUP BY stage
        ORDER BY stage
    `;
    const totalValueResult =
        await pool.query(totalValueQuery);

    const stageDistributionResult =
        await pool.query(stageDistributionQuery);

    return {
        total_pipeline_value:
            totalValueResult.rows[0]
                .total_pipeline_value,

        stages:
            stageDistributionResult.rows
    };
};

module.exports = {
    createLead,
    getAllLeads,
    getLeadById,
    updateLead,
    deleteLead,
    updateLeadAIScore,
    updateLastInteractionAt,
    getFocusList,
    getPipelineSummary
};