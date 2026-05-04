import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model_name = searchParams.get("model_name") || "gpt-4.1-mini";
  const bug_type = searchParams.get("bug_type") || "dbz";

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ detail: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const code = await file.text();
  const extension = (file.name || "snippet.java").split(".").pop() || "java";

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/v1/analyze`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        language: extension,
        model: model_name,
        bug_type,
      }),
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Could not reach backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!backendRes.ok || !backendRes.body) {
    return new Response(JSON.stringify({ detail: "Backend error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { readable, writable } = new TransformStream();
  backendRes.body.pipeTo(writable);

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache",
    },
  });
}
