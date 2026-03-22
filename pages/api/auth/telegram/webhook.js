// pages/api/auth/telegram/webhook.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('sendMessage xato:', err);
  }
}

async function processUpdate(from, text) {
  const telegramId = String(from.id);

  if (!text || !text.startsWith('/start')) {
    await sendMessage(from.id, '👋 Saytga kirish uchun /start bosing.');
    return;
  }

  // ✅ 30 soniya ichida kod yuborilganmi — tekshir (spam bloklash)
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
  const { data: recentCode } = await supabase
    .from('telegram_auth_codes')
    .select('created_at')
    .eq('telegram_id', telegramId)
    .eq('used', false)
    .gt('created_at', thirtySecondsAgo)
    .maybeSingle();

  if (recentCode) {
    // 30 soniya o'tmagan — yangi kod yubormaymiz
    await sendMessage(
      from.id,
      '⏳ Kod allaqachon yuborilgan. Iltimos 30 soniya kuting yoki saytga kiring.'
    );
    return;
  }

  // Eski kodlarni o'chirish
  await supabase
    .from('telegram_auth_codes')
    .delete()
    .eq('telegram_id', telegramId);

  // Yangi kod
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const telegramData = {
    id: from.id,
    first_name: from.first_name || '',
    last_name: from.last_name || '',
    username: from.username || '',
    photo_url: null,
  };

  const { error: insertError } = await supabase
    .from('telegram_auth_codes')
    .insert([{
      code,
      telegram_id: telegramId,
      telegram_data: telegramData,
      expires_at: expiresAt,
      used: false,
    }]);

  if (insertError) {
    console.error('Insert error:', insertError);
    await sendMessage(from.id, '❌ Xatolik yuz berdi. Qayta /start bosing.');
    return;
  }

  await sendMessage(
    from.id,
    `🎌 <b>MochiTV</b> ga xush kelibsiz!\n\n` +
    `🔐 Sizning kirish kodingiz:\n\n` +
    `<code>${code}</code>\n\n` +
    `⏳ Kod <b>10 daqiqa</b> ichida amal qiladi.\n\n` +
    `📱 Saytga qaytib ushbu kodni kiriting.`
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  // ✅ DARHOL 200 qaytaramiz — Telegram qayta urinmaydi
  res.status(200).json({ ok: true });

  try {
    const body = req.body;
    if (!body?.message?.from) return;

    const { from, text } = body.message;
    if (!from?.id) return;

    await processUpdate(from, text || '');
  } catch (err) {
    console.error('Webhook xato:', err);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
