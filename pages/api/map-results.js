/**
 * /api/map-results
 *
 * Deterministic mapping of filled assessment slots to regulatory regimes.
 * No AI involved. Output is sourced entirely from citations.json and mapper.js.
 *
 * POST body:  { slots: { ... } }
 * Response:   { riskLevel, regimes, slots, mhraAdvisory, mentalHealthEuFlag }
 */

import citations from "../../lib/citations.json";
import { mapSlotsToRegimes, calculateRiskLevel } from "../../lib/mapper.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slots } = req.body;

  if (!slots || typeof slots !== "object") {
    return res.status(400).json({ error: "slots object is required" });
  }

  try {
    const { regimes, mhraAdvisory, mentalHealthEuFlag } = mapSlotsToRegimes(slots, citations);
    const riskLevel = calculateRiskLevel(slots, regimes);

    return res.status(200).json({ riskLevel, regimes, slots, mhraAdvisory, mentalHealthEuFlag });
  } catch (error) {
    console.error("Mapping error:", error?.message ?? error);
    return res.status(500).json({ error: "Failed to generate results. Please try again." });
  }
}
