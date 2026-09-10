import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScrollToTop } from "./components/ScrollToTop";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

/**
 * Everything that used to wrap <Routes> in App.tsx. It is the root route's
 * element so the same providers surround every page, both when the page is
 * prerendered to static HTML at build time and when it hydrates in the
 * browser.
 *
 * Only Spanish is prerendered: LanguageProvider's default is "es", and the
 * saved language is applied client-side after mount, so the static HTML is
 * exactly what React's first render produces.
 */
export function RootLayout() {
  // The page is visible before the bundle hydrates. This attribute marks the
  // moment interaction actually works, for tests and for anyone debugging a
  // "the button did nothing" report.
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Outlet />
          <ChatbotWidget />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
