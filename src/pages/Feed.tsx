import { AppLayout } from "@/components/layout/AppLayout";
import { SocialFeed } from "@/components/profile/SocialFeed";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Feed() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activity Feed</h1>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Sign in to see friend activity</p>
            <Link to="/login">
              <Button className="mt-3">Sign In</Button>
            </Link>
          </div>
        ) : (
          <SocialFeed />
        )}
      </div>
    </AppLayout>
  );
}
