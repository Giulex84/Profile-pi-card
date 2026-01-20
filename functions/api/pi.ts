export async function onRequestPost({ request, env }) {
  try {
    // Parse request body
    const body = await request.json();
    const { paymentId, action } = body;

    // Basic validation
    if (!paymentId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing paymentId or action" }),
        { status: 400 }
      );
    }

    // Allow only valid Pi actions
    const allowedActions = ["approve", "complete", "cancel"];
    if (!allowedActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400 }
      );
    }

    // Read API key from Cloudflare environment variables
    const PI_API_KEY = env.PI_API_KEY;
    if (!PI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "PI_API_KEY not configured" }),
        { status: 500 }
      );
    }

    // Call Pi API
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

    // Handle Pi API errors
    if (!res.ok) {
      console.error("Pi API error:", data);
      return new Response(
        JSON.stringify({
          error: "Pi API error",
          details: data,
        }),
        { status: res.status }
      );
    }

    // Success
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
