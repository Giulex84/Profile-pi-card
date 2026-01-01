declare global {
  interface Window {
    Pi?: any;
  }
}

export const waitForPi = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const interval = setInterval(() => {
      if (window.Pi) {
        clearInterval(interval);
        resolve(window.Pi);
      }

      attempts++;
      if (attempts > 50) {
        clearInterval(interval);
        reject(new Error("Pi SDK not available"));
      }
    }, 100);
  });
};

export const initPi = async () => {
  const Pi = await waitForPi();
  Pi.init({ version: "2.0" });
  return Pi;
};

export const authenticatePi = async () => {
  const Pi = await initPi();
  const scopes = ["username"];
  const auth = await Pi.authenticate(scopes, () => {});
  return auth;
};
