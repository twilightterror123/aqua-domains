export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return res.status(503).json({
      error: "AQUA ist noch nicht mit Vercel verbunden.",
      setup: "Setze VERCEL_TOKEN und VERCEL_PROJECT_ID als Vercel Environment Variables."
    });
  }

  const { domain } = req.body || {};
  if (!domain || typeof domain !== "string") {
    return res.status(400).json({ error: "domain fehlt" });
  }

  const normalized = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(normalized)) {
    return res.status(400).json({ error: "Ungültige Domain" });
  }

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const response = await fetch(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/domains${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: normalized })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return res.status(response.status).json({
      error: data?.error?.message || data?.message || "Vercel konnte die Domain nicht hinzufügen.",
      details: data
    });
  }

  return res.status(200).json({
    ok: true,
    domain: normalized,
    verified: Boolean(data.verified),
    verification: data.verification || [],
    message: data.verified
      ? "Subdomain ist mit dem Vercel-Projekt verbunden."
      : "Domain wurde hinzugefügt. DNS/Verifizierung muss noch abgeschlossen werden."
  });
}
