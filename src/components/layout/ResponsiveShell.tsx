import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface ResponsiveShellProps {
  children: ReactNode;
  showHeader?: boolean;
  fullHeight?: boolean;
  transparentHeader?: boolean;
}

export function ResponsiveShell({ 
  children, 
  showHeader = true,
  fullHeight = false,
  transparentHeader = false
}: ResponsiveShellProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - visible on all screens */}
      {showHeader && (
        <TopNav variant={transparentHeader ? "transparent" : "solid"} />
      )}

      {/* Main Content Area */}
      <main className={fullHeight ? "min-h-screen" : "pb-20 md:pb-0"}>
        {children}
      </main>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
