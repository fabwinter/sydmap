import { Link, useLocation } from "react-router-dom";
import { Home, Map, Clock, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HamburgerMenu } from "./HamburgerMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const desktopNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface TopNavProps {
  variant?: "transparent" | "solid";
}

export function TopNav({ variant = "transparent" }: TopNavProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isSolid = variant === "solid";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        isSolid 
          ? "bg-background/95 backdrop-blur-md border-b border-border" 
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              isSolid 
                ? "bg-primary/10 border-primary/20" 
                : "bg-white/20 backdrop-blur-sm border-white/30"
            )}>
              <span className={cn("font-bold text-sm", isSolid ? "text-primary" : "text-white")}>SP</span>
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight",
              isSolid ? "text-foreground" : "text-white"
            )}>
              Sydney Planner
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {desktopNavItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? isSolid
                        ? "bg-primary/10 text-primary"
                        : "bg-white/20 text-white"
                      : isSolid
                        ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button 
                asChild 
                variant="outline" 
                className={cn(
                  "hidden sm:inline-flex",
                  !isSolid && "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                )}
              >
                <Link to="/login">Log in</Link>
              </Button>
            )}
            {/* Hamburger - mobile only */}
            <div className="md:hidden">
              <HamburgerMenu variant={isSolid ? "solid" : "transparent"} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
