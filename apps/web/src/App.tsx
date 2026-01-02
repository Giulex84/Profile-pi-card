// apps/web/src/App.tsx

import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi, PiAuthPayload } from "./pi";

/* ---------- TYPES ---------- */

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

/* ---------- LEGAL TEXT ---------- */

const PRIVACY_TEXT = `
Profile Pi Card respects your privacy.

• Pi Authentication is used only to identify you.
• All activity entries are stored locally on your device.
• No data is shared automatically with third parties.
• No analytics or tracking systems are used.
• You can export or delete your data at any time.

Your data always remains under your control.
`;

const TERMS_TEXT = `
Profile Pi Card is a personal activity journal.

• The app does not provide payments, rewards, or compensation.
• Recorded activities have no financial or reputational value.
• The service is provided "as is", without warranties.
• You are responsible for the content you record.

By using this app, you agree to these terms.
`;

/* ---------- APP ---------- */

export default function App() {
  const [state, setState] = useState<AppState>("detecting");
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<PiAuthPayload | null>(null);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detectPi() {
      const timeoutMs = 3000;
      let elapsed = 0;

      while (elapsed < timeoutMs) {
        if ((window as any).Pi) {
          initPiSdk();
          if (!cancelled) setState("ready");
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
        elapsed += 100;
      }

      if (!cancelled) setState("pi-required");
    }

    detectPi();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin() {
    setState("authenticating");
    try {
      const payload = await authenticatePi();
      setAuth(payload);
      setState("authenticated");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setState("ready");
    }
  }

  if (state === "detecting") return <Centered>Detecting Pi Browser…</Centered>;
  if (state === "pi-required")
    return <Centered>Open this app inside Pi Browser.</Centered>;
  if (state === "error") return <Centered>{error}</Centered>;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>Profile Pi Card</h1>
        <p>Your personal Pi activity journal</p>
      </header>

      {state !== "authenticated" && (
        <button style={styles.primaryButton} onClick={handleLogin}>
          {state === "authenticating" ? "Connecting…" : "Connect with Pi"}
        </button>
      )}

      {state === "authenticated" && (
        <section style={styles.card}>
          <strong>@{auth?.user.username}</strong>
          <p>Pi identity connected</p>
        </section>
      )}

      {/* LEGAL MODALS */}
      {showPrivacy && (
        <LegalModal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          {PRIVACY_TEXT}
        </LegalModal>
      )}

      {showTerms && (
        <LegalModal title="Terms of Service" onClose={() => setShowTerms(false)}>
          {TERMS_TEXT}
        </LegalModal>
      )}

      {state === "authenticated" && (
        <footer style={styles.footer}>
          <button onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
          <button onClick={() => setShowTerms(true)}>Terms of Service</button>
        </footer>
      )}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function LegalModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: string;
  onClose: () => void;
}) {
  return (
    <div style={styles.modalBg}>
      <div style={styles.modal}>
        <h2>{title}</h2>
        <div style={styles.modalContent}>
          <pre style={styles.pre}>{children}</pre>
        </div>
        <button style={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function Centered({ children }: { children: any }) {
  return <div style={styles.centered}>{children}</div>;
}

/* ---------- STYLES ---------- */

const styles: any = {
  app: {
    minHeight: "100vh",
    background: "#0b0f1a",
    color: "#fff",
    padding: "1rem",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: { textAlign: "center", marginBottom: "1rem" },
  card: {
    background: "#141a2a",
    borderRadius: 14,
    padding: "1rem",
    marginBottom: "1rem",
  },
  primaryButton: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: 12,
    border: "none",
    background: "#facc15",
    fontWeight: 600,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "2rem",
    opacity: 0.8,
  },
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#141a2a",
    borderRadius: 14,
    padding: "1rem",
    maxWidth: 420,
    width: "90%",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  modalContent: {
    overflowY: "auto",
    marginBottom: "1rem",
  },
  pre: {
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    lineHeight: 1.4,
  },
  secondaryButton: {
    padding: "0.6rem",
    borderRadius: 12,
    border: "none",
    background: "#1f2937",
    color: "#fff",
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
