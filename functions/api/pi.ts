export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { paymentId, action } = body;

    if (!paymentId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing paymentId or action" }),
        { status: 400 }
      );
    }

    const PI_API_KEY = env.PI_API_KEY;

    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Pi API error:", data);
      return new Response(
        JSON.stringify({ error: "Pi API error", details: data }),
        { status: res.status }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
