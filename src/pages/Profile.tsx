import { useState } from "react";
import { Settings, MapPin, Users, Coffee, Award, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/premium/PremiumModal";

const user = {
  name: "Alex Chen",
  bio: "Exploring Sydney one cafe at a time ☕",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  stats: {
    checkIns: 47,
    friends: 234,
    topCategory: { name: "Cafes", count: 18 },
  },
  badges: [
    { id: "1", name: "Explorer", emoji: "🧭", description: "Visited 10+ unique locations" },
    { id: "2", name: "Foodie", emoji: "🍽️", description: "Checked in to 15+ restaurants" },
    { id: "3", name: "Early Bird", emoji: "🌅", description: "5 check-ins before 8am" },
    { id: "4", name: "Beach Lover", emoji: "🏖️", description: "Visited all major Sydney beaches" },
  ],
  recentCheckIns: [
    {
      id: "1",
      name: "Bronte Beach",
      category: "Beach",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      date: "Today",
      rating: 5,
    },
    {
      id: "2",
      name: "The Grounds",
      category: "Cafe",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      date: "Yesterday",
      rating: 4,
    },
    {
      id: "3",
      name: "Opera Bar",
      category: "Bar",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop",
      date: "3 days ago",
      rating: 5,
    },
  ],
};

export default function Profile() {
  const [showPremium, setShowPremium] = useState(false);
  
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="px-4 py-6 text-center border-b border-border">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">AC</AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-xl font-bold mt-4">{user.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.bio}</p>
          
          {/* Badges */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {user.badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                className="px-3 py-1.5 bg-primary/10 rounded-full text-sm flex items-center gap-1.5"
                title={badge.description}
              >
                <span>{badge.emoji}</span>
                <span className="font-medium text-primary">{badge.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setShowPremium(true)}>
              <Award className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-border">
          <StatItem
            icon={MapPin}
            value={user.stats.checkIns}
            label="Check-ins"
          />
          <StatItem
            icon={Users}
            value={user.stats.friends}
            label="Friends"
          />
          <StatItem
            icon={Coffee}
            value={user.stats.topCategory.count}
            label={user.stats.topCategory.name}
          />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 py-4">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Check-Ins</h3>
              <button className="text-sm text-primary font-medium flex items-center gap-1">
                See all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {user.recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="activity-card">
                  <div className="relative aspect-square">
                    <img
                      src={checkIn.image}
                      alt={checkIn.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium line-clamp-1">
                        {checkIn.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="checkins">
            <div className="space-y-3">
              {user.recentCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                  <img
                    src={checkIn.image}
                    alt={checkIn.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{checkIn.name}</p>
                    <p className="text-xs text-muted-foreground">{checkIn.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">{checkIn.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {"⭐".repeat(checkIn.rating)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="playlists">
            <div className="text-center py-8 text-muted-foreground">
              <p>No playlists yet</p>
              <Button variant="link" className="mt-2 text-primary">
                Create your first playlist
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="text-center py-8 text-muted-foreground">
              <p>Connect with friends</p>
              <Button variant="link" className="mt-2 text-primary">
                Find friends
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </AppLayout>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center py-4">
      <Icon className="w-5 h-5 text-primary mb-1" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
