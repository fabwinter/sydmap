import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, UtensilsCrossed, Clock, Accessibility, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUserPreferences, useSaveExpandedPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";

const CUISINE_OPTIONS = [
  "Italian", "Japanese", "Thai", "Chinese", "Indian", "Mexican",
  "Vietnamese", "Korean", "Mediterranean", "Australian", "American",
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌆" },
  { value: "night", label: "Late Night", emoji: "🌙" },
];

const BUDGET_OPTIONS = [
  { value: "any", label: "Any Budget", emoji: "💰" },
  { value: "free", label: "Free Only", emoji: "🆓" },
  { value: "budget", label: "Budget-Friendly", emoji: "💵" },
  { value: "mid", label: "Mid-Range", emoji: "💳" },
  { value: "premium", label: "Premium", emoji: "💎" },
];

const ACCESSIBILITY_OPTIONS = [
  { value: "wheelchair", label: "Wheelchair Access" },
  { value: "parking", label: "Parking Available" },
  { value: "family", label: "Family-Friendly" },
  { value: "pet", label: "Pet-Friendly" },
];

const VIBE_OPTIONS = [
  { value: "quiet", label: "Quiet & Relaxing", emoji: "🧘" },
  { value: "lively", label: "Lively & Social", emoji: "🎉" },
  { value: "outdoors", label: "Outdoors & Nature", emoji: "🌿" },
  { value: "cultural", label: "Cultural & Arts", emoji: "🎨" },
  { value: "active", label: "Active & Sporty", emoji: "🏃" },
  { value: "romantic", label: "Romantic", emoji: "💕" },
];

export function PreferencesSurvey() {
  const { data: prefs, isLoading } = useUserPreferences();
  const saveMutation = useSaveExpandedPreferences();

  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [budget, setBudget] = useState("any");
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [vibe, setVibe] = useState<string[]>([]);

  useEffect(() => {
    if (prefs) {
      setPersonalizationEnabled(prefs.personalization_enabled ?? true);
      setCuisines((prefs.cuisines as string[]) ?? []);
      setBudget(prefs.budget ?? "any");
      setTimeOfDay((prefs.time_of_day as string[]) ?? []);
      setAccessibilityNeeds((prefs.accessibility_needs as string[]) ?? []);
      setVibe((prefs.vibe as string[]) ?? []);
    }
  }, [prefs]);

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        personalization_enabled: personalizationEnabled,
        cuisines,
        budget,
        time_of_day: timeOfDay,
        accessibility_needs: accessibilityNeeds,
        vibe,
      });
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalization consent */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Personalised Recommendations</p>
            <p className="text-xs text-muted-foreground">
              Use your activity to shape suggestions
            </p>
          </div>
        </div>
        <Switch checked={personalizationEnabled} onCheckedChange={setPersonalizationEnabled} />
      </div>

      <AnimatePresence>
        {personalizationEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Vibe */}
            <SurveySection icon={Heart} title="What's your vibe?">
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <ChipButton
                    key={v.value}
                    label={`${v.emoji} ${v.label}`}
                    active={vibe.includes(v.value)}
                    onClick={() => toggleItem(vibe, setVibe, v.value)}
                  />
                ))}
              </div>
            </SurveySection>

            {/* Cuisines */}
            <SurveySection icon={UtensilsCrossed} title="Favourite cuisines">
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((c) => (
                  <ChipButton
                    key={c}
                    label={c}
                    active={cuisines.includes(c)}
                    onClick={() => toggleItem(cuisines, setCuisines, c)}
                  />
                ))}
              </div>
            </SurveySection>

            {/* Time of day */}
            <SurveySection icon={Clock} title="Preferred time of day">
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((t) => (
                  <ChipButton
                    key={t.value}
                    label={`${t.emoji} ${t.label}`}
                    active={timeOfDay.includes(t.value)}
                    onClick={() => toggleItem(timeOfDay, setTimeOfDay, t.value)}
                  />
                ))}
              </div>
            </SurveySection>

            {/* Budget */}
            <SurveySection icon={UtensilsCrossed} title="Budget preference">
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((b) => (
                  <ChipButton
                    key={b.value}
                    label={`${b.emoji} ${b.label}`}
                    active={budget === b.value}
                    onClick={() => setBudget(b.value)}
                  />
                ))}
              </div>
            </SurveySection>

            {/* Accessibility */}
            <SurveySection icon={Accessibility} title="Accessibility & needs">
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_OPTIONS.map((a) => (
                  <ChipButton
                    key={a.value}
                    label={a.label}
                    active={accessibilityNeeds.includes(a.value)}
                    onClick={() => toggleItem(accessibilityNeeds, setAccessibilityNeeds, a.value)}
                  />
                ))}
              </div>
            </SurveySection>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Check className="w-4 h-4 mr-2" />
        )}
        Save Preferences
      </Button>
    </div>
  );
}

function SurveySection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </button>
  );
}
