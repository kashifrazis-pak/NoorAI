const STEPS = [
  {
    number: '01',
    title: 'Ask naturally',
    desc: 'Type your question in plain language — in English, Arabic, Urdu, French, or Turkish. No special syntax required.',
    visual: (
      <div className="bg-white rounded-2xl border border-sage-200 shadow-card p-4">
        <div className="text-xs text-sage-400 mb-2 font-medium">Your question</div>
        <p className="text-sage-700 text-sm leading-relaxed italic">
          &ldquo;What does Islam say about being kind to neighbours?&rdquo;
        </p>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-sage-100">
          <div className="text-xs text-sage-300">English</div>
          <div className="ml-auto w-7 h-7 rounded-lg bg-sage-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <path d="M1.5 1.5l13 6.5-13 6.5V9.5l9-3-9-3V1.5z"/>
            </svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'AI retrieves & reasons',
    desc: 'Vector search finds the most semantically relevant Quran verses and authentic hadith. Claude then composes a grounded answer using only those sources.',
    visual: (
      <div className="space-y-2">
        {['Quran 49:10 — Al-Hujurat', 'Sahih Muslim 2625', 'Sahih Bukhari 6016'].map((src, i) => (
          <div key={src} className="bg-white rounded-xl border border-sage-200 px-4 py-2.5 flex items-center gap-3 shadow-soft">
            <div className="w-5 h-5 rounded-full bg-sage-100 text-sage-600 text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <span className="text-xs font-medium text-sage-700">{src}</span>
            <span className="ml-auto text-[10px] text-sage-400">matched</span>
          </div>
        ))}
        <div className="text-center text-[10px] text-sage-400 pt-1">Retrieving top sources…</div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Verified answer returned',
    desc: 'Every citation is cross-checked against the database before delivery. If a reference doesn\'t exist, the answer is rejected and retried — not shown to you.',
    visual: (
      <div className="bg-white rounded-2xl border border-sage-200 shadow-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sage-400" />
          <span className="text-[10px] font-semibold text-sage-500 uppercase tracking-widest">Verified answer</span>
        </div>
        <p className="text-sm text-sage-700 leading-relaxed">
          Islam places great emphasis on neighbourly kindness. The Prophet ﷺ said…
        </p>
        <div className="bg-sage-50 border border-sage-100 rounded-xl p-3 text-xs text-sage-600">
          <span className="font-semibold">Sahih Bukhari 6016</span> · Grade: Sahih ✓
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-cream-100">
      <div className="max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-sage-500 uppercase tracking-widest
                           bg-white border border-sage-200 px-4 py-1.5 rounded-full mb-4">
            How it works
          </span>
          <h2 className="text-4xl font-bold text-sage-950 mb-4 tracking-tight">
            Answer in three steps
          </h2>
          <p className="text-sage-500 text-lg max-w-xl mx-auto">
            From question to verified, cited answer in seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {STEPS.map(({ number, title, desc, visual }, idx) => (
            <div key={number} className="relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 border-t-2 border-dashed border-sage-200 z-10" />
              )}

              <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-soft h-full flex flex-col gap-5">
                {/* Number */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-sage-100 leading-none select-none">{number}</span>
                  <h3 className="text-lg font-bold text-sage-900">{title}</h3>
                </div>

                {/* Visual mockup */}
                <div className="flex-1">
                  {visual}
                </div>

                {/* Description */}
                <p className="text-sm text-sage-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
