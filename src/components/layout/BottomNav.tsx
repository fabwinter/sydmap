import { Home, Map, Bookmark, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-tab flex-1 ${isActive ? "active" : ""}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
