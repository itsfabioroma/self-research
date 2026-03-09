import { NextRequest, NextResponse } from "next/server";
import { createLiveScrape, stopSession } from "@/lib/hyperbrowser-scraper";

// POST: create live scraping session
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const result = await createLiveScrape(url);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Live scrape error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create live session" },
      { status: 500 }
    );
  }
}

// DELETE: stop a session
export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    await stopSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Stop session error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to stop session" },
      { status: 500 }
    );
  }
}
