import { ReactNode } from "react";
import { ResponsiveShell } from "./ResponsiveShell";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  fullHeight?: boolean;
}

export function AppLayout({ children, showHeader = true, fullHeight = false }: AppLayoutProps) {
  return (
    <ResponsiveShell showHeader={showHeader} fullHeight={fullHeight}>
      {children}
    </ResponsiveShell>
  );
}
