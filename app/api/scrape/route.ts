import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl, scrapeUrls, ScrapeOptions } from "@/lib/hyperbrowser-scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, urls, format = "markdown" } = body as {
      url?: string;
      urls?: string[];
      format?: ScrapeOptions["format"];
    };

    // validate input
    if (!url && !urls) {
      return NextResponse.json(
        { error: "url or urls required" },
        { status: 400 }
      );
    }

    const options: ScrapeOptions = { format };

    // single url
    if (url) {
      const result = await scrapeUrl(url, options);
      return NextResponse.json(result);
    }

    // multiple urls
    const results = await scrapeUrls(urls!, options);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
