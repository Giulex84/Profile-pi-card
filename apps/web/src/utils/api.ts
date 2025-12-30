// apps/web/src/utils/api.ts

export type ProfilePayload = {
  displayName: string;
  bio: string;
  published: boolean;
};

export async function saveProfileRemote(profile: ProfilePayload): Promise<string | null> {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.slug as string;
}

export async function loadPublicProfile(slug: string): Promise<ProfilePayload | null> {
  const res = await fetch(`/api/public/${slug}`);
  if (!res.ok) return null;
  return (await res.json()) as ProfilePayload;
}
