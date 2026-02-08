import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HamburgerMenu } from "./HamburgerMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface TopNavProps {
  variant?: "transparent" | "solid";
}

export function TopNav({ variant = "transparent" }: TopNavProps) {
  const { isAuthenticated } = useAuth();
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

          {/* Right Side - Hamburger for all screen sizes */}
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
            {/* Hamburger - visible on all screen sizes now */}
            <HamburgerMenu variant={isSolid ? "solid" : "transparent"} />
          </div>
        </div>
      </div>
    </header>
  );
}
