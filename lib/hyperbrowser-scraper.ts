import { Hyperbrowser } from "@hyperbrowser/sdk";

// Hyperbrowser client singleton
let client: Hyperbrowser | null = null;

export function getClient(): Hyperbrowser {
  if (!client) {
    if (!process.env.HYPERBROWSER_API_KEY) {
      throw new Error("HYPERBROWSER_API_KEY env var required");
    }
    client = new Hyperbrowser({
      apiKey: process.env.HYPERBROWSER_API_KEY,
    });
  }
  return client;
}

// Scrape result type
export interface ScrapeResult {
  url: string;
  title?: string;
  markdown?: string;
  html?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

// Scrape options
export interface ScrapeOptions {
  // output format
  format?: "markdown" | "html" | "both";

  // wait for specific selector before scraping
  waitForSelector?: string;

  // custom timeout in ms
  timeout?: number;
}

/**
 * Scrape a single URL using Hyperbrowser
 */
export async function scrapeUrl(
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResult> {
  const { format = "markdown" } = options;

  try {
    const hb = getClient();

    // use built-in scrape API
    const result = await hb.scrape.startAndWait({ url });

    return {
      url,
      title: result.data?.metadata?.title as string | undefined,
      markdown: format !== "html" ? result.data?.markdown : undefined,
      html: format !== "markdown" ? result.data?.html : undefined,
      metadata: result.data?.metadata as Record<string, unknown> | undefined,
    };
  } catch (err) {
    return {
      url,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeUrls(
  urls: string[],
  options: ScrapeOptions = {}
): Promise<ScrapeResult[]> {
  return Promise.all(urls.map((url) => scrapeUrl(url, options)));
}

// Session-based scraping for complex flows
export interface SessionOptions {
  acceptCookies?: boolean;
  viewOnly?: boolean;
}

// Live session result
export interface LiveSession {
  id: string;
  wsEndpoint: string;
  liveUrl: string;
  stop: () => Promise<void>;
}

// track active session to ensure cleanup
let activeSessionId: string | null = null;

/**
 * Create a Hyperbrowser session for complex scraping flows
 * Returns session object with wsEndpoint for Puppeteer/Playwright connection
 */
export async function createSession(options: SessionOptions = {}): Promise<LiveSession> {
  const hb = getClient();
  const session = await hb.sessions.create({
    acceptCookies: options.acceptCookies ?? true,
    viewOnlyLiveView: options.viewOnly ?? true,
  });

  return {
    id: session.id,
    wsEndpoint: session.wsEndpoint,
    liveUrl: session.liveUrl,

    // stop session when done
    stop: async () => {
      await hb.sessions.stop(session.id);
    },
  };
}

/**
 * Stop ALL active sessions via Hyperbrowser API
 * Needed because in-memory tracking doesn't persist across serverless invocations
 */
async function stopAllActiveSessions(): Promise<void> {
  const hb = getClient();
  try {
    const { sessions } = await hb.sessions.list({ status: 'active' });
    if (sessions && sessions.length > 0) {
      console.log(`[Hyperbrowser] Found ${sessions.length} active sessions, stopping all...`);
      await Promise.all(sessions.map(s => hb.sessions.stop(s.id).catch(() => {})));
    }
  } catch (e) {
    console.warn('[Hyperbrowser] Failed to list/stop sessions:', e);
  }
}

/**
 * Create a live scraping session and navigate to URL
 * Returns liveUrl for iframe embedding
 * Auto-cleans ALL active sessions to avoid hitting session limit
 */
export async function createLiveScrape(url: string): Promise<{ liveUrl: string; sessionId: string }> {
  // cleanup ALL active sessions first (handles serverless state loss)
  await stopAllActiveSessions();

  const { chromium } = await import("playwright-core");
  const session = await createSession({ viewOnly: true });
  activeSessionId = session.id;

  // connect and navigate
  const browser = await chromium.connectOverCDP(session.wsEndpoint);
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto(url, { waitUntil: "domcontentloaded" });

  return {
    liveUrl: session.liveUrl,
    sessionId: session.id,
  };
}

/**
 * Stop a live session by ID
 */
export async function stopSession(sessionId: string): Promise<void> {
  const hb = getClient();
  await hb.sessions.stop(sessionId);
  if (activeSessionId === sessionId) {
    activeSessionId = null;
  }
}

/**
 * Force cleanup ALL active sessions
 */
export async function cleanupActiveSession(): Promise<void> {
  await stopAllActiveSessions();
  activeSessionId = null;
}

/**
 * Execute a custom scraping function with Puppeteer
 * Handles session lifecycle automatically
 */
export async function withPuppeteer<T>(
  fn: (browser: import("puppeteer-core").Browser) => Promise<T>,
  options: SessionOptions = {}
): Promise<T> {
  // dynamic import to avoid bundling puppeteer when not needed
  const { connect } = await import("puppeteer-core");

  const session = await createSession(options);

  try {
    const browser = await connect({
      browserWSEndpoint: session.wsEndpoint,
      defaultViewport: null,
    });

    return await fn(browser);
  } finally {
    await session.stop();
  }
}

/**
 * Execute a custom scraping function with Playwright
 * Handles session lifecycle automatically
 */
export async function withPlaywright<T>(
  fn: (browser: import("playwright-core").Browser) => Promise<T>,
  options: SessionOptions = {}
): Promise<T> {
  // dynamic import to avoid bundling playwright when not needed
  const { chromium } = await import("playwright-core");

  const session = await createSession(options);

  try {
    const browser = await chromium.connectOverCDP(session.wsEndpoint);
    return await fn(browser);
  } finally {
    await session.stop();
  }
}
