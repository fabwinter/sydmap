import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useChatStore } from "@/stores/chatStore";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

/** Extract quick replies from the end of a message */
function extractQuickReplies(content: string): { cleanContent: string; quickReplies: string[] } {
  const match = content.match(/<!--QUICK_REPLIES:\[(.+?)\]-->/);
  if (!match) return { cleanContent: content, quickReplies: [] };
  try {
    const replies = JSON.parse(`[${match[1]}]`);
    const cleanContent = content.replace(/<!--QUICK_REPLIES:\[.+?\]-->/, "").trim();
    return { cleanContent, quickReplies: replies };
  } catch {
    return { cleanContent: content, quickReplies: [] };
  }
}

export function useChat() {
  const { messages, setMessages, clearMessages } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const { location } = useUserLocation();
  const { profile, session } = useAuth();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const assistantId = (Date.now() + 1).toString();

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      const { cleanContent, quickReplies } = extractQuickReplies(assistantSoFar);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantId) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: cleanContent, quickReplies } : m
          );
        }
        return [
          ...prev,
          { id: assistantId, role: "assistant" as const, content: cleanContent, timestamp: new Date(), quickReplies },
        ];
      });
    };

    try {
      // Build user context
      const userContext: any = {};
      if (location) {
        userContext.location = location;
      }
      if (profile?.name) {
        userContext.userName = profile.name;
      }

      // Fetch saved items if authenticated
      if (session?.user) {
        const { data: savedItems } = await supabase
          .from("saved_items")
          .select("activity_id, activities(name, category)")
          .eq("user_id", session.user.id)
          .limit(20);
        
        if (savedItems?.length) {
          userContext.savedActivities = savedItems.map((s: any) => ({
            name: s.activities?.name,
            category: s.activities?.category,
          })).filter((a: any) => a.name);
        }

        // Fetch recent check-ins
        const { data: checkIns } = await supabase
          .from("check_ins")
          .select("rating, created_at, activities(name, category)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(15);

        if (checkIns?.length) {
          userContext.recentCheckIns = checkIns.map((c: any) => ({
            activity_name: c.activities?.name,
            category: c.activities?.category,
            rating: c.rating,
            date: new Date(c.created_at).toLocaleDateString(),
          })).filter((c: any) => c.activity_name);
        }

        // Fetch calendar events
        const { data: calEvents } = await supabase
          .from("calendar_events")
          .select("title, event_date, event_time, activities(name, category)")
          .eq("user_id", session.user.id)
          .order("event_date", { ascending: true })
          .limit(20);

        if (calEvents?.length) {
          userContext.calendarEvents = calEvents.map((e: any) => ({
            title: e.title || e.activities?.name,
            date: e.event_date,
            time: e.event_time,
            category: e.activities?.category,
          }));
        }
      }

      // Build conversation history
      const currentMessages = useChatStore.getState().messages;
      const apiMessages = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, userContext }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMsg = errorData.error || "Failed to get a response. Please try again.";
        
        if (resp.status === 429) {
          toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "Credits Exhausted", description: "AI usage credits have been exhausted.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: errorMsg, variant: "destructive" });
        }
        
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast({ title: "Connection Error", description: "Could not connect to AI assistant.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, setMessages, location, profile, session]);

  return { messages, isLoading, sendMessage, clearMessages };
}
