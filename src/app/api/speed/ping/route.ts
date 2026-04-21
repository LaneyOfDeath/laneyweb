export const runtime = "edge";

export async function GET() {
  return new Response("pong", {
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}
