import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFriends() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const friends = useQuery({
    queryKey: ["friends", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("friends")
        .select(`
          id, status, created_at, user_id, friend_id
        `)
        .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`);
      if (error) throw error;

      // Fetch profile details for each friend
      const friendIds = (data || []).map(f => 
        f.user_id === profile.id ? f.friend_id : f.user_id
      );
      
      if (friendIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, username, bio")
        .in("id", friendIds);

      return (data || []).map(f => {
        const otherId = f.user_id === profile.id ? f.friend_id : f.user_id;
        const otherProfile = profiles?.find(p => p.id === otherId);
        return {
          ...f,
          isIncoming: f.friend_id === profile.id,
          friendProfile: otherProfile || { id: otherId, name: "Unknown", avatar_url: null, username: null, bio: null },
        };
      });
    },
    enabled: !!profile?.id,
  });

  const sendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      const { error } = await supabase
        .from("friends")
        .insert({ user_id: profile!.id, friend_id: friendId, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  const acceptRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  const removeFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  const searchUsers = async (query: string) => {
    if (!query.trim() || !profile?.id) return [];
    const { data } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, username, bio")
      .neq("id", profile.id)
      .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);
    return data || [];
  };

  return {
    friends: friends.data || [],
    isLoading: friends.isLoading,
    sendRequest,
    acceptRequest,
    removeFriend,
    searchUsers,
  };
}
