import os from 'node:os';

export const SELF_RESEARCH_SOURCE = 'self-research';
export const SELF_RESEARCH_PROJECT_PATH = process.cwd();

function getHostName(): string {
    try {
        return os.hostname();
    } catch {
        return process.env.HOSTNAME || 'unknown-host';
    }
}

function getUserId(): string {
    try {
        return os.userInfo().username;
    } catch {
        return process.env.USER || process.env.LOGNAME || 'unknown-user';
    }
}

export type ResearchContextMetadataInput = {
    name: string;
    sessionId: string;
    startedAt?: string;
    extra?: Record<string, unknown>;
};

export function buildResearchContextMetadata({
    name,
    sessionId,
    startedAt = new Date().toISOString(),
    extra = {},
}: ResearchContextMetadataInput): Record<string, unknown> {
    return {
        ...extra,
        name,
        kind: 'research',
        source: SELF_RESEARCH_SOURCE,
        host: getHostName(),
        user_id: getUserId(),
        session_id: sessionId,
        project_path: SELF_RESEARCH_PROJECT_PATH,
        started_at: startedAt,
    };
}

export function isProjectIngestedResearchContext(metadata: Record<string, unknown> | null | undefined): boolean {
    return metadata?.kind === 'research' &&
        metadata?.source === SELF_RESEARCH_SOURCE &&
        metadata?.project_path === SELF_RESEARCH_PROJECT_PATH;
}

export function getLegacyResearchContextId(metadata: Record<string, unknown> | null | undefined): string | null {
    const value = metadata?.legacy_context_id;
    return typeof value === 'string' ? value : null;
}
