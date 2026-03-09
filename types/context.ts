export type NodeResponse = {
    id?: string;
    type?: string;
    content: unknown;
    metadata?: Record<string, unknown>;
    created_at?: string;
    parent_id?: string;
    [k: string]: unknown;
};
