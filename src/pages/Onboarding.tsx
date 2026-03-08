import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag,
  Dumbbell, Baby, User, Users, Heart, MapPin, ChevronRight, Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSavePreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { id: "Cafe", label: "Cafés", icon: Coffee, emoji: "☕" },
  { id: "Beach", label: "Beaches", icon: Waves, emoji: "🏖️" },
  { id: "Park", label: "Parks", icon: TreePine, emoji: "🌳" },
  { id: "Restaurant", label: "Restaurants", icon: Utensils, emoji: "🍽️" },
  { id: "Bar", label: "Bars & Nightlife", icon: Wine, emoji: "🍷" },
  { id: "Museum", label: "Museums & Culture", icon: Landmark, emoji: "🏛️" },
  { id: "Shopping", label: "Shopping", icon: ShoppingBag, emoji: "🛍️" },
  { id: "Gym", label: "Fitness", icon: Dumbbell, emoji: "💪" },
  { id: "Playground", label: "Kids & Family", icon: Baby, emoji: "👶" },
];

const EXPLORE_OPTIONS = [
  { id: "solo", label: "Solo", icon: User, desc: "Just me, exploring" },
  { id: "partner", label: "With a partner", icon: Heart, desc: "Date ideas & duos" },
  { id: "family", label: "With family", icon: Users, desc: "Kid-friendly spots" },
  { id: "friends", label: "With friends", icon: Users, desc: "Group adventures" },
];

const DISTANCE_OPTIONS = [
  { km: 2, label: "2 km", desc: "Walking distance" },
  { km: 5, label: "5 km", desc: "Quick drive" },
  { km: 10, label: "10 km", desc: "Worth the trip" },
  { km: 20, label: "20 km+", desc: "Day trip ready" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const savePrefs = useSavePreferences();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exploreWith, setExploreWith] = useState("solo");
  const [maxDistance, setMaxDistance] = useState(5);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const next = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const finish = async () => {
    try {
      await savePrefs.mutateAsync({
        categories: selectedCategories,
        explore_with: exploreWith,
        max_distance: maxDistance,
      });
      toast({ title: "You're all set! 🎉", description: "Recommendations personalised for you" });
      navigate("/hub", { replace: true });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save preferences" });
    }
  };

  const canProceed = step === 0 ? selectedCategories.length >= 3 : true;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
              }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Step {step + 1} of 3</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-x-6 top-0"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">What are you into?</h1>
              <p className="text-muted-foreground text-sm mb-6">Pick at least 3 categories</p>

              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all duration-200 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-muted/50 hover:border-muted-foreground/30"
                      }`}
                    >
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </motion.div>
                      )}
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-x-6 top-0"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">Who do you explore with?</h1>
              <p className="text-muted-foreground text-sm mb-6">We'll tailor suggestions to your style</p>

              <div className="space-y-3">
                {EXPLORE_OPTIONS.map((opt) => {
                  const selected = exploreWith === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExploreWith(opt.id)}
                      className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/50 hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selected ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <opt.icon className={`w-6 h-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                          <Check className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-x-6 top-0"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">How far will you go?</h1>
              <p className="text-muted-foreground text-sm mb-6">Set your default search radius</p>

              <div className="space-y-3">
                {DISTANCE_OPTIONS.map((opt) => {
                  const selected = maxDistance === opt.km;
                  return (
                    <motion.button
                      key={opt.km}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMaxDistance(opt.km)}
                      className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/50 hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selected ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <MapPin className={`w-6 h-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                          <Check className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={back} className="flex-1 py-6 rounded-xl">
            Back
          </Button>
        )}

        {step < 2 ? (
          <Button
            onClick={next}
            disabled={!canProceed}
            className="flex-1 py-6 rounded-xl"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={finish}
            disabled={savePrefs.isPending}
            className="flex-1 py-6 rounded-xl"
          >
            {savePrefs.isPending ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Let's Go!
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
