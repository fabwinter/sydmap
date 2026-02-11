import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface ResponsiveShellProps {
  children: ReactNode;
  fullHeight?: boolean;
}

export function ResponsiveShell({ 
  children, 
  fullHeight = false,
}: ResponsiveShellProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area */}
      <main className={fullHeight ? "min-h-screen" : "pb-16"}>
        {children}
      </main>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Bottom Nav - visible on all screen sizes */}
      <BottomNav />
    </div>
  );
}
