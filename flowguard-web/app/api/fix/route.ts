import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/v1/fix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Could not reach backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!backendRes.ok) {
    const text = await backendRes.text();
    return new Response(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await backendRes.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
