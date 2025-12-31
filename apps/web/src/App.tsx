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
    const checkPi = () => {
      if (window.Pi) {
        setIsPiBrowser(true);
        setReady(true);
      }
    };

    checkPi();
    const interval = setInterval(checkPi, 300);

    setTimeout(() => {
      clearInterval(interval);
      setReady(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!ready) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>;
  }

  if (!isPiBrowser) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Pi Browser not detected.
      </div>
    );
  }

  return <PublicProfile />;
}
