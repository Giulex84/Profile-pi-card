// apps/web/src/utils/storage.ts

export type StoredProfile = {
  displayName: string;
  bio: string;
  published: boolean;
};

const STORAGE_KEY = "pi_profile_card_profile";

export function loadProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StoredProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}
