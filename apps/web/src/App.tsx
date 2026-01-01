useEffect(() => {
  let cancelled = false;

  async function detectPi() {
    const timeoutMs = 3000;
    const intervalMs = 100;
    let elapsed = 0;

    while (elapsed < timeoutMs) {
      if (typeof window !== "undefined" && (window as any).Pi) {
        try {
          initPiSdk();
          loadActions();
          if (!cancelled) setState("ready");
          return;
        } catch (err: any) {
          if (!cancelled) {
            setError(err.message || "Pi SDK init failed");
            setState("error");
          }
          return;
        }
      }

      await new Promise((r) => setTimeout(r, intervalMs));
      elapsed += intervalMs;
    }

    // Dopo timeout → davvero NON è Pi Browser
    if (!cancelled) {
      setState("pi-required");
    }
  }

  detectPi();

  return () => {
    cancelled = true;
  };
}, []);
