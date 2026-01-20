// Memoria globale (sufficiente per testnet / review)
const paymentState = new Map<string, "approved" | "completed">();

export async function onRequestPost({ request, env }: any) {
  try {
    const { paymentId, action } = await request.json();

    if (!paymentId || !action) {
      return new Response("Bad request", { status: 400 });
    }

    console.log("PI CALLBACK", paymentId, action);

    const current = paymentState.get(paymentId);

    // ⛔ BLOCCO DUPLICATI
    if (action === "approve" && current) {
      console.log("Already approved:", paymentId);
      return new Response("OK", { status: 200 });
    }

    if (action === "complete" && current === "completed") {
      console.log("Already completed:", paymentId);
      return new Response("OK", { status: 200 });
    }

    // 🔗 Chiamata ufficiale Pi API
    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("Pi API error:", txt);
      return new Response("Pi API error", { status: 500 });
    }

    // 🧠 Salva stato
    if (action === "approve") {
      paymentState.set(paymentId, "approved");
    }
    if (action === "complete") {
      paymentState.set(paymentId, "completed");
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Server error:", err);
    return new Response("Server error", { status: 500 });
  }
}
