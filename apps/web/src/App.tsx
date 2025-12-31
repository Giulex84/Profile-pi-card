import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      if (window.Pi && typeof window.Pi.init === "function") {
        try {
          window.Pi.init({ version: "2.0" });
          setIsPiBrowser(true);
        } catch {
          setIsPiBrowser(false);
        }
      } else {
        setIsPiBrowser(false);
      }
      setReady(true);
    };

    // small delay to allow Pi Browser injection
    setTimeout(check, 300);
  }, []);

  if (!ready) {
    return (
      <div style={centerStyle}>
        Loading...
      </div>
    );
  }

  if (!isPiBrowser) {
    return (
      <div style={centerStyle}>
        Pi Browser not detected.
      </div>
    );
  }

  return <PublicProfile />;
}

const centerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  fontSize: "18px",
};
