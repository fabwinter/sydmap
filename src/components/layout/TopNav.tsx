import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HamburgerMenu } from "./HamburgerMenu";
import { useAuth } from "@/hooks/useAuth";

interface TopNavProps {
  variant?: "transparent" | "solid";
}

export function TopNav({ variant = "transparent" }: TopNavProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        variant === "solid" 
          ? "bg-background/95 backdrop-blur-md border-b border-border" 
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className={`text-xl font-bold tracking-tight ${
              variant === "solid" ? "text-foreground" : "text-white"
            }`}>
              SYDMAP
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button 
                asChild 
                variant="outline" 
                className={`hidden sm:inline-flex ${
                  variant === "transparent" 
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm" 
                    : ""
                }`}
              >
                <Link to="/login">Log in</Link>
              </Button>
            )}
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
