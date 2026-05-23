const COLLECTIONS = [
  { name: 'Sahih al-Bukhari', count: '~7,563', grade: 'Sahih' },
  { name: 'Sahih Muslim',     count: '~7,453', grade: 'Sahih' },
  { name: 'Sunan Abu Dawud',  count: '~5,274', grade: 'Sahih / Hasan' },
  { name: 'Jami al-Tirmidhi', count: '~3,956', grade: 'Sahih / Hasan' },
  { name: 'Sunan al-Nasai',   count: '~5,761', grade: 'Sahih / Hasan' },
  { name: 'Sunan Ibn Majah',  count: '~4,341', grade: 'Sahih / Hasan' },
  { name: 'Muwatta Malik',    count: '~1,852', grade: 'Sahih / Hasan' },
  { name: 'Musnad Ahmad',     count: '~27,647', grade: 'Sahih / Hasan' },
];

export function SourcesSection() {
  return (
    <section id="sources" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div>
            <span className="inline-block text-xs font-semibold text-sage-500 uppercase tracking-widest
                             bg-sage-50 border border-sage-200 px-4 py-1.5 rounded-full mb-6">
              Our sources
            </span>
            <h2 className="text-4xl font-bold text-sage-950 mb-6 tracking-tight leading-snug">
              Every answer traced back to primary sources
            </h2>
            <p className="text-sage-500 text-base leading-relaxed mb-8">
              NoorAI does not summarise secondary articles or blog posts.
              It searches directly against 114 Surahs of the Quran and eight major
              hadith collections — all graded by classical Islamic scholars.
            </p>

            {/* Quran badge */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-sage-50 border border-sage-200 mb-4">
              <span className="text-3xl">📖</span>
              <div>
                <p className="font-semibold text-sage-900 mb-1">The Holy Quran</p>
                <p className="text-sm text-sage-500">
                  All 114 surahs · 6,236 ayat · 4 translations (EN, AR, UR, FR, TR) ·
                  Source: quran.com API
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-3xl">📜</span>
              <div>
                <p className="font-semibold text-sage-900 mb-1">Authentic Hadith</p>
                <p className="text-sm text-sage-500">
                  40,000+ hadith across 8 collections · Sahih &amp; Hasan grades only ·
                  Daif/mawdu stored but never surfaced
                </p>
              </div>
            </div>
          </div>

          {/* Right: collection table */}
          <div className="rounded-2xl border border-sage-100 overflow-hidden shadow-card">
            <div className="bg-sage-50 px-5 py-4 border-b border-sage-100">
              <p className="text-xs font-semibold text-sage-500 uppercase tracking-widest">
                Hadith Collections
              </p>
            </div>
            <div className="divide-y divide-sage-50">
              {COLLECTIONS.map(({ name, count, grade }) => (
                <div key={name} className="flex items-center justify-between px-5 py-3.5 hover:bg-sage-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-sage-800">{name}</p>
                    <p className="text-[11px] text-sage-400">{count} narrations</p>
                  </div>
                  <span className="text-[10px] font-semibold text-sage-600 bg-sage-100
                                   border border-sage-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
