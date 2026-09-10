import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

// At build time vite-react-ssg calls this in Node to render each route to
// static HTML; in the browser it hydrates that HTML instead of rendering from
// an empty #root. Same routes, same providers, both paths.
export const createRoot = ViteReactSSG({ routes });
