import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi } from "./pi";

type Activity = {
  id: string;
  title: string;
  category: string;
  notes?: string;
  date: string;
};

const CATEGORIES = [
  "App usage",
  "Community contribution",
  "Learning",
  "Testing",
  "Exploration",
  "Other",
];

export default function App() {
  const [piReady, setPiReady] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  /* ---------------- Pi SDK init ---------------- */
  useEffect(() => {
    try {
      initPiSdk();
      setPiReady(true);
    } catch {
      setPiReady(false);
    }
  }, []);

  /* ---------------- Load local data ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("pi_username");
    const storedActivities = localStorage.getItem("activities");

    if (storedUser) setUsername(storedUser);
    if (storedActivities) setActivities(JSON.parse(storedActivities));
  }, []);

  /* ---------------- Persist activities ---------------- */
  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  /* ---------------- Auth ---------------- */
  const connectPi = async () => {
    if (!piReady) return;
    try {
      setAuthenticating(true);
      const auth = await authenticatePi();
      if (auth?.user?.username) {
        setUsername(auth.user.username);
        localStorage.setItem("pi_username", auth.user.username);
      }
    } catch {
      alert("Pi authentication failed.");
    } finally {
      setAuthenticating(false);
    }
  };

  /* ---------------- Save activity ---------------- */
  const saveActivity = () => {
    if (!title || !category) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      title,
      category,
      notes,
      date: new Date().toISOString(),
    };

    setActivities([newActivity, ...activities]);
    setTitle("");
    setCategory("");
    setNotes("");
  };

  return (
    <main className="container">
      {/* HEADER */}
      <section className="card">
        <h1>Profile Pi Card</h1>
        <p className="subtitle">A private record of your Pi journey.</p>

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
      </section>

      {/* PROMPT */}
      {username && (
        <section className="card soft">
          <small className="muted">Today's prompt</small>
          <p className="prompt">
            Did you interact with a Pi app or feature recently?
          </p>
        </section>
      )}

      {/* ADD ACTIVITY */}
      {username && (
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

          <small className="muted">
            Your journal lives on this device only.
          </small>
        </section>
      )}

      {/* JOURNAL */}
      {username && (
        <section className="card">
          <h2>Your journal</h2>

          {activities.length === 0 ? (
            <p className="empty">
              Nothing here yet — and that’s okay.
              <br />
              Capture one small Pi activity today.
            </p>
          ) : (
            <ul className="list">
              {activities.map((a) => (
                <li key={a.id}>
                  <strong>{a.title}</strong>
                  <div className="meta">
                    {a.category} · {new Date(a.date).toLocaleString()}
                  </div>
                  {a.notes && <p>{a.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <button
          className="link"
          onClick={() => alert("Privacy Policy is available in-app.")}
        >
          Privacy
        </button>
        <button
          className="link"
          onClick={() => alert("Terms of Service are available in-app.")}
        >
          Terms
        </button>
      </footer>
    </main>
  );
}
