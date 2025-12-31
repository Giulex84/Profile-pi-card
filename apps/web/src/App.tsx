import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    if (window.Pi) {
      setIsPiBrowser(true);
    }
  }, []);

  // 🔓 SEMPRE VISIBILE A TUTTI
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Profile Pi Card</h1>

      {/* Profilo pubblico: SEMPRE */}
      <PublicProfile />

      {/* Funzioni Pi: SOLO se Pi Browser */}
      {isPiBrowser && (
        <p style={{ marginTop: 20, color: "#666" }}>
          Pi Browser detected – advanced features enabled
        </p>
      )}
    </div>
  );
}
