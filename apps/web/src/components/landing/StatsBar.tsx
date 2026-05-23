const STATS = [
  { value: '6,236',  label: 'Quran verses' },
  { value: '40,000+', label: 'Authentic hadith' },
  { value: '8',      label: 'Major collections' },
  { value: '100%',   label: 'Citation-verified' },
  { value: '5',      label: 'Languages' },
];

export function StatsBar() {
  return (
    <section className="bg-sage-950 border-t border-sage-800/60">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-sage-300 mb-1">{value}</div>
              <div className="text-xs text-sage-500 font-medium uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
