import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SurpriseButton } from "./SurpriseButton";

export function ControlPanel() {
  return (
    <div className="space-y-3">
      <SearchOverlay variant="home" />
      <div className="md:max-w-xs">
        <SurpriseButton />
      </div>
    </div>
  );
}
