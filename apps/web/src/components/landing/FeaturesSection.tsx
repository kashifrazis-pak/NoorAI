const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Citation-verified',
    desc: 'Every claim is matched against our database before being shown to you. The AI cannot return a reference that does not exist.',
    accent: 'bg-sage-50 border-sage-200 text-sage-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
    title: 'Sahih & Hasan only',
    desc: 'Weak (daif) and fabricated (mawdu) hadith are stored but never surfaced. Only authentic narrations reach your screen.',
    accent: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
      </svg>
    ),
    title: '5 languages',
    desc: 'Ask in English, Arabic, Urdu, French or Turkish. Quran translations are available in all five languages.',
    accent: 'bg-blue-50 border-blue-200 text-blue-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    title: 'Scholar-reviewed',
    desc: 'Flagged answers go to a panel of qualified Islamic scholars. Random audits run quarterly to maintain accuracy.',
    accent: 'bg-amber-50 border-amber-200 text-amber-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: 'Instant answers',
    desc: 'Semantic vector search retrieves the most relevant Quran verses and hadith in under a second before the AI composes a response.',
    accent: 'bg-purple-50 border-purple-200 text-purple-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
    title: 'Private & secure',
    desc: 'Your questions are not sold or shared. JWT-authenticated sessions and end-to-end HTTPS keep your searches private.',
    accent: 'bg-rose-50 border-rose-200 text-rose-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-sage-500 uppercase tracking-widest
                           bg-sage-50 border border-sage-200 px-4 py-1.5 rounded-full mb-4">
            Why NoorAI
          </span>
          <h2 className="text-4xl font-bold text-sage-950 mb-4 tracking-tight">
            Built for trust, not just speed
          </h2>
          <p className="text-sage-500 text-lg max-w-xl mx-auto leading-relaxed">
            Most AI tools confabulate sources. NoorAI is engineered from the ground up
            so every answer is verifiable and grounded.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc, accent }) => (
            <div key={title}
              className="group rounded-2xl border border-sage-100 bg-white p-6
                         hover:border-sage-200 hover:shadow-card transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${accent}`}>
                {icon}
              </div>
              <h3 className="text-base font-semibold text-sage-900 mb-2">{title}</h3>
              <p className="text-sage-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
