import type { RouteRecord } from "vite-react-ssg";
import { RootLayout } from "./RootLayout";
import Index from "./pages/Index";
import ChatbotsMulticanal from "./pages/ChatbotsMulticanal";
import AgentesTelefonicos from "./pages/AgentesTelefonicos";
import Contacto from "./pages/Contacto";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import NotFound from "./pages/NotFound";

/**
 * Every static path here is prerendered to its own HTML file at build time
 * (flat style: /chatbots-multicanal -> dist/chatbots-multicanal.html), which
 * GitHub Pages serves directly on the extensionless URL. Adding a route here
 * is all it takes for it to be prerendered and, later, listed in the sitemap.
 *
 * The "404" route exists purely to produce dist/404.html - the file GitHub
 * Pages serves for any unknown URL - as a real, prerendered NotFound page
 * rather than a copy of the home. NotFound renders nothing path-specific, so
 * hydrating it under whatever URL the visitor actually typed is clean. The
 * "*" catch-all is what the client router uses after hydration; it is
 * dynamic, so the prerenderer skips it.
 */
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "chatbots-multicanal", element: <ChatbotsMulticanal /> },
      { path: "agentes-telefonicos", element: <AgentesTelefonicos /> },
      { path: "contacto", element: <Contacto /> },
      { path: "politica-privacidad", element: <PoliticaPrivacidad /> },
      { path: "404", element: <NotFound /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
