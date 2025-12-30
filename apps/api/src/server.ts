// apps/api/src/server.ts

import express from "express";
import cors from "cors";

type Profile = {
  displayName: string;
  bio: string;
  published: boolean;
};

const app = express();
app.use(cors());
app.use(express.json());

const store = new Map<string, Profile>();

function slugFromProfile(profile: Profile): string {
  const base = `${profile.displayName}-${profile.bio}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

app.post("/api/profile", (req, res) => {
  const profile = req.body as Profile;

  if (
    !profile ||
    typeof profile.displayName !== "string" ||
    typeof profile.bio !== "string" ||
    typeof profile.published !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid profile payload" });
  }

  const slug = slugFromProfile(profile);
  store.set(slug, profile);

  res.status(200).json({ slug });
});

app.get("/api/public/:slug", (req, res) => {
  const slug = req.params.slug;
  const profile = store.get(slug);

  if (!profile || !profile.published) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.json(profile);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
