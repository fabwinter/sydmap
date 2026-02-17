import { Sparkles, RefreshCw, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWhatsOnToday, type WhatsOnItem } from "@/hooks/useWhatsOnToday";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function EventCard({ item }: { item: WhatsOnItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:border-primary transition-colors"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary/50" />
          </div>
        )}
        {item.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-foreground shadow-sm">
            {item.category}
          </div>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-foreground line-clamp-2 flex items-start gap-1.5">
          {item.title}
          <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
        </h3>
        {item.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
        )}
      </div>
    </a>
  );
}

export default function WhatsOn() {
  const { data: items, isLoading, isError, refetch } = useWhatsOnToday(50);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-warning" />
          <h1 className="text-2xl font-bold">What's On in Sydney</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[16/9] rounded-xl" />
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-muted-foreground">Couldn't load events</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No events found</p>
        )}
      </div>
    </AppLayout>
  );
}
