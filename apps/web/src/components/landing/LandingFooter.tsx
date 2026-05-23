import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const LINKS = {
  Product: [
    { label: 'Ask a question', href: '/app/ask' },
    { label: 'Search', href: '/app/search' },
    { label: 'Saved answers', href: '/app/saved' },
    { label: 'Daily reminder', href: '/app/ask' },
  ],
  Learn: [
    { label: 'About our sources', href: '/app/about' },
    { label: 'Hadith grading', href: '/app/about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ],
  Collections: [
    { label: 'Sahih al-Bukhari', href: '/app/search?q=bukhari' },
    { label: 'Sahih Muslim', href: '/app/search?q=muslim' },
    { label: 'Sunan Abu Dawud', href: '/app/search?q=abudawud' },
    { label: 'Jami al-Tirmidhi', href: '/app/search?q=tirmidhi' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-sage-950 border-t border-sage-800/50">
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/home" className="flex items-center gap-2.5 mb-4 group">
              <Logo size={30} />
              <span className="text-base font-bold text-white">NoorAI</span>
            </Link>
            <p className="text-sage-500 text-sm leading-relaxed mb-4">
              AI-powered Islamic Q&amp;A grounded exclusively in the Quran and authentic Sunnah.
            </p>
            <p className="text-sage-600 text-xs font-arabic" dir="rtl">
              ﴿ وَقُل رَّبِّ زِدۡنِي عِلۡمٗا ﴾
            </p>
            <p className="text-sage-600 text-[10px] mt-1">
              "My Lord, increase me in knowledge." — Quran 20:114
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-sage-400 uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-sage-500 hover:text-sage-300 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sage-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sage-600">
          <p>© {new Date().getFullYear()} NoorAI. Educational use only — not a fatwa service.</p>
          <p>Always consult a qualified Islamic scholar for personal religious decisions.</p>
        </div>
      </div>
    </footer>
  );
}
