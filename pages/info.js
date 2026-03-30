import { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { LuInstagram } from 'react-icons/lu';

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState('about');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const sections = {
    about: {
      title: 'Biz Haqimizda',
      content:
        "MochiTV — eng zo'r tarjima qilingan animelarni tomosha qilish uchun mo'ljallangan platforma. Biz har kuni yangi, sifatli va qiziqarli animelar qo'shib boramiz."
    },
    contact: {
      title: 'Aloqa',
      content:
        "Agar sizda savollar yoki takliflar bo'lsa, bizga quyidagi yo'llar bilan bog'lanishingiz mumkin:\n\n📞 Telegram: @mochitv_uz\n📸 Instagram: @mochitv_uz"
    },
    report: {
      title: 'Muammo Xabar Qilish',
      content:
        "Agar siz har qanday texnik muammo yoki noto'g'ri kontent topsangiz, iltimos biz bilan bog'laning. Sizning xabaringiz biz uchun juda muhim va biz tez orada javob beramiz."
    },
    terms: {
      title: 'Shartlar va Qoidalar',
      content:
        "MochiTV platformasidan foydalanish uchun quyidagi shartlarni qabul qilishingiz lozim:\n\n• Platforma faqat 13 yoshdan katta foydalanuvchilar uchun mo'ljallangan\n• Kontentni faqat shaxsiy maqsadda ko'rishingiz mumkin\n• Kontentni nusxalash yoki tarqatish qat'iyan taqiqlanadi\n• MochiTV har qanday vaqtda shartlarni o'zgartirish huquqini o'zida saqlab qoladi"
    }
  };

  const faqs = [
    {
      id: 1,
      question: "MochiTV nima?",
      answer:
        "MochiTV — tarjima qilingan animelarni onlayn tomosha qilish uchun mo'ljallangan platforma. Biz turli janr va turli tillarida animelar taklif qilamiz."
    },
    {
      id: 2,
      question: "Qanday ro'yxatdan o'tish kerak?",
      answer:
        "MochiTV platformasidan foydalanish uchun ro'yxatdan o'tishingiz kerak. Bu bepul va juda oddiy — faqat username va parolingizni kiriting."
    },
    {
      id: 3,
      question: "Hisobim bloklandi. Nima qilish kerak?",
      answer:
        "Agar sizning hisobingiz bloklangan bo'lsa, tezda bizga murojaat qiling. Biz hisobingizni qayta tiklashga yordam beramiz."
    },
    {
      id: 4,
      question: "Animelar doim mavjud bo'ladimi?",
      answer:
        "Ha, MochiTV-dagi barcha animelar 24/7 mavjud. Siz istalgan vaqtda tomosha qilishingiz mumkin."
    },
    {
      id: 5,
      question: "Saralanganlar qanday saqlanadi?",
      answer:
        "Saralanganlar ro'yxatiga qo'shgan animelaringiz hisobingizda saqlanadi. Siz ularni istalgan vaqtda ko'rishingiz yoki o'chirishingiz mumkin."
    },
    {
      id: 6,
      question: "MochiTV telefondan ham ishlatish mumkinmi?",
      answer:
        "Ha, MochiTV platforma mobil qurilmalar uchun optimallashtirilgan. Siz telefon yoki planshetdan osongina foydalanishingiz mumkin."
    }
  ];

  const toggleFaq = (id) => setExpandedFaq(expandedFaq === id ? null : id);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }

        :root {
          --bg:           #0d0d0f;
          --bg2:          #141416;
          --bg3:          #1a1a1e;
          --surface:      rgba(255,255,255,0.04);
          --surface2:     rgba(255,255,255,0.07);
          --border:       rgba(255,255,255,0.08);
          --border2:      rgba(255,255,255,0.14);
          --accent:       #ef4444;
          --accent2:      #f87171;
          --accent-glow:  rgba(239,68,68,0.25);
          --text:         #f0f0f2;
          --text2:        rgba(240,240,242,0.65);
          --text3:        rgba(240,240,242,0.35);
          --radius:       14px;
          --radius-sm:    8px;
          --radius-lg:    20px;
          --shadow:       0 8px 32px rgba(0,0,0,0.5);
          --shadow-lg:    0 24px 60px rgba(0,0,0,0.6);
        }

        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.4); border-radius: 99px; }

        /* ── HEADER ── */
        .info-header {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 60px; height: 78px;
          background: rgba(13,13,15,0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border2);
        }
        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1px solid var(--border2);
          color: var(--text2); padding: 9px 18px; border-radius: var(--radius-sm);
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .back-btn:hover { color: var(--text); border-color: var(--accent); background: rgba(239,68,68,0.06); }
        .header-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px; font-weight: 800; color: var(--text);
          letter-spacing: -0.01em;
        }
        .header-spacer { width: 110px; }

        /* ── LAYOUT ── */
        .info-main { max-width: 900px; margin: 0 auto; padding: 44px 24px 80px; }

        /* ── TABS ── */
        .tabs-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 32px;
        }
        .tab-btn {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); padding: 12px 10px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; font-family: 'Outfit', sans-serif; text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tab-btn:hover { color: var(--text); border-color: var(--border2); background: var(--surface2); }
        .tab-btn.active {
          background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.45);
          color: var(--accent2);
        }

        /* ── CARD ── */
        .info-card {
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: var(--radius-lg); padding: 32px; margin-bottom: 24px;
        }
        .card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 800; color: var(--text);
          margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.01em;
        }
        .card-title::before {
          content: '';
          display: block; width: 4px; height: 22px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 99px; flex-shrink: 0;
        }
        .card-body {
          font-size: 15px; line-height: 1.8; color: var(--text2);
          white-space: pre-wrap;
        }

        /* ── FAQ ── */
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: var(--radius-sm); overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open { border-color: rgba(239,68,68,0.3); }
        .faq-q {
          width: 100%; background: transparent; border: none;
          padding: 16px 18px; display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text);
          text-align: left; gap: 12px; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .faq-q:hover { color: var(--accent2); }
        .faq-chevron { color: var(--text3); flex-shrink: 0; transition: transform 0.3s, color 0.2s; }
        .faq-item.open .faq-chevron { transform: rotate(180deg); color: var(--accent); }
        .faq-a {
          border-top: 1px solid var(--border);
          padding: 14px 18px;
          font-size: 14px; line-height: 1.7; color: var(--text2);
          background: rgba(239,68,68,0.03);
        }

        /* ── SOCIALS ── */
        .socials-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
        .social-link {
          display: flex; align-items: center; gap: 10px;
          background: var(--surface); border: 1px solid var(--border2);
          color: var(--text2); padding: 10px 20px; border-radius: var(--radius-sm);
          text-decoration: none; font-size: 14px; font-weight: 600;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .social-link:hover { color: var(--text); border-color: var(--accent); background: rgba(239,68,68,0.06); }

        /* ── FOOTER ── */
        .info-footer {
          text-align: center; padding-top: 32px;
          border-top: 1px solid var(--border);
          color: var(--text3); font-size: 13px;
        }
        .info-footer span { color: var(--accent); font-weight: 700; font-family: 'Outfit', sans-serif; }

        /* ── BG NOISE ── */
        .bg-noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.6;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .info-header { padding: 0 16px; }
          .header-spacer { display: none; }
          .tabs-grid { grid-template-columns: repeat(2,1fr); }
          .info-main { padding: 28px 16px 80px; }
          .info-card { padding: 22px 18px; }
        }
        @media (max-width: 400px) {
          .tabs-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="bg-noise" />

      {/* Header */}
      <header className="info-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={16} />
          Orqaga
        </button>
        <div className="header-title">MochiTV — Ma'lumot</div>
        <div className="header-spacer" />
      </header>

      {/* Main */}
      <main className="info-main">

        {/* Tabs */}
        <div className="tabs-grid">
          {Object.keys(sections).map(key => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {sections[key].title}
            </button>
          ))}
        </div>

        {/* Active section content */}
        <div className="info-card">
          <div className="card-title">{sections[activeTab].title}</div>
          <p className="card-body">{sections[activeTab].content}</p>

          {/* Show socials in contact tab */}
          {activeTab === 'contact' && (
            <div className="socials-row" style={{ marginTop: 20 }}>
              <a
                className="social-link"
                href="https://t.me/MochitvUz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegramPlane size={16} /> Telegram
              </a>
              <a
                className="social-link"
                href="https://instagram.com/mochitv_uz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuInstagram size={16} /> Instagram
              </a>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="info-card">
          <div className="card-title">Tez-tez So'raladigan Savollar</div>
          <div className="faq-list">
            {faqs.map(faq => (
              <div
                key={faq.id}
                className={`faq-item ${expandedFaq === faq.id ? 'open' : ''}`}
              >
                <button className="faq-q" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  <ChevronDown size={18} className="faq-chevron" />
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-a">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="info-footer">
          © 2026 <span>MochiTV</span>. Barcha huquqlar himoyalangan.
        </div>

      </main>
    </>
  );
}