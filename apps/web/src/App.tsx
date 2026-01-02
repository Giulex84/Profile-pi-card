import React, { useEffect, useMemo, useRef, useState } from "react";
import { initPiSdk, authenticatePi, PiAuthPayload } from "./pi";

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

type ActivityType =
  | "Event participation"
  | "Community contribution"
  | "Learning"
  | "Testing / Feedback"
  | "Personal milestone"
  | "Other";

type Activity = {
  id: string;
  title: string;
  category: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

const STORAGE_KEY = "ppc_activities_v2";
const SETTINGS_KEY = "ppc_settings_v1";

const PRESET_CATEGORIES: ActivityType[] = [
  "Event participation",
  "Community contribution",
  "Learning",
  "Testing / Feedback",
  "Personal milestone",
  "Other",
];

/* ===== PROMPTS OTTIMIZZATI ===== */
const PROMPTS = [
  "What did you explore today in the Pi ecosystem?",
  "Did you interact with a Pi app or feature recently?",
  "What small progress did you make on your Pi journey?",
  "What did you learn or understand better today?",
  "Did you test, try, or review something related to Pi?",
  "What contribution or participation would you like to remember?",
  "What surprised you or caught your attention recently?",
  "What would you like your future self to remember about today?",
  "Did you take a step — even a small one — worth noting?",
  "What did you do today that connects you to Pi?",
];

const PRIVACY_TEXT = `Profile Pi Card respects your privacy.

• Pi Authentication is used only to identify you.
• Your journal entries are stored locally on your device.
• No data is shared automatically.
• No tracking or third-party analytics.
• You can export your data manually at any time.

Your data stays under your control.`;

const TERMS_TEXT = `Profile Pi Card is a personal journaling utility.

• No payments, rewards, or guarantees.
• Entries do not have financial or reputational value.
• The service is provided “as is”.
• You are responsible for the content you record.

By using this app, you agree to these terms.`;

/* ===== UTILS ===== */
function uid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function toDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ===== APP ===== */
export default function App() {
  const [state, setState] = useState<AppState>("detecting");
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<PiAuthPayload | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ActivityType | "">("");
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [hideOnboarding, setHideOnboarding] = useState(false);

  const didInit = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function detectPi() {
      setState("detecting");
      let elapsed = 0;

      while (elapsed < 3500) {
        if ((window as any).Pi) {
          try {
            if (!didInit.current) {
              initPiSdk();
              didInit.current = true;
            }

            setActivities(
              safeParse<Activity[]>(localStorage.getItem(STORAGE_KEY), [])
            );
            setHideOnboarding(
              safeParse<{ hideOnboarding?: boolean }>(
                localStorage.getItem(SETTINGS_KEY),
                {}
              ).hideOnboarding ?? false
            );

            if (!cancelled) setState("ready");
            return;
          } catch (e: any) {
            setError(e?.message || "Pi SDK init failed");
            setState("error");
            return;
          }
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ hideOnboarding })
    );
  }, [hideOnboarding]);

  const todaysPrompt = useMemo(() => {
    const key = toDayKey();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return PROMPTS[hash % PROMPTS.length];
  }, []);

  const connectWithPi = async () => {
    setState("authenticating");
    try {
      const payload = await authenticatePi();
      setAuth(payload);
      setState("authenticated");
      if (!hideOnboarding) setShowOnboarding(true);
    } catch (e: any) {
      setError(e?.message || "Authentication failed");
      setState("ready");
    }
  };

  const saveEntry = () => {
    const finalCategory =
      category === "Other" ? customCategory.trim() : category;
    if (!title.trim() || !finalCategory) return;

    const now = new Date().toISOString();

    if (editingId) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, title, category: finalCategory, note, updatedAt: now }
            : a
        )
      );
    } else {
      setActivities((prev) => [
        { id: uid(), title, category: finalCategory, note, createdAt: now },
        ...prev,
      ]);
    }

    setTitle("");
    setCategory("");
    setCustomCategory("");
    setNote("");
    setEditingId(null);
  };

  if (state === "detecting")
    return <Screen title="Detecting Pi Browser…" subtitle="Loading environment" />;

  if (state === "pi-required")
    return <Screen title="Pi Browser Required" subtitle="Open inside Pi Browser" />;

  if (state === "error")
    return <Screen title="Error" subtitle={error || "Unexpected error"} />;

  return (
    <div style={ui.shell}>
      {!auth && (
        <div style={ui.card}>
          <h1>Profile Pi Card</h1>
          <p style={ui.muted}>
            Your personal Pi activity journal — private and under your control.
          </p>
          <button style={ui.primaryBtn} onClick={connectWithPi}>
            {state === "authenticating" ? "Connecting…" : "Connect with Pi"}
          </button>
        </div>
      )}

      {auth && (
        <>
          <div style={ui.card}>
            <strong>@{auth.user.username}</strong>
            <p style={ui.muted}>Today’s prompt</p>
            <p><em>{todaysPrompt}</em></p>
          </div>

          <div style={ui.card}>
            <input
              style={ui.input}
              placeholder="What did you do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              style={ui.input}
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="">Choose category</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {category === "Other" && (
              <input
                style={ui.input}
                placeholder="Custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <textarea
              style={ui.textarea}
              placeholder="Optional notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button style={ui.primaryBtn} onClick={saveEntry}>
              Save to journal
            </button>
          </div>

          <div style={ui.footer}>
            <button style={ui.linkBtn} onClick={() => setShowPrivacy(true)}>Privacy</button>
            <span>·</span>
            <button style={ui.linkBtn} onClick={() => setShowTerms(true)}>Terms</button>
          </div>
        </>
      )}

      {showPrivacy && (
        <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <pre style={ui.legal}>{PRIVACY_TEXT}</pre>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <pre style={ui.legal}>{TERMS_TEXT}</pre>
        </Modal>
      )}
    </div>
  );
}

/* ===== SIMPLE UI ===== */

function Screen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={ui.shell}>
      <div style={ui.card}>
        <h2>{title}</h2>
        <p style={ui.muted}>{subtitle}</p>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={ui.overlay}>
      <div style={ui.modal}>
        <h3>{title}</h3>
        <div>{children}</div>
        <button style={ui.primaryBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const ui: any = {
  shell: { padding: 20, minHeight: "100vh", background: "#0b0f1a", color: "#fff" },
  card: { background: "#141a2b", padding: 16, borderRadius: 14, marginBottom: 16 },
  muted: { opacity: 0.7, fontSize: 14 },
  input: { width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 },
  textarea: { width: "100%", padding: 10, borderRadius: 10, minHeight: 60 },
  primaryBtn: { background: "#f5c518", border: "none", padding: "10px 14px", borderRadius: 12, fontWeight: 700 },
  linkBtn: { background: "none", border: "none", color: "#f5c518", fontWeight: 700 },
  footer: { textAlign: "center", marginTop: 12 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "#111", padding: 20, borderRadius: 14, maxWidth: 400, width: "90%" },
  legal: { whiteSpace: "pre-wrap", fontSize: 13 },
};
