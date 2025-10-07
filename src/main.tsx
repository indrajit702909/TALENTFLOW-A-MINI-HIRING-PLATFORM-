import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { worker } from "./mocks/browser";
import { initializeDatabase } from "./lib/db";

// Initialize MSW and database
async function prepare() {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    await initializeDatabase();
  }
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
