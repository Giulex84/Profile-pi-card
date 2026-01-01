// apps/web/src/pi.ts

declare global {
  interface Window {
    Pi?: any;
  }
}

let initialized = false;

export function isPiBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
}

export function initPiSdk(): void {
  if (!isPiBrowser()) {
    throw new Error("Pi SDK not found");
  }

  if (initialized) return;

  try {
    // Pi SDK auto-initializes in Pi Browser
    initialized = true;
  } catch (err) {
    console.error("Pi SDK init error:", err);
    throw err;
  }
}

export async function authenticatePi(): Promise<any> {
  if (!isPiBrowser()) {
    throw new Error("Pi Browser required");
  }

  if (typeof window.Pi.authenticate !== "function") {
    throw new Error("Pi.authenticate() not available");
  }

  try {
    const authResult = await window.Pi.authenticate(
      ["username", "payments"],
      {
        onIncompletePaymentFound: () => {
          console.warn("Incomplete payment found");
        },
      }
    );

    return authResult;
  } catch (err: any) {
    console.error("Pi authentication failed:", err);
    throw err;
  }
}
