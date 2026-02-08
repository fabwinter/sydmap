import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPanel } from "@/components/home/ControlPanel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";

const HERO_SEEN_KEY = "sydmap_hero_seen";

const heroImages = [
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1600&h=900&fit=crop",
];

const Index = () => {
  const [showHero, setShowHero] = useState(() => {
    return !sessionStorage.getItem(HERO_SEEN_KEY);
  });

  const dismissHero = useCallback(() => {
    sessionStorage.setItem(HERO_SEEN_KEY, "true");
    setShowHero(false);
  }, []);

  return (
    <AppLayout showHeader={true} transparentHeader={showHero}>
      {/* Full-page Hero - only on first visit per session */}
      {showHero && (
        <HeroSlideshow 
          images={heroImages}
          title="One app for all your Sydney adventures"
          subtitle="Join thousands exploring the best cafes, beaches, and hidden gems across Australia's most vibrant city."
          ctaText="Start Exploring"
          onCtaClick={dismissHero}
        />
      )}
      
      {/* Content Section */}
      <div id="content-section" className="bg-background pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
          <ControlPanel />
          
          <div id="featured-section">
            <FeaturedSection />
          </div>
          
          <RecommendedSection />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
