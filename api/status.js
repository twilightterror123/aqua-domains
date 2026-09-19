export default async function handler(req, res) {
  const configured = Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
  res.status(200).json({
    ok: true,
    vercelConfigured: configured,
    message: configured
      ? "Vercel-Verbindung ist konfiguriert."
      : "Vercel-Verbindung fehlt noch."
  });
}
