import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPanel } from "@/components/home/ControlPanel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";

const heroImages = [
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=600&fit=crop", // Sydney Opera House
  "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1200&h=600&fit=crop", // Sydney Harbour Bridge
  "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200&h=600&fit=crop", // Bondi Beach
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1200&h=600&fit=crop", // Sydney skyline
];

const Index = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-10 space-y-6">
        {/* Hero Slideshow */}
        <HeroSlideshow 
          images={heroImages}
          title="Welcome to Sydney"
          subtitle="Discover the best places to explore"
        />
        
        {/* Control Panel: Search + Filters + Surprise */}
        <ControlPanel />
        
        {/* What's On Today */}
        <FeaturedSection />
        
        {/* Recommended Activities */}
        <RecommendedSection />
      </div>
    </AppLayout>
  );
};

export default Index;
