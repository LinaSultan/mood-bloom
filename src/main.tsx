import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

// Attach device id to every Supabase request so RLS can scope by device.
const deviceId = getDeviceId();

// PostgREST (database) requests
type HeaderBag = Record<string, string>;
const restClient = (supabase as unknown as { rest: { headers: HeaderBag } }).rest;
restClient.headers = { ...restClient.headers, "x-device-id": deviceId };

// Storage / Functions requests share the global headers bag
const internal = supabase as unknown as { headers?: HeaderBag };
internal.headers = { ...(internal.headers ?? {}), "x-device-id": deviceId };

// Wrap window.fetch so any direct call to our Supabase project carries the header
const SUPABASE_HOST = new URL(import.meta.env.VITE_SUPABASE_URL).host;
const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;
    if (url.includes(SUPABASE_HOST)) {
      const headers = new Headers(init?.headers ?? (typeof input !== "string" && !(input instanceof URL) ? input.headers : undefined));
      if (!headers.has("x-device-id")) headers.set("x-device-id", deviceId);
      return originalFetch(input, { ...init, headers });
    }
  } catch {
    /* fall through */
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
