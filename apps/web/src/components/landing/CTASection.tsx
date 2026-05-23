import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function CTASection() {
  return (
    <section className="py-24 bg-sage-950 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.05]" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,3 35,20 52,20 39,31 44,50 30,39 16,50 21,31 8,20 25,20"
                fill="none" stroke="#40915f" strokeWidth="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo2)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
        <div className="flex justify-center mb-6">
          <Logo size={52} />
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-snug">
          Seek knowledge with <span className="text-sage-400">confidence</span>
        </h2>
        <p className="text-sage-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of Muslims getting authentic, verified answers
          grounded in the Quran and Sunnah.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app/ask"
            className="w-full sm:w-auto bg-sage-500 hover:bg-sage-400 text-white font-semibold
                       text-base px-8 py-4 rounded-2xl transition-all duration-150
                       hover:-translate-y-0.5 hover:shadow-lg">
            Ask your first question — free
          </Link>
          <Link href="/app/about"
            className="w-full sm:w-auto border border-sage-700 hover:border-sage-500 text-sage-400
                       hover:text-white font-medium text-base px-8 py-4 rounded-2xl transition-all">
            Read about our sources
          </Link>
        </div>
      </div>
    </section>
  );
}
