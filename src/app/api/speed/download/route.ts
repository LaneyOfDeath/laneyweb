export const runtime = "edge";

const CHUNK_SIZE = 65536; // 64 KB
const CHUNKS = 64;        // 64 × 64 KB = 4 MB

export async function GET() {
  const chunk = new Uint8Array(CHUNK_SIZE);
  let sent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= CHUNKS) { controller.close(); return; }
      controller.enqueue(chunk);
      sent++;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(CHUNK_SIZE * CHUNKS),
      "Cache-Control": "no-store",
    },
  });
}
