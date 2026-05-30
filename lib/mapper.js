/**
 * mapper.js
 *
 * Deterministic, human-verified mapping from assessment slots to regulatory regimes.
 * No AI inference in this layer. Every output is traceable to a specific trigger condition.
 *
 * To update regulatory coverage: edit citations.json.
 * To update trigger logic: update the conditions below.
 */

const MENTAL_HEALTH_KEYWORDS = [
  "mental health", "therapy", "diagnosis", "mood", "crisis",
  "triage", "symptom", "clinical"
];

/**
 * Maps filled assessment slots to the regulatory regimes that apply.
 * Returns an object containing:
 *   - regimes: array of triggered regime objects
 *   - mhraAdvisory: object with advisory note if health sector, otherwise null
 *   - mentalHealthEuFlag: boolean, true if health + mental health keywords detected
 *
 * @param {Object} slots - Filled slots from the assessment
 * @param {Object} citations - The citations store (lib/citations.json)
 * @returns {{ regimes: Array, mhraAdvisory: Object|null, mentalHealthEuFlag: boolean }}
 */
export function mapSlotsToRegimes(slots, citations) {
  const { regimes } = citations;
  const triggered = [];

  const sector = (slots.sector || "").toLowerCase();
  const description = (slots.ai_description || "").toLowerCase();
  const dataTypes = Array.isArray(slots.data_types) ? slots.data_types : [];
  const isFinancial = sector.includes("financ") || sector.includes("banking") || sector.includes("insurance") || sector.includes("lending");
  const isHealth = sector.includes("health") || sector.includes("medical") || sector.includes("pharma") || sector.includes("clinical");

  // Detect mental health keywords in the AI description
  const mentalHealthEuFlag = isHealth && MENTAL_HEALTH_KEYWORDS.some(kw => description.includes(kw));

  // ── ICO / UK GDPR ─────────────────────────────────────────────────────────
  const hasPersonalData = dataTypes.length > 0 && !dataTypes.every(d => d === "none");
  const hasSpecialCategory = dataTypes.some(d =>
    ["biometric", "health", "genetic"].includes(d.toLowerCase())
  );

  if (hasPersonalData || slots.decision_making === "yes") {
    let reason = "Your AI system processes personal data, which brings it within the scope of UK GDPR and the Data Protection Act 2018.";

    if (hasSpecialCategory) {
      const special = dataTypes.filter(d => ["biometric", "health", "genetic"].includes(d.toLowerCase()));
      reason = `Your AI system processes ${special.join(" and ")} data, which is special category data under Article 9 of UK GDPR. This triggers heightened obligations including an explicit consent condition or Schedule 1 exemption.`;
    }

    if (slots.decision_making === "yes" && !hasSpecialCategory) {
      reason += " Because the system makes or influences decisions about individuals, Article 22 automated decision-making obligations may also apply.";
    }

    triggered.push({ ...regimes.ico_gdpr, trigger_reason: reason });
  }

  // ── FCA ───────────────────────────────────────────────────────────────────
  if (isFinancial) {
    let reason = "Your AI system operates in the financial services sector, bringing it within scope of FCA Consumer Duty (PS22/9) and the FCA's AI and Machine Learning guidance (DP5/22).";

    if (slots.credit_decisioning === "yes") {
      reason = "Your AI system makes credit or lending decisions. This triggers FCA Consumer Duty obligations, algorithmic fairness requirements, and model risk management expectations under DP5/22. Credit decisioning AI faces some of the most intensive regulatory scrutiny in the UK.";
    }

    triggered.push({ ...regimes.fca, trigger_reason: reason });
  }

  // ── CMA ───────────────────────────────────────────────────────────────────
  // Triggers for customer-facing systems that make decisions OR operate as
  // recommendation, ranking, personalisation, or scoring systems.
  const CMA_DESCRIPTION_KEYWORDS = [
    "recommend", "recommendation", "ranking", "rank",
    "personalise", "personalisation", "personalize", "personalization",
    "score", "scoring"
  ];
  const cmaDescriptionMatch = CMA_DESCRIPTION_KEYWORDS.some(kw => description.includes(kw));

  if (slots.customer_facing === "yes" && (slots.decision_making === "yes" || cmaDescriptionMatch)) {
    const cmaReason = cmaDescriptionMatch && slots.decision_making !== "yes"
      ? "Your AI system is customer-facing and operates as a recommendation, ranking, personalisation, or scoring system. Under CMA consumer protection principles, these systems carry equivalent regulatory exposure to systems that make direct decisions, as they materially influence consumer choices. This engages the CMA's consumer protection guidance on AI, requirements around transparency and fairness, and the prohibition on unfair commercial practices under the Digital Markets, Competition and Consumers Act 2024."
      : "Your AI system is customer-facing and influences decisions or recommendations. This engages the CMA's consumer protection guidance on AI, including requirements around transparency, fairness, and the prohibition on unfair commercial practices under the Digital Markets, Competition and Consumers Act 2024.";

    triggered.push({
      ...regimes.cma,
      trigger_reason: cmaReason,
    });
  }

  // ── MHRA ──────────────────────────────────────────────────────────────────
  // Triggers as a full regime only when ai_medical_device = yes.
  if (isHealth && slots.ai_medical_device === "yes") {
    triggered.push({
      ...regimes.mhra,
      trigger_reason:
        "Your AI system operates in the health sector and is intended to diagnose, monitor, treat, or predict health conditions. This means it may qualify as Software as a Medical Device (SaMD) under the Medical Devices Regulations 2002, one of the most heavily regulated categories for AI in the UK.",
    });
  }

  // ── EHRC ──────────────────────────────────────────────────────────────────
  if (slots.decision_making === "yes" || slots.customer_facing === "yes") {
    triggered.push({
      ...regimes.ehrc,
      trigger_reason:
        "Your AI system is customer-facing. The Equality Act 2010 applies to any AI system that produces outputs affecting individuals or businesses, even where it does not make decisions directly. If the system produces outputs that disproportionately disadvantage users sharing a protected characteristic, that constitutes indirect discrimination regardless of intent. Ongoing bias monitoring and documentation are required.",
    });
  }

  // ── DSIT ──────────────────────────────────────────────────────────────────
  triggered.push({
    ...regimes.dsit,
    trigger_reason:
      "The DSIT AI governance framework and its five cross-cutting principles apply to all AI deployments in the UK. While not yet statutory, these principles, covering safety, transparency, fairness, accountability, and contestability, guide how all sector regulators interpret their own rules in an AI context.",
  });

  // ── EU AI Act ─────────────────────────────────────────────────────────────
  if (slots.eu_exposure === "yes") {
    let reason =
      "Your business has EU customers or users. The EU AI Act applies to any organisation deploying AI to EU users, regardless of where the business is based. Full obligations for high-risk systems apply from August 2026.";

    if (slots.decision_making === "yes") {
      reason =
        "Your AI system serves EU users and influences decisions about individuals. Depending on the domain, it may qualify as a high-risk system under Annex III of the EU AI Act, triggering requirements for technical documentation, human oversight, transparency disclosures, and conformity assessment before deployment. Full obligations apply from August 2026.";
    }

    // Mental health flag: append Annex III note
    if (mentalHealthEuFlag) {
      reason +=
        " Your system description includes terms associated with mental health, therapy, triage, or clinical support. Mental health and crisis support applications may fall under Annex III high-risk classification in the EU AI Act. You should seek specialist regulatory advice to determine whether your system qualifies as high-risk before deployment to EU users.";
    }

    triggered.push({ ...regimes.eu_ai_act, trigger_reason: reason });
  }

  // ── MHRA Advisory ─────────────────────────────────────────────────────────
  // Always generated for health sector deployments, regardless of ai_medical_device answer.
  const mhraAdvisory = isHealth
    ? {
        title: "MHRA Advisory",
        text: "Medical device classification under MHRA guidance requires professional assessment and cannot be determined by self-report. If your system provides symptom guidance, triage support, clinical recommendations, or mental health support of any kind, it may constitute a Software as a Medical Device under MHRA's DSTI framework. You should seek specialist regulatory advice before deployment.",
      }
    : null;

  return { regimes: triggered, mhraAdvisory, mentalHealthEuFlag };
}

