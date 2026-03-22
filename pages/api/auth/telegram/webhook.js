import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const d = await r.json();
    if (!d.ok) console.error('sendMessage xato:', d);
  } catch (err) {
    console.error('sendMessage exception:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const body = req.body;
    const updateId = body?.update_id;

    // ✅ 1. update_id bazada bormi? (duplicate bloklash)
    if (updateId) {
      const { error: dupInsertError } = await supabase
        .from('telegram_processed_updates')
        .insert([{ update_id: updateId }]);

      if (dupInsertError) {
        // PRIMARY KEY conflict — bu update allaqachon qayta ishlangan
        console.log('Duplicate update_id, skip:', updateId);
        return res.status(200).json({ ok: true });
      }

      // Eski updatelarni tozalash (1000 dan oshsa)
      supabase
        .from('telegram_processed_updates')
        .delete()
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .then(() => {});
    }

    // 2. Message bormi?
    if (!body?.message?.from) {
      return res.status(200).json({ ok: true });
    }

    const { from, text } = body.message;

    if (!from?.id) {
      return res.status(200).json({ ok: true });
    }

    // 3. Faqat /start ga javob
    if (!text || !text.startsWith('/start')) {
      await sendMessage(from.id, '👋 Saytga kirish uchun /start bosing.');
      return res.status(200).json({ ok: true });
    }

    const telegramId = String(from.id);

    // 4. 30 soniya ichida kod yuborilganmi?
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentCode } = await supabase
      .from('telegram_auth_codes')
      .select('created_at, code')
      .eq('telegram_id', telegramId)
      .eq('used', false)
      .gt('created_at', thirtySecondsAgo)
      .maybeSingle();

    if (recentCode) {
      await sendMessage(
        from.id,
        `⏳ Kod allaqachon yuborilgan!\n\n` +
        `<code>${recentCode.code}</code>\n\n` +
        `📱 Saytga kirib ushbu kodni kiriting.\n` +
        `30 soniyadan keyin yangi kod olishingiz mumkin.`
      );
      return res.status(200).json({ ok: true });
    }

    // 5. Eski kodlarni o'chirish
    await supabase
      .from('telegram_auth_codes')
      .delete()
      .eq('telegram_id', telegramId);

    // 6. Yangi 5 xonali kod
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const telegramData = {
      id: from.id,
      first_name: from.first_name || '',
      last_name: from.last_name || '',
      username: from.username || '',
      photo_url: null,
    };

    // 7. Kodni saqlash
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
      return res.status(200).json({ ok: true });
    }

    // 8. Kodni yuborish
    await sendMessage(
      from.id,
      `🎌 <b>MochiTV</b> ga xush kelibsiz!\n\n` +
      `🔐 Sizning kirish kodingiz:\n\n` +
      `<code>${code}</code>\n\n` +
      `⏳ Kod <b>10 daqiqa</b> ichida amal qiladi.\n\n` +
      `📱 Saytga qaytib ushbu kodni kiriting.`
    );

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Webhook umumiy xato:', err);
    return res.status(200).json({ ok: true });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};