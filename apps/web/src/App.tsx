import { useEffect, useState } from "react";

type Activity = {
  title: string;
  category: string;
  notes: string;
  date: string;
};

function buildNarrativeTimeline(activities: Activity[]): string[] {
  if (activities.length === 0) {
    return [
      "Your Pi journey hasn’t been recorded yet.",
      "Small actions matter. Start by capturing one activity."
    ];
  }

  const days = new Set(
    activities.map(a => new Date(a.date).toDateString())
  );

  const categories = new Set(
    activities.map(a => a.category)
  );

  const timeline: string[] = [];

  timeline.push(
    `You’ve been active on ${days.size} different day${
      days.size > 1 ? "s" : ""
    } inside the Pi ecosystem.`
  );

  if (categories.size > 1) {
    timeline.push(
      `Your activity spans ${categories.size} different areas of Pi.`
    );
  } else {
    timeline.push(
      `You’ve focused consistently on one area of Pi so far.`
    );
  }

  if (activities.length >= 5) {
    timeline.push(
      "Consistency is building. Your Pi activity history is taking shape."
    );
  } else {
    timeline.push(
      "Every entry adds clarity to your personal Pi path."
    );
  }

  return timeline;
}

export default function App() {
  const [username, setUsername] = useState<string>("PiUser");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("pi_username");
    if (storedUser) setUsername(storedUser);

    const storedJournal = localStorage.getItem("pi_journal");
    if (storedJournal) setActivities(JSON.parse(storedJournal));
  }, []);

  /* ---------- PI AUTH (USER ACTION) ---------- */
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

  /* ---------- SAVE ACTIVITY ---------- */
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

  const timeline = buildNarrativeTimeline(activities);

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
          <button onClick={authenticate}>Refresh identity</button>
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

      {/* NARRATIVE TIMELINE */}
      <section className="card soft">
        <h2>Your Pi timeline</h2>
        {timeline.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
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

      {/* JOURNAL */}
      <section className="card">
        <h2>Your journal</h2>

        {activities.length === 0 ? (
          <p className="empty">
            Nothing here yet — and that’s okay.
            Capture one small Pi activity today.
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

      {/* PRIVACY */}
      {showPrivacy && (
        <div className="modal">
          <h3>Privacy Policy</h3>
          <p>
            This app uses Pi authentication only to identify you.
            All data is stored locally on your device.
            No tracking. No sharing.
          </p>
          <button onClick={() => setShowPrivacy(false)}>Close</button>
        </div>
      )}

      {/* TERMS */}
      {showTerms && (
        <div className="modal">
          <h3>Terms of Service</h3>
          <p>
            Profile Pi Card is a personal journaling tool.
            It does not process payments, transfers, or settlements.
          </p>
          <button onClick={() => setShowTerms(false)}>Close</button>
        </div>
      )}
    </main>
  );
}
