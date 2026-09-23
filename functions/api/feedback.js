const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

const getAdminKey = (request) => {
  const header = request.headers.get("Authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return "";
};

const requireBindings = (env) => {
  if (!env.FEEDBACK_STORE) return "Missing FEEDBACK_STORE KV binding.";
  if (!env.ADMIN_KEY) return "Missing ADMIN_KEY secret.";
  return "";
};

export async function onRequestPost({ request, env }) {
  const bindingError = requireBindings(env);
  if (bindingError) return json({ error: bindingError }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const message = String(body.message || "").trim();
  if (!message) return json({ error: "Feedback message is required." }, 400);
  if (message.length > 2000) return json({ error: "Feedback message is too long." }, 400);

  const now = new Date().toISOString();
  const id = `${now}_${crypto.randomUUID()}`;
  const record = {
    id,
    message,
    language: String(body.language || "unknown").slice(0, 16),
    player: String(body.player || "Guest").slice(0, 80),
    page: String(body.page || "").slice(0, 160),
    userAgent: String(body.userAgent || request.headers.get("User-Agent") || "").slice(0, 240),
    ipCountry: request.cf?.country || "",
    createdAt: now
  };

  await env.FEEDBACK_STORE.put(`feedback:${id}`, JSON.stringify(record));
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const bindingError = requireBindings(env);
  if (bindingError) return json({ error: bindingError }, 503);
  if (getAdminKey(request) !== env.ADMIN_KEY) return json({ error: "Unauthorized." }, 401);

  const listed = await env.FEEDBACK_STORE.list({ prefix: "feedback:", limit: 100 });
  const records = await Promise.all(
    listed.keys.map(async (key) => {
      const value = await env.FEEDBACK_STORE.get(key.name, "json");
      return value;
    })
  );

  records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ feedback: records.filter(Boolean) });
}
