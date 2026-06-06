/**
 * /api/contact
 *
 * Receives a name and email from the results page contact form.
 * Sends a notification email to Alistair via Resend.
 *
 * POST body: { name: string, email: string }
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Valar Audit <onboarding@resend.dev>",
        to: "alistair@mawdsleyadvisory.com",
        subject: `New call request from ${name}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>This person completed the Valar Audit assessment and requested a 30-minute call to discuss their findings and receive their PDF report.</p>
        `,
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
