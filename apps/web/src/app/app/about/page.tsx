import { Logo } from '@/components/ui/Logo';

const COLLECTIONS = [
  'Sahih al-Bukhari', 'Sahih Muslim', 'Sunan Abu Dawud', 'Jami al-Tirmidhi',
  'Sunan al-Nasai', 'Sunan Ibn Majah', 'Muwatta Imam Malik', 'Musnad Ahmad ibn Hanbal',
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-20 pt-10 space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-sage-50 border border-sage-100 inline-flex">
            <Logo size={40}/>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-sage-900 mb-2">About NoorAI</h1>
        <p className="text-sage-500 text-sm max-w-sm mx-auto leading-relaxed">
          An AI-powered Islamic Q&amp;A tool built on verifiable, authentic sources.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-sage-800">Our Sources</h2>
        <p className="text-sm text-sage-600 leading-relaxed">
          NoorAI answers questions exclusively from the <strong className="text-sage-800">Holy Quran</strong> and{' '}
          <strong className="text-sage-800">authentic (sahih/hasan) Hadith</strong>.
          Weak (daif) or fabricated (mawdu) narrations are never used in AI responses.
        </p>
        <div>
          <h3 className="text-xs font-semibold text-sage-400 uppercase tracking-widest mb-3">Hadith Collections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLLECTIONS.map(c => (
              <div key={c} className="flex items-center gap-2 text-sm text-sage-700">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0"/>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4 border border-sage-100">
          <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-widest mb-2">Grading Methodology</h3>
          <p className="text-sm text-sage-600 leading-relaxed">
            Only <strong className="text-sage-800">Sahih</strong> or{' '}
            <strong className="text-sage-800">Hasan</strong> hadith are used.
            All citations are verified against our database — the AI cannot fabricate a reference.
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200">
        <h2 className="text-sm font-semibold text-amber-800 mb-2">Important Disclaimer</h2>
        <p className="text-sm text-amber-700 leading-relaxed">
          NoorAI is educational only. Responses are <strong>not fatwas</strong> or authoritative rulings.
          Always consult a qualified Islamic scholar for personal religious decisions.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-sage-800 mb-3">Scholar Advisory</h2>
        <p className="text-sm text-sage-600 leading-relaxed">
          NoorAI maintains a panel of qualified Islamic scholars who review flagged answers,
          approve verified responses, and audit a random sample of AI answers quarterly.
        </p>
      </div>
    </div>
  );
}
