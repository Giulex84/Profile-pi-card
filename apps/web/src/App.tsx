import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    let attempts = 0;

    const waitForPi = () => {
      attempts++;

      if (window.Pi && typeof window.Pi.init === "function") {
        try {
          window.Pi.init({ version: "2.0" });
          setPiReady(true);
          return;
        } catch {
          // ignore
        }
      }

      if (attempts < 10) {
        setTimeout(waitForPi, 300);
      }
    };

    waitForPi();
  }, []);

  return (
    <div style={wrapper}>
      {!piReady && (
        <div style={warning}>
          Pi Browser initializing…
        </div>
      )}

      <PublicProfile />
    </div>
  );
}

const wrapper: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const warning: React.CSSProperties = {
  textAlign: "center",
  padding: "12px",
  fontSize: "14px",
  opacity: 0.6,
};
