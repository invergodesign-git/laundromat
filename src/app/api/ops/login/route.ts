import {
  expectedSessionToken,
  OPS_COOKIE,
  OPS_SESSION_MAX_AGE_SEC,
  passwordMatches,
} from "@/lib/ops/auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(password)) {
    return Response.json({ error: "That password is not right." }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${OPS_COOKIE}=${expectedSessionToken()}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${OPS_SESSION_MAX_AGE_SEC}`,
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ")
  );
  return response;
}
