import { useEffect, useState } from "react";

type Activity = {
  title: string;
  category: string;
  notes: string;
  date: string;
};

export default function App() {
  const [username, setUsername] = useState<string>("…");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("pi_username");
    if (storedUser) {
      setUsername(storedUser);
    } else {
      authenticate();
    }

    const storedJournal = localStorage.getItem("pi_journal");
    if (storedJournal) {
      setActivities(JSON.parse(storedJournal));
    }
  }, []);

  /* ---------- PI AUTH ---------- */
  async function authenticate() {
    if (!window.Pi) return;

    try {
      const auth = await window.Pi.authenticate(["username"], () => {});
      if (auth?.user?.username) {
        setUsername(auth.user.username);
        localStorage.setItem("pi_username", auth.user.username);
      }
    } catch {
      setUsername("PiUser");
    }
  }

  /* ---------- SAVE ---------- */
  function saveActivity() {
    if (!title || !category) return;

    const entry: Activity = {
      title,
      category,
      notes,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...activities];
    setActivities(updated);
    localStorage.setItem("pi_journal", JSON.stringify(updated));

    setTitle("");
    setCategory("");
    setNotes("");
  }

  return (
    <main className="container">
      {/* HEADER */}
      <section className="card hero">
        <h1>Profile Pi Card</h1>
        <p className="subtitle">
          A private, personal record of your Pi journey.
        </p>

        <div className="identity">
          <strong>@{username}</strong>
          <span>Pi identity connected</span>
        </div>

        <div className="quick-links">
          <button onClick={() => setShowPrivacy(true)}>Privacy</button>
          <button onClick={() => setShowTerms(true)}>Terms</button>
        </div>
      </section>

      {/* DAILY PROMPT */}
      <section className="card">
        <small className="label">Today’s prompt</small>
        <p className="prompt">
          Did you interact with a Pi app, feature, or community today?
        </p>
      </section>

      {/* PURPOSE */}
      <section className="card">
        <h2>Why this exists</h2>
        <p>
          Pi grows through small actions. Profile Pi Card helps you notice,
          remember, and reflect on how you explore the Pi ecosystem — one step
          at a time.
        </p>
      </section>

      {/* VALUE */}
      <section className="card">
        <h2>Your daily value</h2>
        <ul>
          <li>Build awareness of your Pi activity</li>
          <li>Create a personal learning trail</li>
          <li>Stay engaged without pressure</li>
        </ul>
      </section>

      {/* TRUST */}
      <section className="card trust">
        <h2>What this app does NOT do</h2>
        <p>
          No payments. No transfers. No tracking. No data leaves your device.
        </p>
      </section>

      {/* CAPTURE */}
      <section className="card">
        <h2>Capture activity</h2>

        <input
          placeholder="What did you do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">What kind of activity was this?</option>
          <option value="App usage">App usage</option>
          <option value="Learning">Learning</option>
          <option value="Community">Community</option>
          <option value="Exploration">Exploration</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          placeholder="Optional notes (why it mattered, what you learned…)”
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

      {/* JOURNAL */}
      <section className="card">
        <h2>Your journal</h2>

        {activities.length === 0 ? (
          <p className="empty">
            Nothing here yet — and that’s okay. Capture one small Pi activity
            today.
          </p>
        ) : (
          activities.map((a, i) => (
            <div key={i} className="entry">
              <strong>{a.title}</strong>
              <small>{a.category}</small>
              {a.notes && <p>{a.notes}</p>}
            </div>
          ))
        )}
      </section>

      {/* MODALS */}
      {showPrivacy && (
        <div className="modal">
          <h3>Privacy Policy</h3>
          <p>
            This app uses Pi authentication only to identify you. All journal
            entries are stored locally on your device. No data is shared.
          </p>
          <button onClick={() => setShowPrivacy(false)}>Close</button>
        </div>
      )}

      {showTerms && (
        <div className="modal">
          <h3>Terms of Service</h3>
          <p>
            Profile Pi Card is a personal journaling tool. It does not process
            payments, transfers, or settlements of any kind.
          </p>
          <button onClick={() => setShowTerms(false)}>Close</button>
        </div>
      )}
    </main>
  );
}
