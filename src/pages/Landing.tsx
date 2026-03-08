import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop",
    emoji: "🗺️",
    title: "Discover Sydney",
    description: "Find the best cafes, beaches, hidden gems, and events — all in one place.",
  },
  {
    image: "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1600&h=900&fit=crop",
    emoji: "📍",
    title: "Check In & Share",
    description: "Snap a photo, rate your experience, and share it with friends or the community.",
  },
  {
    image: "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1600&h=900&fit=crop",
    emoji: "🎲",
    title: "Get Surprised",
    description: "Spin the wheel and let SYDMAP pick your next adventure. No plans needed.",
  },
  {
    image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1600&h=900&fit=crop",
    emoji: "🏆",
    title: "Earn Badges",
    description: "Unlock achievements like Explorer, Foodie, and Night Owl as you explore.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/hub", { replace: true });
        return;
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/hub", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const goTo = (i: number) => {
    setCurrent(i);
    clearInterval(timerRef.current);
  };

  const handleStart = () => {
    triggerHaptic("medium");
    navigate("/home");
  };

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-slate-900">
      {/* Background image layer */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1, ease: "easeInOut" },
              scale: { duration: 10, ease: "easeOut" },
            }}
          />
        </AnimatePresence>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
      </div>

      {/* Top: Logo */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <span className="text-white font-extrabold text-2xl tracking-tight">SYDMAP</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/login")}
          className="text-white/80 hover:text-white hover:bg-white/10 text-sm"
        >
          Sign In
        </Button>
      </div>

      {/* Spacer pushes content down */}
      <div className="flex-1" />

      {/* Bottom content card */}
      <div className="relative z-10 px-6 pb-6">
        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="text-4xl mb-3 block">{slide.emoji}</span>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              {slide.title}
            </h2>
            <p className="text-white/85 text-base md:text-lg max-w-md leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots + nav arrows */}
        <div className="flex items-center gap-3 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === current ? 32 : 12 }}
              aria-label={`Slide ${i + 1}`}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              {i === current && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fixed CTA */}
        <Button
          size="lg"
          onClick={handleStart}
          className="w-full bg-white text-foreground hover:bg-white/90 font-semibold py-6 text-base rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <MapPin className="w-5 h-5 mr-2 text-primary" />
          Start Exploring
        </Button>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-white/70 text-xs font-medium">Loved by Sydney locals</span>
        </div>
      </div>
    </div>
  );
}
