import { useEffect, useState } from "react";
import ProofGenerator from "./ProofGenerator";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function App() {
  const [status, setStatus] = useState<
    "checking" | "not_pi" | "auth" | "ready"
  >("checking");
  const [user, setUser] = useState<{
    uid: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    if (!window.Pi) {
      setStatus("not_pi");
      return;
    }

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
      setStatus("not_pi");
    }
  }, []);

  if (status === "checking") {
    return <Center>Initializing Pi…</Center>;
  }

  if (status === "not_pi") {
    return (
      <Center>
        <h2>Pi Browser Required</h2>
        <p>This utility works exclusively inside the Pi Browser.</p>
      </Center>
    );
  }

  if (status === "auth") {
    return (
      <Center>
        <h2>Authentication required</h2>
        <p>Please authorize with your Pi account.</p>
      </Center>
    );
  }

  if (!user) {
    return null;
  }

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
