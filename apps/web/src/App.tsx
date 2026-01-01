import { useEffect, useState } from "react";
import ProofGenerator from "./ProofGenerator";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [status, setStatus] = useState<
    "loading" | "auth" | "ready"
  >("loading");

  const [user, setUser] = useState<{
    uid: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    let attempts = 0;

    const waitForPi = () => {
      attempts++;

      if (window.Pi) {
        try {
          window.Pi.init({ version: "2.0" });

          window.Pi.authenticate(
            ["username"],
            (auth: any) => {
              setUser({
                uid: auth.user.uid,
                username: auth.user.username,
              });
              setStatus("ready");
            },
            () => {
              setStatus("auth");
            }
          );
        } catch {
          setStatus("auth");
        }

        return;
      }

      // wait up to ~5 seconds for Pi SDK injection
      if (attempts < 50) {
        setTimeout(waitForPi, 100);
      } else {
        setStatus("auth");
      }
    };

    waitForPi();
  }, []);

  if (status === "loading") {
    return <Center>Initializing Pi Browser…</Center>;
  }

  if (status === "auth") {
    return (
      <Center>
        <h2>Waiting for Pi authentication</h2>
        <p>Please make sure you opened this inside the Pi Browser.</p>
      </Center>
    );
  }

  if (!user) return null;

  return <ProofGenerator user={user} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      {children}
    </div>
  );
}
