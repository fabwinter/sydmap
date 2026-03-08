import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { triggerHaptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";

const heroImages = [
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1600&h=900&fit=crop",
];

export default function Landing() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check existing session FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Landing] getSession:", !!session);
      if (session) {
        navigate("/home", { replace: true });
        return;
      }
      setReady(true);
    });

    // Listen for auth changes (e.g. OAuth redirect completing)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Landing] onAuthStateChange:", event, !!session);
      if (session) {
        navigate("/home", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleStart = () => {
    triggerHaptic("medium");
    navigate("/home");
  };

  // Don't render landing UI until we've confirmed no session exists
  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <HeroSlideshow
        images={heroImages}
        title="One app for all your Sydney adventures"
        subtitle="Join thousands exploring the best cafes, beaches, and hidden gems across Australia's most vibrant city."
        ctaText="Start Exploring"
        onCtaClick={handleStart}
      />
    </div>
  );
}
