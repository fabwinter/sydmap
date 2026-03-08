import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Hub from "./pages/Hub";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import MapView from "./pages/MapView";
import Timeline from "./pages/Timeline";
import Chat from "./pages/Chat";
import ActivityDetails from "./pages/ActivityDetails";
import CategoryView from "./pages/CategoryView";
import WhatsOn from "./pages/WhatsOn";
import EventDetails from "./pages/EventDetails";
import Discounts from "./pages/Discounts";
import Feed from "./pages/Feed";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/activity/:id" element={<ActivityDetails />} />
            <Route path="/explore" element={<CategoryView />} />
            <Route path="/whats-on" element={<WhatsOn />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
