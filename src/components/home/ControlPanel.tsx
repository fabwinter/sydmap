import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Dices } from "lucide-react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SurpriseWheel } from "./SurpriseWheel";

export function ControlPanel() {
  const [showWheel, setShowWheel] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <SearchOverlay variant="home" />
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/chat")}
          className="surprise-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          AI Chat
        </button>
        <button
          onClick={() => setShowWheel(true)}
          className="surprise-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        >
          <Dices className="w-5 h-5 animate-bounce-subtle" />
          Surprise Me!
        </button>
      </div>
      {showWheel && <SurpriseWheel onClose={() => setShowWheel(false)} />}
    </div>
  );
}
