import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { UltraContext } from 'ultracontext';

const PROJECT_PATH = process.cwd();
const SOURCE = 'self-research';

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if (!key || process.env[key]) continue;

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }
}

function getHostName() {
    try {
        return os.hostname();
    } catch {
        return process.env.HOSTNAME || 'unknown-host';
    }
}

function getUserId() {
    try {
        return os.userInfo().username;
    } catch {
        return process.env.USER || process.env.LOGNAME || 'unknown-user';
    }
}

function isResearchContext(metadata = {}) {
    return metadata.kind === 'research' || (typeof metadata.name === 'string' && metadata.name.startsWith('RLM:'));
}

function isAlreadyIngested(metadata = {}) {
    return metadata.kind === 'research' &&
        metadata.source === SOURCE &&
        metadata.project_path === PROJECT_PATH;
}

function buildMetadata(metadata, legacyContextId) {
    const name = typeof metadata.name === 'string' && metadata.name.length > 0
        ? metadata.name
        : `RLM: ${legacyContextId}`;

    return {
        ...metadata,
        name,
        kind: 'research',
        source: SOURCE,
        host: getHostName(),
        user_id: getUserId(),
        session_id: typeof metadata.session_id === 'string' && metadata.session_id.length > 0
            ? metadata.session_id
            : legacyContextId,
        project_path: PROJECT_PATH,
        started_at: typeof metadata.started_at === 'string' && metadata.started_at.length > 0
            ? metadata.started_at
            : new Date().toISOString(),
        legacy_context_id: legacyContextId,
    };
}

loadEnvFile(path.join(PROJECT_PATH, '.env'));

const apiKey = process.env.ULTRACONTEXT_API_KEY;
if (!apiKey) {
    console.error('Missing ULTRACONTEXT_API_KEY');
    process.exit(1);
}

const execute = process.argv.includes('--execute');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 200;

if (!Number.isFinite(limit) || limit <= 0) {
    console.error(`Invalid limit: ${limitArg}`);
    process.exit(1);
}

const uc = new UltraContext({
    apiKey,
    ...(process.env.ULTRACONTEXT_BASE_URL ? { baseUrl: process.env.ULTRACONTEXT_BASE_URL } : {}),
});

const contexts = await uc.get({ limit });
const ingestedByLegacyId = new Set(
    contexts.data
        .filter((context) => isAlreadyIngested(context.metadata))
        .map((context) => context.metadata?.legacy_context_id)
        .filter((value) => typeof value === 'string')
);

const candidates = contexts.data.filter((context) => {
    if (!isResearchContext(context.metadata)) return false;
    if (isAlreadyIngested(context.metadata)) return false;
    if (ingestedByLegacyId.has(context.id)) return false;
    return true;
});

if (candidates.length === 0) {
    console.log(JSON.stringify({
        execute,
        project_path: PROJECT_PATH,
        total_contexts: contexts.data.length,
        research_candidates: 0,
        created: 0,
    }, null, 2));
    process.exit(0);
}

const created = [];

for (const context of candidates) {
    const metadata = buildMetadata(context.metadata ?? {}, context.id);

    if (!execute) {
        created.push({
            legacy_context_id: context.id,
            name: metadata.name,
            session_id: metadata.session_id,
        });
        continue;
    }

    const cloned = await uc.create({
        from: context.id,
        metadata,
    });

    created.push({
        legacy_context_id: context.id,
        ingested_context_id: cloned.id,
        name: metadata.name,
        session_id: metadata.session_id,
    });
}

console.log(JSON.stringify({
    execute,
    project_path: PROJECT_PATH,
    total_contexts: contexts.data.length,
    research_candidates: candidates.length,
    created: created.length,
    items: created,
}, null, 2));
