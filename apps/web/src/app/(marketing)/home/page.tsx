import { HeroSection }      from '@/components/landing/HeroSection';
import { StatsBar }          from '@/components/landing/StatsBar';
import { FeaturesSection }   from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SourcesSection }    from '@/components/landing/SourcesSection';
import { FAQSection }        from '@/components/landing/FAQSection';
import { CTASection }        from '@/components/landing/CTASection';
import { LandingFooter }     from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'NoorAI — Islamic Q&A powered by Quran & authentic Sunnah',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <SourcesSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </>
  );
}
