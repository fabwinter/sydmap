import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface ResponsiveShellProps {
  children: ReactNode;
  showHeader?: boolean;
  fullHeight?: boolean;
}

export function ResponsiveShell({ 
  children, 
  showHeader = true,
  fullHeight = false 
}: ResponsiveShellProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - strictly hidden on mobile */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Main Content Area */}
      <div className="md:ml-60">
        {/* Mobile Header - only shown on mobile when showHeader is true */}
        {showHeader && (
          <div className="md:hidden">
            <Header />
          </div>
        )}

        <main className={fullHeight ? "h-screen md:h-screen" : "pb-20 md:pb-0"}>
          {children}
        </main>

        {/* Chat Widget */}
        <ChatWidget />

        {/* Mobile Bottom Nav - strictly hidden on desktop */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
