import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "./PremiumModal";

interface UpgradePromptProps {
  title: string;
  description: string;
}

export function UpgradePrompt({ title, description }: UpgradePromptProps) {
  const [showPremium, setShowPremium] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          <Button
            size="sm"
            className="mt-2 h-8 text-xs"
            onClick={() => setShowPremium(true)}
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </>
  );
}
