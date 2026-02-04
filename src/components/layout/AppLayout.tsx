import { ReactNode } from "react";
import { ResponsiveShell } from "./ResponsiveShell";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  fullHeight?: boolean;
  transparentHeader?: boolean;
}

export function AppLayout({ 
  children, 
  showHeader = true, 
  fullHeight = false,
  transparentHeader = false 
}: AppLayoutProps) {
  return (
    <ResponsiveShell 
      showHeader={showHeader} 
      fullHeight={fullHeight}
      transparentHeader={transparentHeader}
    >
      {children}
    </ResponsiveShell>
  );
}
