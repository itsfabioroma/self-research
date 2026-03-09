import { redirect } from 'next/navigation';
import { UltraContext } from 'ultracontext';
import { ResearchWorkspace } from '@/components/research-workspace';
import { extractLatestRLMExecution } from '@/lib/rlm/persistence';
import type { NodeResponse } from '@/types/context';

export default async function ResearchContextPage({ params }: { params: Promise<{ contextId: string }> }) {
    const { contextId } = await params;

    const apiKey = process.env.ULTRACONTEXT_API_KEY;
    if (!apiKey) throw new Error('Missing ULTRACONTEXT_API_KEY');

    const uc = new UltraContext({ apiKey });
    let execution;

    try {
        const ctx = await uc.get<NodeResponse>(contextId);
        execution = extractLatestRLMExecution(ctx.data as NodeResponse[], contextId);

        if (!execution) {
            redirect('/research');
        }
    } catch (error) {
        console.error('Failed to load research context:', error);
        redirect('/research');
    }

    return (
        <ResearchWorkspace
            initialExecution={execution}
            contextId={contextId}
        />
    );
}
