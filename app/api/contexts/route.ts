import { UltraContext } from 'ultracontext';
import { NextResponse } from 'next/server';
import { readContextTitleOverrides, saveContextTitleOverride } from '@/lib/context-title-overrides';
import { getLegacyResearchContextId, isProjectIngestedResearchContext } from '@/lib/ultracontext-metadata';

export async function GET() {
    const apiKey = process.env.ULTRACONTEXT_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing ULTRACONTEXT_API_KEY' }, { status: 500 });
    }

    const uc = new UltraContext({ apiKey });

    try {
        const titleOverrides = await readContextTitleOverrides();
        const contexts = await uc.get();
        const migratedLegacyIds = new Set(
            contexts.data
                .filter((context) => isProjectIngestedResearchContext(context.metadata))
                .map((context) => getLegacyResearchContextId(context.metadata))
                .filter((value): value is string => Boolean(value))
        );
        const dedupedContexts = contexts.data.filter((context) => {
            if (isProjectIngestedResearchContext(context.metadata)) {
                return true;
            }

            const metadata = context.metadata ?? {};
            const isLegacyResearch = metadata.kind === 'research' || typeof metadata.name === 'string' && metadata.name.startsWith('RLM:');
            return !isLegacyResearch || !migratedLegacyIds.has(context.id);
        }).map((context) => ({
            ...context,
            metadata: {
                ...(context.metadata ?? {}),
                ...(titleOverrides[context.id] ? { name: titleOverrides[context.id] } : {}),
            },
        }));

        return NextResponse.json({ contexts: { ...contexts, data: dedupedContexts } });
    } catch (error) {
        console.error('Failed to list contexts:', error);
        return NextResponse.json({ error: 'Failed to list contexts' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const body = await req.json().catch(() => null);
    const contextId = typeof body?.contextId === 'string' ? body.contextId.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!contextId) {
        return NextResponse.json({ error: 'Missing contextId' }, { status: 400 });
    }

    if (!name) {
        return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    await saveContextTitleOverride(contextId, name);

    return NextResponse.json({
        contextId,
        name,
    });
}
