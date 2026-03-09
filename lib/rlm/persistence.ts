import type { NodeResponse } from '@/types/context';
import type { RLMNode, RLMTreeState } from './types';

export interface PersistedRLMExecution {
    query: string;
    context: string;
    maxDepth: number;
    result?: string;
    snapshot: RLMTreeState;
}

type RLMExecutionNode = NodeResponse & {
    type?: string;
    query?: unknown;
    context?: unknown;
    maxDepth?: unknown;
    result?: unknown;
    snapshot?: unknown;
    code?: unknown;
    output?: unknown;
    created_at?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isRLMNode(value: unknown): value is RLMNode {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        (typeof value.parentId === 'string' || value.parentId === null) &&
        typeof value.depth === 'number' &&
        typeof value.status === 'string' &&
        typeof value.code === 'string' &&
        typeof value.output === 'string' &&
        typeof value.contextId === 'string' &&
        typeof value.startedAt === 'number'
    );
}

function isRLMTreeState(value: unknown): value is RLMTreeState {
    return (
        isObject(value) &&
        Array.isArray(value.nodes) &&
        value.nodes.every(isRLMNode) &&
        typeof value.rootContextId === 'string' &&
        typeof value.status === 'string'
    );
}

function buildLegacySnapshot(node: RLMExecutionNode, contextId: string): RLMTreeState | null {
    if (typeof node.query !== 'string') return null;

    const startedAt = node.created_at ? new Date(node.created_at).getTime() : Date.now();
    const status = typeof node.result === 'string' ? 'completed' : 'error';
    const rootNode: RLMNode = {
        id: node.id || 'legacy-root',
        parentId: null,
        depth: 0,
        status,
        code: typeof node.code === 'string' ? node.code : '',
        output: typeof node.output === 'string' ? node.output : '',
        llmPrompt: node.query,
        contextId,
        startedAt,
        completedAt: startedAt,
        ...(status === 'error' && typeof node.result === 'string' ? { error: node.result } : {}),
    };

    return {
        nodes: [rootNode],
        rootContextId: contextId,
        status,
        ...(typeof node.result === 'string' ? { finalResult: node.result } : {}),
    };
}

export function extractLatestRLMExecution(data: NodeResponse[], contextId: string): PersistedRLMExecution | null {
    const latestNode = [...data]
        .reverse()
        .find((node): node is RLMExecutionNode => node.type === 'rlm-execution');

    if (!latestNode || typeof latestNode.query !== 'string') {
        return null;
    }

    const snapshot = isRLMTreeState(latestNode.snapshot)
        ? {
              ...latestNode.snapshot,
              rootContextId: latestNode.snapshot.rootContextId || contextId,
          }
        : buildLegacySnapshot(latestNode, contextId);

    if (!snapshot) return null;

    return {
        query: latestNode.query,
        context: typeof latestNode.context === 'string' ? latestNode.context : '',
        maxDepth: typeof latestNode.maxDepth === 'number' ? latestNode.maxDepth : 1,
        result: typeof latestNode.result === 'string' ? latestNode.result : snapshot.finalResult,
        snapshot,
    };
}

export function isResearchContext(context: { metadata?: { kind?: string; name?: string } | null }): boolean {
    return context.metadata?.kind === 'research' || context.metadata?.name?.startsWith('RLM:') === true;
}
