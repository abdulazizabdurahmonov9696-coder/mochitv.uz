// pages/api/auth/telegram/verify.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service key - hamma narsaga ruxsat
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;

  if (!code || String(code).trim().length !== 5) {
    return res.status(400).json({ ok: false, message: "Kod noto'g'ri formatda" });
  }

  // 1. Kodni tekshirish
  const { data: codeData, error: codeError } = await supabase
    .from('telegram_auth_codes')
    .select('*')
    .eq('code', String(code).trim())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (codeError || !codeData) {
    return res.status(400).json({ 
      ok: false, 
      message: "Kod noto'g'ri yoki muddati o'tgan" 
    });
  }

  const tg = codeData.telegram_data;

  // 2. Kodni ishlatilgan deb belgilash
  await supabase
    .from('telegram_auth_codes')
    .update({ used: true })
    .eq('id', codeData.id);

  // 3. User mavjudmi tekshirish
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', String(tg.id))
    .maybeSingle();

  let finalUser = existingUser;

  // 4. Yangi user yaratish
  if (!existingUser) {
    const cleanBase = (tg.username || tg.first_name || 'tguser')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10) || 'tguser';

    // Username band emasmi?
    const { data: sameUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanBase)
      .maybeSingle();

    const finalUsername = sameUsername
      ? (cleanBase.substring(0, 7) + String(tg.id).slice(-3)).substring(0, 10)
      : cleanBase;

    const fullName = `${tg.first_name || ''} ${tg.last_name || ''}`.trim() || finalUsername;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        username: finalUsername,
        password: `telegram_${tg.id}`,
        provider: 'telegram',
        telegram_id: String(tg.id),
        telegram_username: tg.username || null,
        full_name: fullName,
        avatar_url: tg.photo_url || null,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return res.status(500).json({ 
        ok: false, 
        message: "Foydalanuvchi yaratishda xato" 
      });
    }

    finalUser = newUser;

  } else {
    // 5. Mavjud userni yangilash
    const fullName = `${tg.first_name || ''} ${tg.last_name || ''}`.trim();

    const { data: updatedUser } = await supabase
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

    finalUser = updatedUser || existingUser;
  }

  return res.status(200).json({ ok: true, user: finalUser });
}