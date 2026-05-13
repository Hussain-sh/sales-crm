const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

const calculateLeadScore = async(lead, interactions) => {
    const formattedInteractions = interactions
        .map((interaction) => {
            return `- ${interaction.interaction_note}`;
        })
        .join('\n');

    const prompt = `
    You are an AI CRM assistant.

    Analyze the lead and return ONLY valid JSON.

    Lead Details:
    Name: ${lead.name}
    Company: ${lead.company}
    Industry: ${lead.industry}
    Deal Size: ${lead.deal_size}
    Stage: ${lead.stage}

    Interactions:
    ${formattedInteractions}

    Return response ONLY in this format:

    {
    "priority_score": "high",
    "priority_reason": "short reason",
    "ai_focus_reason": "short reason"
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