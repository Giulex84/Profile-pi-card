import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

export default function App() {
  const [status, setStatus] = useState<"loading" | "ok" | "nopi">("loading");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    const isPiUA =
      ua.includes("pibrowser") ||
      ua.includes("pi browser") ||
      ua.includes("pi-network");

    if (isPiUA) {
      setStatus("ok");
      return;
    }

    // fallback: wait a bit for injected SDK
    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      if ((window as any).Pi) {
        setStatus("ok");
        clearInterval(interval);
      }
      if (tries > 10) {
        setStatus("nopi");
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Loading...
      </div>
    );
  }

  if (status === "nopi") {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Pi Browser not detected.
      </div>
    );
  }

  return <PublicProfile />;
}
