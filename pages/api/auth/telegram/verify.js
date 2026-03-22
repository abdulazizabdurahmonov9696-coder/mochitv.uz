import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;

  if (!code || String(code).trim().length !== 5) {
    return res.status(400).json({ ok: false, message: "Kod noto'g'ri formatda" });
  }

  const { data, error } = await supabase
    .from('telegram_auth_codes')
    .select('*')
    .eq('code', String(code).trim())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return res.status(400).json({ ok: false, message: "Kod noto'g'ri yoki muddati o'tgan" });
  }

  // Kodni ishlatilgan deb belgilaymiz
  await supabase
    .from('telegram_auth_codes')
    .update({ used: true })
    .eq('id', data.id);

  return res.status(200).json({ ok: true, telegram: data.telegram_data });
}