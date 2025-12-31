import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      setIsPiBrowser(true);
      window.Pi.init({ version: "2.0" });
      setReady(true);
    } else {
      setIsPiBrowser(false);
    }
  }, []);

  if (!isPiBrowser) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Pi Browser not detected.
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Loading...
      </div>
    );
  }

  return <PublicProfile />;
}
