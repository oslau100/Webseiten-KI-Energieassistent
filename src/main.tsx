import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeLoaderBootstrap } from "./lib/websiteRuntime";

initializeLoaderBootstrap();
createRoot(document.getElementById("root")!).render(<App />);
