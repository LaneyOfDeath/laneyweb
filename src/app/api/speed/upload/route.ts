export const runtime = "edge";

export async function POST(req: Request) {
  await req.arrayBuffer();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
