// backend/api.ts

import { verifyPiAuth } from "./verify-pi-auth";

export async function handler(req: any, res: any) {
  try {
    const { accessToken, proofs } = req.body;

    const user = await verifyPiAuth(accessToken);

    // 💰 qui puoi:
    // - salvare proofs
    // - calcolare reputation
    // - vendere verification

    res.json({
      ok: true,
      user,
      proofsCount: proofs.length,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      ok: false,
      error: err.message,
    });
  }
}
