export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  return res.json({ ok: true, botUrl: 'https://t.me/MochiTv_bot' });
}