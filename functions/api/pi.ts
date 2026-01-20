export async function onRequestPost({ request, env }: any) {
  try {
    const { paymentId, action } = await request.json();

    if (!paymentId || !action) {
      return new Response("Bad request", { status: 400 });
    }

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

    // ⚠️ NON ritorniamo il body al frontend
    if (!res.ok) {
      console.error("Pi API error", await res.text());
      return new Response("Pi API error", { status: 500 });
    }

    // ✅ SOLO QUESTO SERVE AL PI SDK
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Server error", err);
    return new Response("Server error", { status: 500 });
  }
}
