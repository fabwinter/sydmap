import { Home, Map, Clock, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around h-14 max-w-2xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => triggerHaptic("light")}
              className={`nav-tab flex-1 relative ${isActive ? "active" : ""}`}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