/**
 * Calculates the overall risk level for the assessment.
 *
 * @param {Object} slots
 * @param {Array} triggeredRegimes
 * @returns {'low'|'medium'|'high'}
 */
export function calculateRiskLevel(slots, triggeredRegimes) {
  const sector = (slots.sector || "").toLowerCase();
  const dataTypes = Array.isArray(slots.data_types) ? slots.data_types : [];
  const isFinancial = sector.includes("financ") || sector.includes("banking") || sector.includes("insurance") || sector.includes("lending");
  const isHealth = sector.includes("health") || sector.includes("medical") || sector.includes("pharma") || sector.includes("clinical");

  if (isHealth && slots.ai_medical_device === "yes") return "high";
  if (dataTypes.some(d => ["biometric", "genetic"].includes(d.toLowerCase()))) return "high";
  if (isFinancial && slots.credit_decisioning === "yes") return "high";
  if (slots.eu_exposure === "yes" && slots.decision_making === "yes") return "high";
  if (isHealth && slots.eu_exposure === "yes") return "high";
  if (slots.decision_making === "yes") return "medium";
  if (slots.customer_facing === "yes" && isFinancial) return "medium";
  if (triggeredRegimes.length >= 4) return "medium";
  if (slots.eu_exposure === "yes" && slots.customer_facing === "yes") return "medium";

  return "low";
}
