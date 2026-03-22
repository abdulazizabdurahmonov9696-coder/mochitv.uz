// pages/api/auth/telegram/verify.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    // 1. Kodni validate qilish
    if (!code || String(code).trim().length !== 5) {
      return res.status(400).json({ ok: false, message: "Kod 5 xonali bo'lishi kerak" });
    }

    const cleanCode = String(code).trim();

    // 2. Kodni bazadan topish
    const { data: codeData, error: fetchError } = await supabase
      .from('telegram_auth_codes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ ok: false, message: 'Serverda xatolik yuz berdi' });
    }

    // 3. Kod topildimi?
    if (!codeData) {
      return res.status(400).json({ ok: false, message: "Kod noto'g'ri. Botdan yangi kod oling" });
    }

    // 4. Ishlatilganmi?
    if (codeData.used) {
      return res.status(400).json({ ok: false, message: 'Bu kod allaqachon ishlatilgan. Yangi kod oling' });
    }

    // 5. Muddati o'tganmi?
    if (new Date() > new Date(codeData.expires_at)) {
      return res.status(400).json({ ok: false, message: "Kod muddati o'tgan. Botdan yangi kod oling" });
    }

    // 6. Kodni ishlatilgan deb belgilash
    await supabase
      .from('telegram_auth_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    const tg = codeData.telegram_data;
    const telegramId = String(tg.id);

    // 7. User mavjudmi?
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (userFetchError) {
      console.error('User fetch error:', userFetchError);
      return res.status(500).json({ ok: false, message: 'Foydalanuvchi tekshirishda xato' });
    }

    let finalUser = null;

    if (existingUser) {
      // 8. Mavjud userni yangilash
      const fullName = `${tg.first_name || ''} ${tg.last_name || ''}`.trim();

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName || existingUser.full_name,
          avatar_url: tg.photo_url || existingUser.avatar_url || null,
          telegram_username: tg.username || existingUser.telegram_username || null,
          provider: 'telegram',
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        // Update xato bo'lsa ham eski userni qaytaramiz
        finalUser = existingUser;
      } else {
        finalUser = updatedUser;
      }

    } else {
      // 9. Yangi user yaratish
      const rawName = tg.username || tg.first_name || 'tguser';
      const cleanBase = rawName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 10) || 'tguser';

      // Username band emasmi?
      const { data: takenUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', cleanBase)
        .maybeSingle();

      const finalUsername = takenUsername
        ? (cleanBase.substring(0, 7) + telegramId.slice(-3)).substring(0, 10)
        : cleanBase;

      const fullName = `${tg.first_name || ''} ${tg.last_name || ''}`.trim() || finalUsername;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          username: finalUsername,
          password: `telegram_${telegramId}`,
          provider: 'telegram',
          telegram_id: telegramId,
          telegram_username: tg.username || null,
          full_name: fullName,
          avatar_url: tg.photo_url || null,
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({
          ok: false,
          message: 'Foydalanuvchi yaratishda xato: ' + insertError.message,
        });
      }

      finalUser = newUser;
    }

    // 10. Muvaffaqiyat
    return res.status(200).json({ ok: true, user: finalUser });

  } catch (err) {
    console.error('Verify umumiy xato:', err);
    return res.status(500).json({ ok: false, message: 'Serverda kutilmagan xato yuz berdi' });
  }
}