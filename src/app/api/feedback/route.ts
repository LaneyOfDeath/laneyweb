import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message, page } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "💬 New Feedback",
        description: message.trim(),
        color: 0x06b6d4,
        fields: page ? [{ name: "Page", value: page, inline: true }] : [],
        timestamp: new Date().toISOString(),
      }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Discord error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
