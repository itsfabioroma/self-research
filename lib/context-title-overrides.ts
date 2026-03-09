import { promises as fs } from 'node:fs';
import path from 'node:path';

const CONTEXT_TITLE_OVERRIDES_PATH = path.join(process.cwd(), '.context-title-overrides.json');

type ContextTitleOverrides = Record<string, string>;

async function ensureOverridesFile(): Promise<void> {
    try {
        await fs.access(CONTEXT_TITLE_OVERRIDES_PATH);
    } catch {
        await fs.writeFile(CONTEXT_TITLE_OVERRIDES_PATH, '{}\n', 'utf8');
    }
}

export async function readContextTitleOverrides(): Promise<ContextTitleOverrides> {
    await ensureOverridesFile();

    try {
        const raw = await fs.readFile(CONTEXT_TITLE_OVERRIDES_PATH, 'utf8');
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string')
        );
    } catch {
        return {};
    }
}

export async function saveContextTitleOverride(contextId: string, title: string): Promise<void> {
    const overrides = await readContextTitleOverrides();
    overrides[contextId] = title;
    await fs.writeFile(CONTEXT_TITLE_OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
}
