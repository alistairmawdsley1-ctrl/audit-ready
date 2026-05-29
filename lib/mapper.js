/**
 * mapper.js
 *
 * Deterministic, human-verified mapping from assessment slots to regulatory regimes.
 * No AI inference in this layer. Every output is traceable to a specific trigger condition.
 *
 * To update regulatory coverage: edit citations.json.
 * To update trigger logic: update the conditions below.
 */

/**
 * Maps filled assessment slots to the regulatory regimes that apply.
 * Returns an array of regime objects enriched with trigger_reason text.
 *
 * @param {Object} slots - Filled slots from the assessment
 * @param {Object} citations - The citations store (lib/citations.json)
 * @returns {Array} triggered regime objects
 */
export function mapSlotsToRegimes(slots, citations) {
  const { regimes } = citations;
  const triggered = [];

  const sector = (slots.sector || "").toLowerCase();
  const dataTypes = Array.isArray(slots.data_types) ? slots.data_types : [];
  const isFinancial = sector.includes("financ") || sector.includes("banking") || sector.includes("insurance") || sector.includes("lending");
  const isHealth = sector.includes("health") || sector.includes("medical") || sector.includes("pharma") || sector.includes("clinical");

  // ── ICO / UK GDPR ─────────────────────────────────────────────────────────
  // Triggers if the system processes any personal data, or makes decisions about individuals.
  const hasPersonalData = dataTypes.length > 0 && !dataTypes.every(d => d === "none");
  const hasSpecialCategory = dataTypes.some(d =>
    ["biometric", "health", "genetic"].includes(d.toLowerCase())
  );

  if (hasPersonalData || slots.decision_making === "yes") {
    let reason = "Your AI system processes personal data, which brings it within the scope of UK GDPR and the Data Protection Act 2018.";

    if (hasSpecialCategory) {
      const special = dataTypes.filter(d => ["biometric", "health", "genetic"].includes(d.toLowerCase()));
      reason = `Your AI system processes ${special.join(" and ")} data — special category data under Article 9 of UK GDPR — which triggers heightened obligations including an explicit consent condition or Schedule 1 exemption.`;
    }

    if (slots.decision_making === "yes" && !hasSpecialCategory) {
      reason += " Because the system makes or influences decisions about individuals, Article 22 automated decision-making obligations may also apply.";
    }

    triggered.push({ ...regimes.ico_gdpr, trigger_reason: reason });
  }

  // ── FCA ───────────────────────────────────────────────────────────────────
  // Triggers for any financial services sector deployment.
  if (isFinancial) {
    let reason = "Your AI system operates in the financial services sector, bringing it within scope of FCA Consumer Duty (PS22/9) and the FCA's AI and Machine Learning guidance (DP5/22).";

    if (slots.credit_decisioning === "yes") {
      reason = "Your AI system makes credit or lending decisions. This triggers FCA Consumer Duty obligations, algorithmic fairness requirements, and model risk management expectations under DP5/22. Credit decisioning AI faces some of the most intensive regulatory scrutiny in the UK.";
    }

    triggered.push({ ...regimes.fca, trigger_reason: reason });
  }

  // ── CMA ───────────────────────────────────────────────────────────────────
  // Triggers for customer-facing systems that influence decisions or recommendations.
  if (slots.customer_facing === "yes" && slots.decision_making === "yes") {
    triggered.push({
      ...regimes.cma,
      trigger_reason:
        "Your AI system is customer-facing and influences decisions or recommendations. This engages the CMA's consumer protection guidance on AI, including requirements around transparency, fairness, and the prohibition on unfair commercial practices under the Digital Markets, Competition and Consumers Act 2024.",
    });
  }

  // ── MHRA ──────────────────────────────────────────────────────────────────
  // Triggers only for health sector deployments that may qualify as medical devices.
  if (isHealth && slots.ai_medical_device === "yes") {
    triggered.push({
      ...regimes.mhra,
      trigger_reason:
        "Your AI system operates in the health sector and is intended to diagnose, monitor, treat, or predict health conditions. This means it may qualify as Software as a Medical Device (SaMD) under the Medical Devices Regulations 2002 — one of the most heavily regulated categories for AI in the UK.",
    });
  }

  // ── EHRC ──────────────────────────────────────────────────────────────────
  // Triggers whenever the system makes or influences decisions about individuals.
  if (slots.decision_making === "yes" || slots.customer_facing === "yes") {
    triggered.push({
      ...regimes.ehrc,
      trigger_reason:
        "Your AI system is customer-facing. The Equality Act 2010 applies to any AI system that produces outputs affecting individuals or businesses, even where it does not make decisions directly. If the system produces outputs that disproportionately disadvantage users sharing a protected characteristic, that constitutes indirect discrimination regardless of intent. Ongoing bias monitoring and documentation are required.",
    });
  }

  // ── DSIT ──────────────────────────────────────────────────────────────────
  // Always applies as the baseline UK AI governance framework.
  triggered.push({
    ...regimes.dsit,
    trigger_reason:
      "The DSIT AI governance framework and its five cross-cutting principles apply to all AI deployments in the UK. While not yet statutory, these principles — safety, transparency, fairness, accountability, and contestability — guide how all sector regulators interpret their own rules in an AI context.",
  });

  // ── EU AI Act ─────────────────────────────────────────────────────────────
  // Triggers if the business has EU customers or users.
  if (slots.eu_exposure === "yes") {
    let reason =
      "Your business has EU customers or users. The EU AI Act applies to any organisation deploying AI to EU users, regardless of where the business is based. Full obligations for high-risk systems apply from August 2026.";

    if (slots.decision_making === "yes") {
      reason =
        "Your AI system serves EU users and influences decisions about individuals. Depending on the domain, it may qualify as a high-risk system under Annex III of the EU AI Act — triggering requirements for technical documentation, human oversight, transparency disclosures, and conformity assessment before deployment. Full obligations apply from August 2026.";
    }

    triggered.push({ ...regimes.eu_ai_act, trigger_reason: reason });
  }

  return triggered;
}

/**
 * Calculates the overall risk level for the assessment.
 * Based on the combination of triggered regimes and slot values.
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

  // ── High risk conditions ───────────────────────────────────────────────────
  // Health + medical device: MHRA compliance is complex and failure is a criminal offence.
  if (isHealth && slots.ai_medical_device === "yes") return "high";

  // Biometric or genetic data: special category, highest ICO scrutiny.
  if (dataTypes.some(d => ["biometric", "genetic"].includes(d.toLowerCase()))) return "high";

  // Financial services + credit decisioning: heavy FCA scrutiny.
  if (isFinancial && slots.credit_decisioning === "yes") return "high";

  // EU exposure + individual decision-making: potential high-risk classification under EU AI Act.
  if (slots.eu_exposure === "yes" && slots.decision_making === "yes") return "high";

  // ── Medium risk conditions ─────────────────────────────────────────────────
  // Individual decision-making: EHRC + Article 22 + potential bias obligations.
  if (slots.decision_making === "yes") return "medium";

  // Customer-facing in financial services: Consumer Duty + CMA exposure.
  if (slots.customer_facing === "yes" && isFinancial) return "medium";

  // Four or more regimes triggered: significant combined exposure even without single high-risk flag.
  if (triggeredRegimes.length >= 4) return "medium";

  // EU exposure with any customer-facing deployment.
  if (slots.eu_exposure === "yes" && slots.customer_facing === "yes") return "medium";

  // ── Low risk ──────────────────────────────────────────────────────────────
  return "low";
}
