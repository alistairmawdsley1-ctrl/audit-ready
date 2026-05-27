/**
 * /api/assess
 *
 * Receives the conversation history, calls Claude to get the next question
 * or detect that all required slots are filled. Claude drives the conversation
 * only — no regulatory output is generated here.
 *
 * POST body:  { history: [{ role: 'user'|'assistant', content: string }] }
 * Response:   { status: 'question', question: string, progress: number }
 *          or { status: 'complete', slots: { ... } }
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are conducting a structured regulatory compliance assessment for a UK SME that is deploying an AI system. Your role is to gather specific information about their project through professional, jargon-free questions — one question at a time.

YOUR GOAL: Fill the following data slots.

REQUIRED SLOTS (collect for every assessment):
- sector: the business's industry or sector (e.g. financial services, health, retail, HR and recruitment, legal, logistics, other)
- ai_description: a plain-English description of what the AI system does
- decision_making: whether the AI makes or influences decisions about individual people (yes / no)
- data_types: categories of personal data processed — choose any that apply from: financial, health, biometric, location, behavioural, general_personal, none
- customer_facing: whether the system is customer-facing or used internally only (yes / no)
- eu_exposure: whether the business has customers or users in the EU (yes / no)

CONDITIONAL SLOTS (only ask if the trigger condition is met):
- credit_decisioning: only if sector = financial services. Does the system make or influence credit, lending, or insurance decisions? (yes / no)
- ai_medical_device: only if sector = health. Is the system intended to diagnose, monitor, treat, or predict health conditions for individual patients? (yes / no)

RULES:
- Ask exactly ONE question per turn. Never ask two things in one message.
- Use plain English. Assume the user is a founder or product manager, not a lawyer.
- Briefly acknowledge the previous answer in one sentence before asking the next question.
- Do not explain what you are trying to find out or name the slots.
- Stop once all required and relevant conditional slots are filled.
- If an answer is ambiguous, ask a brief clarifying follow-up before moving on.

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no code blocks, no additional text.

When asking the next question:
{"status":"question","question":"Your question here.","progress":20}

The progress value is an integer 0–100 representing your estimate of how complete the assessment is.

When all required slots are filled:
{"status":"complete","slots":{"sector":"...","ai_description":"...","decision_making":"yes|no","data_types":["array","of","types"],"customer_facing":"yes|no","eu_exposure":"yes|no","credit_decisioning":"yes|no|null","ai_medical_device":"yes|no|null"}}

Important: data_types must be an array even if it contains only one item. Use null for conditional slots that were not triggered.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { history } = req.body;

  if (!Array.isArray(history)) {
    return res.status(400).json({ error: "history must be an array" });
  }

  // Seed message to get Claude to ask the first question unprompted
  const messages =
    history.length === 0
      ? [{ role: "user", content: "Please begin the assessment." }]
      : history;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    const raw = response.content[0]?.text?.trim() ?? "";

    // Strip markdown code fences if Claude adds them despite instructions
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Parsing failed — fall back gracefully rather than crashing
      console.error("Claude response was not valid JSON:", raw);
      return res.status(200).json({
        status: "question",
        question: "Could you tell me a bit more about the AI system you are deploying?",
        progress: 5,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Anthropic API error:", error?.message ?? error);
    return res.status(500).json({
      error: "Assessment service is temporarily unavailable. Please refresh and try again.",
    });
  }
}
