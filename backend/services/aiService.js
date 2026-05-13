const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

const calculateLeadScore = async(lead, interactions) => {
   const daysSinceContact = lead.last_interaction_date
        ? Math.floor((Date.now() - new Date(lead.last_interaction_date)) / (1000 * 60 * 60 * 24))
        : 999;

    const formattedInteractions = interactions.length > 0
        ? interactions.map((i) => `- ${i.interaction_note}`).join('\n')
        : 'No interactions yet';

    const prompt = `
    You are a strict B2B sales scoring assistant.
    Your job is to score leads as High, Medium, or Low priority.
    Most leads should be Medium. Be conservative with High.

    Lead Details:
    - Name: ${lead.name} at ${lead.company}
    - Industry: ${lead.industry}
    - Deal Size: $${lead.deal_size}
    - Stage: ${lead.stage}
    - Days Since Last Contact: ${daysSinceContact}

    Recent Interactions:
    ${formattedInteractions}

    Scoring Rules — follow exactly:

    HIGH — must meet at least 2 of these 4:
    1. Deal size is above 80,000
    2. Stage is "Negotiation"
    3. Days since last contact is between 3 and 8
    4. Interactions mention: budget approved, contract, ready to sign, or decision made

    MEDIUM — meets only 1 High criteria OR:
    - Deal size between 20,000 and 80,000
    - Stage is "Interested" or "Contacted" with some positive signals
    - Interactions mention interest but no urgency or budget confirmation

    LOW — meets none of the above OR any of these:
    - No response, ghosting, or no interactions at all
    - Stage is "New" with no outreach yet
    - Deal size below 20,000
    - Last contact was more than 14 days ago with no positive signals

    When in doubt, score Medium not High.

    Respond ONLY with this exact JSON, no other text:
    {
    "priority_score": "High",
    "priority_reason": "one sentence, max 15 words",
    "ai_focus_reason": "one sentence, why contact them today or not"
    }
    `;

    const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.3
    });

    const content =
        response.choices[0].message.content;

    return JSON.parse(content);
};

const generateFollowUp = async(lead, interactions) => {
    const formattedInteractions = interactions
        .map((interaction) => {
            return `- ${interaction.interaction_note}`;
        })
        .join('\n');

    const prompt = `
            You are a professional sales assistant.

            Generate a short personalized sales follow-up message.

            Lead Details:
            Name: ${lead.name}
            Company: ${lead.company}
            Industry: ${lead.industry}
            Deal Size: ${lead.deal_size}
            Stage: ${lead.stage}

            Previous Interactions:
            ${formattedInteractions}

            Rules:
            - Keep it professional
            - Keep it concise
            - Sound human
            - Mention relevant context
            - Do NOT use markdown
            - Return ONLY the message
            `;

    const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.5
    });

    return response
        .choices[0]
        .message
        .content;
};

module.exports = {
    calculateLeadScore,
    generateFollowUp
};