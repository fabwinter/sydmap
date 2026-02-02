import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="pb-20">
        {children}
      </main>
      <ChatWidget />
      <BottomNav />
    </div>
  );
}
