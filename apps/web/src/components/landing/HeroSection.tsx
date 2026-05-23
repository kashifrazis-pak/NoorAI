import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-sage-950">

      {/* Geometric Islamic pattern background */}
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              {/* 8-pointed star tile */}
              <polygon points="40,5 47,28 70,28 51,43 58,68 40,53 22,68 29,43 10,28 33,28"
                fill="none" stroke="#40915f" strokeWidth="0.8"/>
              <rect x="20" y="20" width="40" height="40" fill="none" stroke="#40915f" strokeWidth="0.4"
                transform="rotate(45 40 40)"/>
              <circle cx="40" cy="40" r="6" fill="none" stroke="#40915f" strokeWidth="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)"/>
        </svg>
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(64,145,95,0.18),transparent)]" aria-hidden/>

      {/* Content */}
      <div className="relative z-10 text-center px-5 max-w-4xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sage-900/60 border border-sage-700/60
                        text-sage-300 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
          Grounded in Quran &amp; authentic Sunnah · No hallucinated citations
        </div>

        {/* Logo + Arabic name */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <Logo size={64} />
        </div>

        {/* Arabic title */}
        <p className="text-sage-400 font-arabic text-2xl mb-4" dir="rtl">نور الإسلام</p>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-6">
          Islamic answers you{' '}
          <span className="text-sage-400">can trust</span>
        </h1>

        <p className="text-sage-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          Ask any Islamic question. NoorAI searches 6,236 Quran verses and 40,000+ authentic hadith,
          then returns a verified, cited answer — no guessing, no fabrication.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app/ask"
            className="w-full sm:w-auto bg-sage-500 hover:bg-sage-400 text-white font-semibold
                       text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl
                       transition-all duration-200 hover:-translate-y-0.5">
            Ask a question — it&apos;s free
          </Link>
          <a href="#how-it-works"
            className="w-full sm:w-auto border border-sage-700 hover:border-sage-500 text-sage-300
                       hover:text-white font-medium text-base px-8 py-4 rounded-2xl
                       transition-all duration-200 backdrop-blur-sm">
            See how it works
          </a>
        </div>

        {/* Trust line */}
        <p className="text-sage-500 text-sm mt-8">
          Sahih Bukhari · Sahih Muslim · Abu Dawud · Tirmidhi · Nasai · Ibn Majah · Malik · Ahmad
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce text-sage-500">
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M8 3a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L7 9.586V4a1 1 0 011-1z"/>
        </svg>
      </div>
    </section>
  );
}
