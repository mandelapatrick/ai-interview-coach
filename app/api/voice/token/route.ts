import { NextResponse } from "next/server";

export async function POST() {
  // Return the WebSocket URL and auth details for client connection
  // Note: In production, implement proper rate limiting and session management
  return NextResponse.json({
    url: "wss://api.x.ai/v1/realtime",
    apiKey: process.env.XAI_API_KEY,
    model: "grok-2-public",
  });
}
