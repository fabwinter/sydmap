import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className={!isMobile ? "md:ml-60" : ""}>
        {/* Mobile Header - only shown on mobile when showHeader is true */}
        {isMobile && showHeader && <Header />}

        <main className={fullHeight ? "h-screen" : "pb-20 md:pb-0"}>
          {children}
        </main>

        {/* Chat Widget */}
        <ChatWidget />

        {/* Mobile Bottom Nav - hidden on desktop */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
