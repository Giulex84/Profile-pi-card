// apps/web/src/utils/api.ts

export type ProfilePayload = {
  displayName: string;
  bio: string;
  published: boolean;
};

export async function saveProfileRemote(profile: ProfilePayload): Promise<void> {
  await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
}

export async function loadPublicProfile(slug: string): Promise<ProfilePayload | null> {
  const res = await fetch(`/api/public/${slug}`);
  if (!res.ok) return null;
  return (await res.json()) as ProfilePayload;
}
