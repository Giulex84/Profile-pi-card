

import React from "react";

type Profile = {
  displayName: string;
  bio: string;
  published: boolean;
};

export default function ProfileEditor({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
}) {
  return (
    <div style={styles.editor}>
      <label style={styles.label}>
        Display name
        <input
          style={styles.input}
          value={profile.displayName}
          maxLength={30}
          onChange={(e) =>
            onChange({ ...profile, displayName: e.target.value })
          }
        />
      </label>

      <label style={styles.label}>
        Bio
        <textarea
          style={styles.textarea}
          value={profile.bio}
          maxLength={160}
          onChange={(e) =>
            onChange({ ...profile, bio: e.target.value })
          }
        />
      </label>

      <label style={styles.toggle}>
        <input
          type="checkbox"
          checked={profile.published}
          onChange={(e) =>
            onChange({ ...profile, published: e.target.checked })
          }
        />
        <span>Publish profile</span>
      </label>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  editor: {
    marginBottom: 24,
  },
  label: {
    display: "block",
    marginBottom: 12,
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: 8,
    marginTop: 4,
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: 8,
    marginTop: 4,
    fontSize: 14,
    minHeight: 80,
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  },
};
