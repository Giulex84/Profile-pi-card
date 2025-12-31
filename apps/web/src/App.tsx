import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [piReady, setPiReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Non blocchiamo MAI la UI
    if (window.Pi) {
      try {
        window.Pi.init({ version: "2.0" });
        setPiReady(true);
      } catch (e) {
        console.warn("Pi SDK present but init failed", e);
      }
    }
    setChecked(true);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        fontFamily: "system-ui",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>
        Profile Pi Card
      </h1>

      <p style={{ fontSize: 18, opacity: 0.8 }}>
        Public profile loaded successfully.
      </p>

      {/* Contenuto SEMPRE visibile */}
      <PublicProfile />

      {/* Stato Pi Browser (non bloccante) */}
      {checked && (
        <p
          style={{
            marginTop: 32,
            fontSize: 14,
            opacity: 0.6,
          }}
        >
          {piReady
            ? "Connected via Pi Browser"
            : "Pi Browser not detected — public mode"}
        </p>
      )}
    </main>
  );
}
