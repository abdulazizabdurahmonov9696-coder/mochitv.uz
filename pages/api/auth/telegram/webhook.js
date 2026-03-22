import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role key (maxfiy!)
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;
  if (!message) return res.status(200).json({ ok: true });

  const { from, text } = message;
  if (!from || text !== '/start') return res.status(200).json({ ok: true });

  // Eski kodlarni o'chir
  await supabase
    .from('telegram_auth_codes')
    .delete()
    .eq('telegram_id', String(from.id));

  // Yangi 5 xonali kod
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

  await supabase.from('telegram_auth_codes').insert([{
    code,
    telegram_id: String(from.id),
    telegram_data: {
      id: from.id,
      first_name: from.first_name || '',
      last_name: from.last_name || '',
      username: from.username || '',
      photo_url: null,
    },
    expires_at: expiresAt.toISOString(),
  }]);

  await sendMessage(from.id,
    `🔐 <b>MochiTV kirish kodi:</b>\n\n` +
    `<code>${code}</code>\n\n` +
    `⏳ Kod <b>10 daqiqa</b> amal qiladi.\n` +
    `Saytga kirib ushbu kodni kiriting.`
  );

  return res.status(200).json({ ok: true });
}

// Next.js body parser o'chirish SHART
export const config = {
  api: { bodyParser: true },
};