import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import { ChatVenueCards } from "@/components/chat/ChatVenueCards";

const starterPrompts = [
  "🍳 Best brunch spots nearby",
  "🏖️ Family-friendly beaches",
  "🌃 Romantic dinner ideas",
  "🎨 Hidden gems to explore",
  "☕ Quiet cafes for work",
  "🌿 Nature walks in Sydney",
];

export default function Chat() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const { profile, isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.name?.split(" ")[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setInput("");
    sendMessage(text);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold">Sydney Planner Assistant</h1>
                <p className="text-xs text-muted-foreground">AI-powered discovery</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearMessages} title="Clear chat">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">
                  G'day{isAuthenticated && firstName ? ` ${firstName}` : ""}! 👋
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  I'm your Sydney Planner assistant. Tell me what you're in the mood for, and I'll find the perfect spots in Sydney!
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-xs font-medium transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border rounded-bl-md"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {/* Venue thumbnail cards for assistant messages */}
                  {message.role === "assistant" && message.content.length > 20 && (
                    <ChatVenueCards messageContent={message.content} />
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Sydney..."
              className="flex-1 bg-muted rounded-full px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shrink-0"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
