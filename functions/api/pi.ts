export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const { paymentId, action } = body;

  const PI_API_KEY = env.PI_API_KEY;

  const res = await fetch(
    `https://api.minepi.com/v2/payments/${paymentId}/${action}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
