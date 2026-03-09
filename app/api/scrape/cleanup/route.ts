import { cleanupActiveSession } from '@/lib/hyperbrowser-scraper';

export async function POST() {
    try {
        await cleanupActiveSession();
        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Cleanup failed' },
            { status: 500 }
        );
    }
}
