import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

type Activity = {
  id: string;
  title: string;
  category: string;
  notes?: string;
  date: string;
};

const STORAGE_KEY = "pi_journal_entries";
const USERNAME_KEY = "pi_username";

const CATEGORIES = [
  "App usage",
  "Community contribution",
  "Learning",
  "Testing / Feedback",
  "Governance",
  "Other"
];

export default function App() {
  const [piReady, setPiReady] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(USERNAME_KEY)
  );

  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  // ---- Pi SDK init (ONCE) ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.Pi) return;

    try {
      window.Pi.init({ version: "2.0", sandbox: false });
      setPiReady(true);
    } catch (e) {
      console.error("Pi init failed", e);
    }
  }, []);

  // ---- Persist journal ----
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  // ---- Connect Pi ----
  async function connectPi() {
    if (!window.Pi) return;
    setAuthenticating(true);

    try {
      const auth = await window.Pi.authenticate(
        ["username"],
        { onIncompletePaymentFound: () => {} }
      );

      if (auth?.user?.username) {
        setUsername(auth.user.username);
        localStorage.setItem(USERNAME_KEY, auth.user.username);
      }
    } catch (e) {
      console.error("Authentication error", e);
    } finally {
      setAuthenticating(false);
    }
  }

  // ---- Add activity ----
  function saveActivity() {
    if (!title || !category) return;

    const entry: Activity = {
      id: crypto.randomUUID(),
      title,
      category,
      notes,
      date: new Date().toISOString()
    };

    setActivities([entry, ...activities]);
    setTitle("");
    setCategory("");
    setNotes("");
  }

  const todayPrompt =
    activities.length === 0
      ? "Did you interact with a Pi app or feature recently?"
      : "Did you contribute to the Pi community today?";

  // ---- UI ----
  return (
    <div className="container">
      {/* HEADER */}
      <div className="card">
        <h1>Profile Pi Card</h1>
        <p className="subtitle">Your personal Pi activity journal</p>

        <div className="user-card">
          <strong>@{username ?? "PiUser"}</strong>
          <div className="status">
            {username ? "Pi identity connected" : "Not connected"}
          </div>
        </div>

        {!username && piReady && (
          <button
            className="primary"
            onClick={connectPi}
            disabled={authenticating}
          >
            {authenticating ? "Connecting…" : "Connect with Pi"}
          </button>
        )}
      </div>

      {/* PROMPT */}
      {username && (
        <div className="card">
          <small className="muted">Today's prompt</small>
          <p className="prompt">{todayPrompt}</p>
        </div>
      )}

      {/* ADD ACTIVITY */}
      {username && (
        <div className="card">
          <h2>Add activity</h2>

          <input
            placeholder="What did you do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Optional notes (why it mattered, what you learned…)”
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button className="primary" onClick={saveActivity}>
            Save to journal
          </button>

          <small className="muted">
            Entries are stored locally on this device.
          </small>
        </div>
      )}

      {/* JOURNAL */}
      {username && (
        <div className="card">
          <h2>Your journal</h2>

          {activities.length === 0 && (
            <p className="empty">
              Your journal is empty — start by capturing one small Pi activity.
              Consistency builds your personal Pi history.
            </p>
          )}

          {activities.map((a) => (
            <div key={a.id} className="entry">
              <strong>{a.title}</strong>
              <div className="meta">
                {a.category} ·{" "}
                {new Date(a.date).toLocaleDateString()}
              </div>
              {a.notes && <p>{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <button onClick={() => alert("Privacy Policy:\n\nAll data stays on your device.\nNo data is shared or tracked.")}>
          Privacy
        </button>
        <button onClick={() => alert("Terms of Service:\n\nThis app records personal activity only.\nNo payments. No guarantees.")}>
          Terms
        </button>
      </footer>
    </div>
  );
}
