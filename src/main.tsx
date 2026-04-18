import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

// Attach device id to every PostgREST request so RLS policies can scope by device.
const deviceId = getDeviceId();
// @ts-expect-error - rest is the internal PostgrestClient; headers is a mutable record
supabase.rest.headers["x-device-id"] = deviceId;

createRoot(document.getElementById("root")!).render(<App />);
