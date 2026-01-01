declare global {
  interface Window {
    Pi?: any;
  }
}

export const isPiBrowser = () => {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
};

export const authenticatePi = async () => {
  if (!window.Pi) throw new Error("Pi SDK not available");

  const scopes = ["username"];
  const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
  return auth;
};

const onIncompletePaymentFound = (payment: any) => {
  console.warn("Incomplete payment found", payment);
};
