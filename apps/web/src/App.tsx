import PublicProfile from "./PublicProfile";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0" });
      setPiReady(true);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <h1>Profile Pi Card</h1>

      {!piReady && <p>Pi Browser required.</p>}

      {piReady && <PublicProfile />}
    </div>
  );
}
