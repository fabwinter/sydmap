import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/home/SearchBar";
import { FilterChips } from "@/components/home/FilterChips";
import { SurpriseButton } from "@/components/home/SurpriseButton";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";

const Index = () => {
  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
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
