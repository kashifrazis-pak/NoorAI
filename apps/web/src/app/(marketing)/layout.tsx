import { MarketingNav } from '@/components/landing/MarketingNav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-sage-900">
      <MarketingNav />
      {children}
    </div>
  );
}
