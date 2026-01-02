import { useEffect, useState } from "react";

type Activity = {
  id: string;
  title: string;
  category: string;
  notes?: string;
  createdAt: string;
};

const CATEGORIES = [
  "App usage",
  "Community contribution",
  "Learning",
  "Testing / feedback",
  "Exploration",
  "Other",
];

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [prompt, setPrompt] = useState(
    "Did you interact with a Pi app or feature recently?"
  );

  /* ---------- Load local data ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("pi-journal-activities");
    if (stored) {
      setActivities(JSON.parse(stored));
    }

    if ((window as any).Pi?.user?.username) {
      setUsername((window as any).Pi.user.username);
    }
  }, []);

  /* ---------- Persist activities ---------- */
  useEffect(() => {
    localStorage.setItem(
      "pi-journal-activities",
      JSON.stringify(activities)
    );
  }, [activities]);

  /* ---------- Save activity ---------- */
  const saveActivity = () => {
    if (!title || !category) return;

    const entry: Activity = {
      id: crypto.randomUUID(),
      title,
      category,
      notes,
      createdAt: new Date().toISOString(),
    };

    setActivities([entry, ...activities]);
    setTitle("");
    setCategory("");
    setNotes("");
  };

  return (
    <div className="app">
      {/* ---------- HEADER ---------- */}
      <section className="card hero">
        <h1>Profile Pi Card</h1>
        <p className="subtitle">A private record of your Pi journey.</p>

        <div className="identity">
          <strong>@{username ?? "PiUser"}</strong>
          <span>Pi identity connected</span>
        </div>
      </section>

      {/* ---------- PROMPT ---------- */}
      <section className="card">
        <small className="label">Today’s prompt</small>
        <p className="prompt">{prompt}</p>
      </section>

      {/* ---------- WHY THIS MATTERS (MICROSECTION #1) ---------- */}
      <section className="card soft">
        <h3>Why keep a Pi journal?</h3>
        <p>
          Small actions matter. By capturing your activity inside the Pi
          ecosystem, you build a personal record of learning, exploration, and
          contribution — over time.
        </p>
      </section>

      {/* ---------- CAPTURE ACTIVITY ---------- */}
      <section className="card">
        <h2>Capture activity</h2>

        <input
          placeholder="What did you do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">What kind of activity was this?</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Optional notes (why it mattered, what you learned...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="primary" onClick={saveActivity}>
          Save to Pi journal
        </button>

        <small className="hint">
          Your journal lives on this device only.
        </small>
      </section>

      {/* ---------- GROWTH INDICATOR (MICROSECTION #2) ---------- */}
      <section className="card soft">
        <strong>
          {activities.length === 0
            ? "You haven’t logged any Pi activities yet."
            : `You’ve logged ${activities.length} Pi ${
                activities.length === 1 ? "activity" : "activities"
              }.`}
        </strong>
      </section>

      {/* ---------- JOURNAL ---------- */}
      <section className="card">
        <h2>Your journal</h2>

        {activities.length === 0 ? (
          <p className="empty">
            Nothing here yet — and that’s okay.
            <br />
            Capture one small Pi activity today.
          </p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="entry">
              <strong>{a.title}</strong>
              <span className="meta">
                {a.category} ·{" "}
                {new Date(a.createdAt).toLocaleString()}
              </span>
              {a.notes && <p>{a.notes}</p>}
            </div>
          ))
        )}
      </section>

      {/* ---------- ROADMAP (MICROSECTION #3) ---------- */}
      <section className="card soft">
        <small>
          Future updates may include insights, trends, and optional exports.
          <br />
          This app intentionally starts simple.
        </small>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    </div>
  );
}
