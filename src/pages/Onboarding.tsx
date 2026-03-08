import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag,
  Dumbbell, Baby, User, Users, Heart, MapPin, ChevronRight, Check,
  Sparkles, ChevronLeft,
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

const STEP_HEADERS = [
  { title: "What are you into?", subtitle: "Pick at least 3 to personalise your feed" },
  { title: "Who do you explore with?", subtitle: "We'll tailor suggestions to your style" },
  { title: "How far will you go?", subtitle: "Set your default search radius" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
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

  const next = () => { setDirection(1); setStep((s) => s + 1); };
  const back = () => { setDirection(-1); setStep((s) => s - 1); };

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
      {/* Hero image header */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img
          src="/images/sydney-auth-bg.jpg"
          alt="Sydney skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-background" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-1">
              Step {step + 1} of 3
            </p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              {STEP_HEADERS[step].title}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              {STEP_HEADERS[step].subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4 pb-2 shrink-0">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-6 overflow-y-auto pb-4 relative">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {CATEGORIES.map((cat) => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border-2 transition-all duration-200 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </motion.div>
                      )}
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-[11px] font-semibold text-foreground leading-tight text-center">
                        {cat.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && selectedCategories.length < 3 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {3 - selectedCategories.length} more to go
                </p>
              )}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="space-y-2.5 pt-2">
                {EXPLORE_OPTIONS.map((opt) => {
                  const selected = exploreWith === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExploreWith(opt.id)}
                      className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-primary bg-primary/8 shadow-md"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <opt.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="space-y-2.5 pt-2">
                {DISTANCE_OPTIONS.map((opt) => {
                  const selected = maxDistance === opt.km;
                  return (
                    <motion.button
                      key={opt.km}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMaxDistance(opt.km)}
                      className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-primary bg-primary/8 shadow-md"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
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

      {/* Bottom navigation */}
      <div className="px-6 pb-8 pt-3 flex gap-3 shrink-0 bg-gradient-to-t from-background via-background to-transparent">
        {step > 0 ? (
          <Button variant="outline" onClick={back} className="py-6 px-5 rounded-xl border-border">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => navigate("/hub", { replace: true })}
            className="py-6 px-4 rounded-xl text-muted-foreground text-sm"
          >
            Skip
          </Button>
        )}

        {step < 2 ? (
          <Button
            onClick={next}
            disabled={!canProceed}
            className="flex-1 py-6 rounded-xl text-base font-semibold"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={finish}
            disabled={savePrefs.isPending}
            className="flex-1 py-6 rounded-xl text-base font-semibold"
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
