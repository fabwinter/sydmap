import { useState } from "react";
import { Ticket, Copy, Check, Lock, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PremiumModal } from "@/components/premium/PremiumModal";

export default function Discounts() {
  const { profile, isLoading: authLoading } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const isPremium = profile?.is_premium;

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("active", true)
        .order("partnership_tier", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Discount code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Partner Discounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exclusive deals from our partner venues
          </p>
        </div>

        {!isPremium && !authLoading && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Premium Feature</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Upgrade to Premium to unlock exclusive partner discounts and save on your favorite venues.
            </p>
            <Button size="sm" onClick={() => setShowPremium(true)} className="gap-1">
              <Sparkles className="w-3 h-3" />
              Upgrade Now
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : partners && partners.length > 0 ? (
            partners.map((partner) => (
              <div
                key={partner.id}
                className={`relative border rounded-xl p-4 ${
                  partner.partnership_tier === "featured"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card"
                } ${!isPremium ? "opacity-60 blur-[1px]" : ""}`}
              >
                {partner.partnership_tier === "featured" && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    FEATURED
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{partner.name}</h3>
                    {partner.category && (
                      <span className="text-xs text-muted-foreground">{partner.category}</span>
                    )}
                    {partner.discount_percentage && (
                      <p className="text-lg font-bold text-primary mt-1">
                        {partner.discount_percentage}% OFF
                      </p>
                    )}
                  </div>
                  {isPremium && partner.discount_code && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1"
                      onClick={() => handleCopy(partner.discount_code!, partner.id)}
                    >
                      {copiedId === partner.id ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedId === partner.id ? "Copied" : "Copy Code"}
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No partner discounts available yet</p>
              <p className="text-sm">Check back soon for exclusive deals!</p>
            </div>
          )}
        </div>
      </div>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </AppLayout>
  );
}
