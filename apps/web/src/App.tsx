import { useEffect, useMemo, useState } from "react";

type Activity = {
  id: string;
  title: string;
  category: string;
  notes?: string;
  createdAt: string;
};

const STORAGE_KEY = "pi_profile_activities";

const CATEGORIES = [
  "Pi App Usage",
  "Community",
  "Learning",
  "Testing",
  "Exploration",
  "Other",
];

const PROMPTS = [
  "Did you interact with a Pi app or feature today?",
  "Did you discover something new in the Pi ecosystem?",
  "Did you contribute to the Pi community recently?",
  "Did you test or explore a new Pi experience?",
  "What Pi-related activity stood out today?",
];

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [notes, setNotes] = useState("");

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const username =
    (window as any)?.Pi?.user?.username ?? "@PiUser";

  /* ---------- load persisted data ---------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setActivities(JSON.parse(stored));
    } catch {
      setActivities([]);
    }
  }, []);

  /* ---------- persist on change ---------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  /* ---------- daily prompt ---------- */
  const todayPrompt = useMemo(() => {
    const day = new Date().getDate();
    return PROMPTS[day % PROMPTS.length];
  }, []);

  /* ---------- handlers ---------- */
  function saveActivity() {
    if (!title.trim()) return;

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

    if (!finalCategory) return;

    setActivities((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category: finalCategory,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setTitle("");
    setCategory("");
    setCustomCategory("");
    setNotes("");
  }

  /* ---------- UI ---------- */
  return (
    <div className="app">
      <header className="card">
        <h1>Profile Pi Card</h1>
        <p className="subtitle">Your personal Pi activity journal</p>

        <div className="user-card">
          <strong>{username}</strong>
          <span>Pi identity connected</span>
        </div>
      </header>

      {/* Prompt */}
      <section className="card prompt">
        <small>Today's prompt</small>
        <p>{todayPrompt}</p>
      </section>

      {/* Add Activity */}
      <section className="card">
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

        {category === "Other" && (
          <input
            placeholder="Custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <textarea
          placeholder="Optional notes (why it mattered, what you learned…) "
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button onClick={saveActivity}>Save to journal</button>

        <p className="hint">
          Entries are stored locally on this device.
        </p>
      </section>

      {/* Activity list */}
      <section className="card">
        <h2>Your journal</h2>

        {activities.length === 0 ? (
          <p className="empty">
            Your journal is empty — start by capturing one small Pi activity.
            Consistency builds your personal Pi history.
          </p>
        ) : (
          <ul className="list">
            {activities.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong>
                <span>{a.category}</span>
                <small>
                  {new Date(a.createdAt).toLocaleString()}
                </small>
                {a.notes && <p>{a.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Footer */}
      <footer>
        <button onClick={() => setShowPrivacy(true)}>Privacy</button>
        <span>·</span>
        <button onClick={() => setShowTerms(true)}>Terms</button>
      </footer>

      {/* Privacy modal */}
      {showPrivacy && (
        <div className="modal">
          <div className="modal-content">
            <h3>Privacy Policy</h3>
            <p>
              Profile Pi Card respects your privacy.  
              Activities are stored locally on your device.
              No data is shared or transmitted.
            </p>
            <button onClick={() => setShowPrivacy(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms modal */}
      {showTerms && (
        <div className="modal">
          <div className="modal-content">
            <h3>Terms of Service</h3>
            <p>
              This app provides a personal journaling utility.
              It does not process payments, rewards, or settlements.
            </p>
            <button onClick={() => setShowTerms(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
