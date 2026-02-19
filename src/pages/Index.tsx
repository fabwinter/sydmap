import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPanel } from "@/components/home/ControlPanel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { CuratedSections } from "@/components/home/CuratedSections";
import { FoursquareSection } from "@/components/home/FoursquareSection";
import { GoogleSection } from "@/components/home/GoogleSection";
import { SearchResultsGrid } from "@/components/home/SearchResultsGrid";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useRecommendedActivities } from "@/hooks/useActivities";

const Index = () => {
  const { hasActiveFilters } = useSearchFilters();
  const isFiltering = hasActiveFilters();
  const { data: activities, isLoading } = useRecommendedActivities(isFiltering ? 200 : 15);

  return (
    <AppLayout>
      <div className="bg-background">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
          <ControlPanel />
          
          {isFiltering ? (
            /* Search/filter mode: only show grid results */
            <SearchResultsGrid activities={activities} isLoading={isLoading} />
          ) : (
            /* Browse mode: show curated sections */
            <>
              <div id="featured-section">
                <FeaturedSection />
              </div>
              
              <RecommendedSection />
              
              <CuratedSections />
              
              {/* External sources below DB - admin only */}
              <FoursquareSection />
              <GoogleSection />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
