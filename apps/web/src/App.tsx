// apps/web/src/App.tsx

import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi, PiAuthPayload } from "./pi";

/* ---------------- TYPES ---------------- */

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

type ActivityType =
  | "event"
  | "task"
  | "community"
  | "beta"
  | "identity"
  | "supporter"
  | "custom";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

/* ---------------- CONSTANTS ---------------- */

const STORAGE_KEY = "pi_activity_journal";
const LEGAL_SEEN_KEY = "pi_legal_seen_v1";

/* ---------------- LEGAL TEXT ---------------- */

const PRIVACY_TEXT = `
Profile Pi Card respects your privacy.

• The app uses Pi Authentication only to identify you.
• Activities are stored locally on your device.
• No data is shared automatically.
• No third-party tracking is used.
• You can export your data manually at any time.

Your data always remains under your control.
`;

const TERMS_TEXT = `
Profile Pi Card is a personal utility.

• The app provides no rewards or payments.
• Activities have no financial or reputational value.
• The service is provided "as is".
• You are responsible for the content you record.

By using this app, you agree to these terms.
`;

/* ---------------- HELPERS ---------------- */

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ---------------- APP ---------------- */

export default function App() {
  const [state, setState] = useState<AppState>("detecting");
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<PiAuthPayload | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLegalIntro, setShowLegalIntro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detectPi() {
      const timeoutMs = 3000;
      let elapsed = 0;

      while (elapsed < timeoutMs) {
        if ((window as any).Pi) {
          initPiSdk();
          loadActivities();
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

  function loadActivities() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setActivities(JSON.parse(raw));
  }

  async function handleLogin() {
    setState("authenticating");
    try {
      const payload = await authenticatePi();
      setAuth(payload);
      setState("authenticated");

      if (!localStorage.getItem(LEGAL_SEEN_KEY)) {
        setShowLegalIntro(true);
        localStorage.setItem(LEGAL_SEEN_KEY, "true");
      }
    } catch (err: any) {
      setError(err.message);
      setState("ready");
    }
  }

  if (state === "detecting") return <Centered>Detecting Pi Browser…</Centered>;
  if (state === "pi-required")
    return <Centered>Open this app inside Pi Browser.</Centered>;
  if (state === "error") return <Centered>{error}</Centered>;

  return (
    <div style={styles.app}>
      <h1>Profile Pi Card</h1>
      <p>Your personal Pi activity journal</p>

      {state !== "authenticated" && (
        <button onClick={handleLogin}>Connect with Pi</button>
      )}

      {showLegalIntro && (
        <Modal onClose={() => setShowLegalIntro(false)}>
          <h2>Privacy & Terms</h2>
          <p>
            This app is a personal utility. Privacy Policy and Terms of Service
            are available inside the app at any time.
          </p>
          <button onClick={() => setShowLegalIntro(false)}>Continue</button>
        </Modal>
      )}

      {showPrivacy && (
        <Modal onClose={() => setShowPrivacy(false)}>
          <h2>Privacy Policy</h2>
          <pre>{PRIVACY_TEXT}</pre>
        </Modal>
      )}

      {showTerms && (
        <Modal onClose={() => setShowTerms(false)}>
          <h2>Terms of Service</h2>
          <pre>{TERMS_TEXT}</pre>
        </Modal>
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

/* ---------------- UI ---------------- */

function Modal({ children, onClose }: any) {
  return (
    <div style={styles.modalBg}>
      <div style={styles.modal}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function Centered({ children }: any) {
  return <div style={styles.centered}>{children}</div>;
}

const styles: any = {
  app: { padding: 16, color: "#fff", background: "#0b0f1a", minHeight: "100vh" },
  footer: { marginTop: 32, display: "flex", gap: 12 },
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#141a2a",
    padding: 16,
    borderRadius: 12,
    maxWidth: 420,
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
