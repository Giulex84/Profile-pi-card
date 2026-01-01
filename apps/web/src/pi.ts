// apps/web/src/pi.ts

declare global {
  interface Window {
    Pi?: any;
  }
}

let initialized = false;

export function initPiSdk(): void {
  if (initialized) return;

  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (typeof window.Pi.init !== "function") {
    throw new Error("Pi.init not available");
  }

  window.Pi.init({
    version: "2.0",
    sandbox: false,
  });

  initialized = true;
}

export async function authenticatePi(): Promise<any> {
  if (!window.Pi || typeof window.Pi.authenticate !== "function") {
    throw new Error("Pi.authenticate not available");
  }

  return await window.Pi.authenticate(
    ["username", "payments"],
    {
      onIncompletePaymentFound: () => {},
    }
  );
}
