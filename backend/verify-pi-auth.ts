// backend/verify-pi-auth.ts

import fetch from "node-fetch";

const PI_API_URL = "https://api.minepi.com/v2/me";
const PI_APP_SECRET = process.env.PI_APP_SECRET!;

export type VerifiedPiUser = {
  uid: string;
  username: string;
};

export async function verifyPiAuth(
  accessToken: string
): Promise<VerifiedPiUser> {
  const res = await fetch(PI_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Pi-App-Secret": PI_APP_SECRET,
    },
  });

  if (!res.ok) {
    throw new Error("Invalid Pi access token");
  }

  const data = await res.json();

  return {
    uid: data.uid,
    username: data.username,
  };
}
