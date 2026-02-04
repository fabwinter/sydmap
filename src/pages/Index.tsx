import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/home/SearchBar";
import { FilterChips } from "@/components/home/FilterChips";
import { SurpriseButton } from "@/components/home/SurpriseButton";
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
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto md:max-w-3xl lg:max-w-4xl">
        {/* Hero Slideshow */}
        <HeroSlideshow 
          images={heroImages}
          title="Welcome to Sydney"
          subtitle="Discover the best places to explore"
        />
        
        {/* Search */}
        <SearchBar />
        
        {/* Filters */}
        <FilterChips />
        
        {/* Surprise Me Button */}
        <SurpriseButton />
        
        {/* What's On Today */}
        <FeaturedSection />
        
        {/* Recommended Activities */}
        <RecommendedSection />
      </div>
    </AppLayout>
  );
};

export default Index;
