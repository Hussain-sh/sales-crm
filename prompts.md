# AI Prompts

This document explains the prompts used by the backend AI service and the reasoning behind their structure.

The prompts live in:

```txt
backend/services/aiService.js
```

The backend uses Groq through the OpenAI-compatible SDK.

## Model

Both AI features currently use:

```txt
llama-3.1-8b-instant
```

This model is used for quick, low-latency sales assistance tasks where the expected outputs are short and structured.

## Prompt 1: Lead Priority Scoring

Used by:

```txt
POST /leads/:id/recalculate-score
```

Function:

```txt
calculateLeadScore
```

### Prompt

```txt
You are a strict B2B sales scoring assistant.
Your job is to score leads as High, Medium, or Low priority.
Most leads should be Medium. Be conservative with High.

Lead Details:
- Name: {lead.name} at {lead.company}
- Industry: {lead.industry}
- Deal Size: ${lead.deal_size}
- Stage: {lead.stage}
- Days Since Last Contact: {daysSinceContact}

Recent Interactions:
{formattedInteractions}

Scoring Rules - follow exactly:

HIGH - must meet at least 2 of these 4:
1. Deal size is above 80,000
2. Stage is "Negotiation"
3. Days since last contact is between 3 and 8
4. Interactions mention: budget approved, contract, ready to sign, or decision made

MEDIUM - meets only 1 High criteria OR:
- Deal size between 20,000 and 80,000
- Stage is "Interested" or "Contacted" with some positive signals
- Interactions mention interest but no urgency or budget confirmation

LOW - meets none of the above OR any of these:
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
```

### Reasoning

The prompt is designed to make scoring consistent and conservative.

The role instruction tells the model to behave like a B2B sales scoring assistant instead of a general assistant. This narrows the model's decision-making context.

The lead details section gives the model structured inputs:

- company and lead identity
- industry
- deal size
- sales stage
- time since last contact
- previous interaction notes

The scoring rules are explicit because priority scoring should not feel random. The `High` category intentionally requires at least two strong signals, which prevents too many leads from being marked high priority.

The `Medium` category acts as the default middle ground. This is important because most real sales leads are not urgent, but they also should not be ignored.

The `Low` category captures weak or stale leads, such as new leads without outreach, small deals, or leads with no recent positive engagement.

The final JSON-only instruction makes the response easier to parse in the backend:

```js
JSON.parse(content)
```

Without a strict output format, the model might return prose around the JSON, which would break parsing.

### Temperature

```txt
0.3
```

A lower temperature is used because scoring should be stable and repeatable. The model should follow rules more than it should be creative.

## Prompt 2: Follow-Up Message Generation

Used by:

```txt
POST /leads/:id/generate-followup
```

Function:

```txt
generateFollowUp
```

### Prompt

```txt
You are a professional sales assistant.

Generate a short personalized sales follow-up message.

Lead Details:
Name: {lead.name}
Company: {lead.company}
Industry: {lead.industry}
Deal Size: {lead.deal_size}
Stage: {lead.stage}

Previous Interactions:
{formattedInteractions}

Rules:
- Keep it professional
- Keep it concise
- Sound human
- Mention relevant context
- Do NOT use markdown
- Return ONLY the message
```

### Reasoning

This prompt is built for a different type of output: natural language that a salesperson can copy and send.

The role instruction frames the model as a professional sales assistant, which encourages a polished but practical tone.

The lead details help the model personalize the message. The interaction history gives it context from previous communication, so the output can reference the actual relationship instead of sounding generic.

The rules keep the generated message usable:

- `professional` keeps the tone appropriate for B2B communication
- `concise` prevents long email drafts
- `sound human` avoids robotic sales language
- `mention relevant context` makes the follow-up feel personalized
- `Do NOT use markdown` keeps the output ready to copy into email or chat
- `Return ONLY the message` avoids extra explanation or labels

### Temperature

```txt
0.5
```

A slightly higher temperature is used here than in scoring because follow-up writing benefits from more natural variation. It still stays low enough to avoid overly creative or off-brand responses.

## Input Formatting

Interactions are converted into bullet-style context before being passed to the model:

```txt
- Spoke with buyer about budget approval
- Asked for a follow-up next week
- Mentioned contract review is in progress
```

This is done because interaction history is easier for the model to scan when each note is separated clearly.

For scoring, when no interactions exist, the prompt uses:

```txt
No interactions yet
```

This gives the model an explicit signal that the lead has no engagement history.

## Output Usage

Lead scoring returns structured data used to update the `leads` table:

```txt
priority_score
priority_reason
ai_focus_reason
```

Follow-up generation returns plain text that is displayed in the frontend and can be copied by the user.

## Future Improvements

Possible improvements:

- Add schema validation before parsing AI JSON
- Normalize priority scores to lowercase before saving
- Add retry logic if JSON parsing fails
- Move prompt templates into separate files for easier editing
- Add separate prompts per sales stage
- Include interaction type and timestamps in prompt context
- Add guardrails for missing or sparse lead data
