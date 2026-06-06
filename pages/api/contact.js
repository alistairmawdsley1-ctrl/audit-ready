/**
 * /api/contact
 *
 * Receives name, email, and assessment data from the results page.
 * Sends a notification email to Alistair via Resend with full assessment details.
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, slots, results } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const riskLevel = results?.riskLevel || "unknown";
  const regimes = results?.regimes || [];
  const regimeList = regimes.map(r => `<li><strong>${r.id?.toUpperCase()}</strong>: ${r.trigger_reason || ""}</li>`).join("");

  const slotRows = slots
    ? Object.entries(slots)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px;">${k}</td><td style="padding:4px 0;font-size:13px;">${Array.isArray(v) ? v.join(", ") : v}</td></tr>`)
        .join("")
    : "";

  const html = `
    <h2 style="font-family:sans-serif;">New call request — Valar Audit</h2>
    <p style="font-family:sans-serif;"><strong>Name:</strong> ${name}<br><strong>Email:</strong> ${email}</p>

    <h3 style="font-family:sans-serif;margin-top:24px;">Assessment summary</h3>
    <p style="font-family:sans-serif;"><strong>Risk level:</strong> ${riskLevel}</p>
    <p style="font-family:sans-serif;"><strong>Regimes triggered (${regimes.length}):</strong></p>
    <ul style="font-family:sans-serif;">${regimeList}</ul>

    <h3 style="font-family:sans-serif;margin-top:24px;">Slot data</h3>
    <table style="font-family:sans-serif;border-collapse:collapse;">
      ${slotRows}
    </table>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Valar Audit <hello@valaraudit.com>",
        to: "alistair@mawdsleyadvisory.com",
        subject: `New call request from ${name} — ${riskLevel} risk`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
