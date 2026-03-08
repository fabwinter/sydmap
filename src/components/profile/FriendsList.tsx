import { useState, useCallback } from "react";
import { Search, UserPlus, UserCheck, UserX, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

interface FriendsListProps {
  profileId: string;
}

export function FriendsList({ profileId }: FriendsListProps) {
  const { friends, isLoading, sendRequest, acceptRequest, removeFriend, searchUsers } = useFriends();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const accepted = friends.filter(f => f.status === "accepted");
  const pendingIncoming = friends.filter(f => f.status === "pending" && f.isIncoming);
  const pendingOutgoing = friends.filter(f => f.status === "pending" && !f.isIncoming);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      // Filter out existing friends
      const friendIds = new Set(friends.map(f => f.friendProfile.id));
      setSearchResults(results.filter(r => !friendIds.has(r.id) && r.id !== profileId));
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, friends, profileId, searchUsers]);

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      toast.success("Friend request sent!");
      setSearchResults(prev => prev.filter(r => r.id !== userId));
    } catch (e: any) {
      toast.error(e.message || "Failed to send request");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search toggle */}
      <div className="flex gap-2">
        <Button
          variant={showSearch ? "secondary" : "default"}
          size="sm"
          className="gap-1.5 rounded-full min-h-[44px]"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          {showSearch ? "Close" : "Find Friends"}
        </Button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="space-y-3 bg-muted/50 rounded-xl p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch} disabled={isSearching} className="min-h-[44px]">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-card">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name || "Unknown"}</p>
                    {user.username && <p className="text-xs text-muted-foreground">@{user.username}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 shrink-0"
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendRequest.isPending}
                  >
                    <UserPlus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-2">No users found</p>
          )}
        </div>
      )}

      {/* Pending incoming requests */}
      {pendingIncoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Friend Requests</h3>
          {pendingIncoming.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Avatar className="w-10 h-10">
                <AvatarImage src={f.friendProfile.avatar_url || undefined} />
                <AvatarFallback>{f.friendProfile.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{f.friendProfile.name}</p>
                <p className="text-xs text-muted-foreground">Wants to be friends</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="gap-1 min-h-[36px]"
                  onClick={() => acceptRequest.mutate(f.id, { onSuccess: () => toast.success("Friend request accepted!") })}
                >
                  <UserCheck className="w-3 h-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-[36px]"
                  onClick={() => removeFriend.mutate(f.id)}
                >
                  <UserX className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted friends */}
      {accepted.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Friends ({accepted.length})</h3>
          {accepted.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <Avatar className="w-10 h-10">
                <AvatarImage src={f.friendProfile.avatar_url || undefined} />
                <AvatarFallback>{f.friendProfile.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{f.friendProfile.name}</p>
                {f.friendProfile.bio && <p className="text-xs text-muted-foreground truncate">{f.friendProfile.bio}</p>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive min-h-[36px]"
                onClick={() => removeFriend.mutate(f.id, { onSuccess: () => toast.success("Friend removed") })}
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && pendingIncoming.length === 0 && !showSearch && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No friends yet. Use the search to find people!</p>
          </div>
        )
      )}

      {/* Pending outgoing */}
      {pendingOutgoing.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Pending ({pendingOutgoing.length})</h3>
          {pendingOutgoing.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="w-8 h-8">
                <AvatarImage src={f.friendProfile.avatar_url || undefined} />
                <AvatarFallback>{f.friendProfile.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{f.friendProfile.name}</p>
                <p className="text-xs text-muted-foreground">Request sent</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
