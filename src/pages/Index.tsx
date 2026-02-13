import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPanel } from "@/components/home/ControlPanel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { CuratedSections } from "@/components/home/CuratedSections";
import { FoursquareSection } from "@/components/home/FoursquareSection";

const Index = () => {
  return (
    <AppLayout>
      <div className="bg-background">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
          <ControlPanel />
          
          {/* Foursquare live results - shown when searching */}
          <FoursquareSection />
          
          <div id="featured-section">
            <FeaturedSection />
          </div>
          
          <RecommendedSection />
          
          <CuratedSections />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
