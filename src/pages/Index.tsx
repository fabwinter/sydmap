import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPanel } from "@/components/home/ControlPanel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { useNavigate } from "react-router-dom";

const heroImages = [
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop", // Sydney Opera House
  "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1600&h=900&fit=crop", // Sydney Harbour Bridge
  "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1600&h=900&fit=crop", // Bondi Beach
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1600&h=900&fit=crop", // Sydney skyline
];

const Index = () => {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    // Scroll to featured section or navigate to map
    const featuredSection = document.getElementById('featured-section');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-10 space-y-8">
        {/* Hero Slideshow - Polarsteps style */}
        <HeroSlideshow 
          images={heroImages}
          title="One app for all your Sydney adventures"
          subtitle="Join thousands exploring the best cafes, beaches, and hidden gems across Australia's most vibrant city."
          ctaText="Start Exploring"
          onCtaClick={handleCtaClick}
        />
        
        {/* Control Panel: Search + Filters + Surprise */}
        <ControlPanel />
        
        {/* What's On Today */}
        <div id="featured-section">
          <FeaturedSection />
        </div>
        
        {/* Recommended Activities */}
        <RecommendedSection />
      </div>
    </AppLayout>
  );
};

export default Index;
