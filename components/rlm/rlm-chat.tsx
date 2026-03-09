'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PlayIcon, StopCircleIcon, RefreshCwIcon, UploadIcon, ChevronUpIcon, ChevronDownIcon, LoaderIcon, GithubIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useRLM } from '@/hooks/use-rlm';
import { RecursionTree } from './recursion-tree';
import { CodePanel } from './code-panel';
import { RLMStatus } from './rlm-status';
import { ExecutionLog } from './execution-log';
import { getNodeById } from '@/lib/rlm/tree-state';
import type { SubagentType } from './execution-node';
import type { RLMTreeState } from '@/lib/rlm/types';

// subagent type order (same as recursion-tree)
const SUBAGENT_TYPES: SubagentType[] = ['yelp', 'google-maps', 'reddit', 'luma', 'airbnb-user'];

// Check if text looks like a GitHub URL
function isGitHubUrl(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.match(/^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/\s]+/)) {
        return true;
    }
    if (trimmed.match(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/) && !trimmed.includes(' ')) {
        return true;
    }
    return false;
}

type GitHubStatus = 'idle' | 'loading' | 'success' | 'error';

interface GitHubState {
    status: GitHubStatus;
    message: string;
    repoName?: string;
    fileCount?: number;
}

export interface RLMChatProps {
    initialContext?: string;
    initialQuery?: string;
    initialContextId?: string | null;
    initialTreeState?: RLMTreeState;
    initialFinalResult?: string | null;
    maxDepth?: number;
    className?: string;
    isAirbnbDemo?: boolean;
}

export function RLMChat({
    initialContext = '',
    initialQuery = '',
    initialContextId = null,
    initialTreeState,
    initialFinalResult = null,
    maxDepth = 1,
    className,
    isAirbnbDemo,
}: RLMChatProps) {
    // query and context state
    const [query, setQuery] = useState(initialQuery);
    const [context, setContext] = useState(initialContext);
    const [finalResult, setFinalResult] = useState<string | null>(initialFinalResult);
    const [logCollapsed, setLogCollapsed] = useState(false);

    // GitHub extraction state
    const [githubState, setGithubState] = useState<GitHubState>({ status: 'idle', message: '' });

    // RLM hook
    const { treeState, isRunning, execute, reset, selectedNodeId, setSelectedNodeId } = useRLM({
        initialTreeState,
        onComplete: (result) => {
            setFinalResult(result);
        },
        onError: (error) => {
            console.error('RLM Error:', error);
        },
    });

    // get selected node
    const selectedNode = selectedNodeId ? getNodeById(treeState, selectedNodeId) : null;

    // compute subagent type for selected node (depth 1 children only, same logic as recursion-tree)
    const selectedSubagentType = useMemo((): SubagentType | undefined => {
        if (!selectedNode || selectedNode.depth !== 1 || !isAirbnbDemo) return undefined;

        // find index among depth-1 siblings
        const depth1Nodes = treeState.nodes.filter(n => n.depth === 1);
        const idx = depth1Nodes.findIndex(n => n.id === selectedNode.id);
        if (idx === -1) return undefined;

        return SUBAGENT_TYPES[idx % SUBAGENT_TYPES.length];
    }, [selectedNode, treeState.nodes, isAirbnbDemo]);

    // handle submit
    const handleSubmit = useCallback(() => {
        if (!query.trim() || !context.trim() || isRunning) return;

        setFinalResult(null);
        execute({
            query,
            context,
            maxDepth,
            contextId: treeState.rootContextId || initialContextId || undefined,
        });
    }, [query, context, maxDepth, isRunning, execute, treeState.rootContextId, initialContextId]);

    // handle reset
    const handleReset = useCallback(() => {
        reset();
        setFinalResult(null);
    }, [reset]);

    // handle file upload for context
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setContext(text);
        };
        reader.readAsText(file);
    }, []);

    // handle GitHub URL extraction
    const handleGitHubExtract = useCallback(async (url: string) => {
        setGithubState({ status: 'loading', message: 'Downloading and extracting repository...' });

        try {
            const response = await fetch('/api/github-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract repository');
            }

            setContext(data.content);
            setGithubState({
                status: 'success',
                message: `Extracted ${data.fileCount} files from ${data.owner}/${data.repo}`,
                repoName: `${data.owner}/${data.repo}`,
                fileCount: data.fileCount,
            });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setGithubState(prev => prev.status === 'success' ? { status: 'idle', message: '' } : prev);
            }, 5000);
        } catch (error) {
            setGithubState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to extract repository',
            });

            // Clear error message after 5 seconds
            setTimeout(() => {
                setGithubState(prev => prev.status === 'error' ? { status: 'idle', message: '' } : prev);
            }, 5000);
        }
    }, []);

    // handle context change with GitHub URL detection
    const handleContextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContext(value);

        // Check if the pasted content is a GitHub URL
        if (isGitHubUrl(value) && githubState.status !== 'loading') {
            handleGitHubExtract(value);
        }
    }, [githubState.status, handleGitHubExtract]);

    return (
        <div className={cn('flex h-full flex-col bg-[rgba(4,12,16,0.34)] text-white', className)}>
            {/* status bar */}
            <RLMStatus treeState={treeState} isRunning={isRunning} />

            {/* main content area */}
            <div className='flex flex-1 overflow-hidden'>
                {/* left: tree visualization + log */}
                <div className='flex min-w-0 flex-1 flex-col'>
                    {/* tree */}
                    <div className='flex-1 p-2'>
                        <RecursionTree treeState={treeState} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} isAirbnbDemo={isAirbnbDemo} />
                    </div>

                    {/* collapsible log */}
                    <div className='border-t border-white/10'>
                        {/* log header with toggle */}
                        <button
                            onClick={() => setLogCollapsed(!logCollapsed)}
                            className='flex w-full items-center justify-between bg-black/20 px-3 py-1.5 transition-colors hover:bg-white/[0.06]'
                        >
                            <span className='text-xs font-medium text-white/[0.65]'>Execution Log</span>
                            {logCollapsed ? (
                                <ChevronUpIcon className='h-4 w-4 text-white/[0.55]' />
                            ) : (
                                <ChevronDownIcon className='h-4 w-4 text-white/[0.55]' />
                            )}
                        </button>

                        {/* log content */}
                        {!logCollapsed && (
                            <div className='h-[150px]'>
                                <ExecutionLog treeState={treeState} className='h-full' />
                            </div>
                        )}
                    </div>
                </div>

                {/* right: code panel (when node selected) */}
                {selectedNode && (
                    <div className='w-[400px] border-l border-white/10 bg-black/[0.18] p-4 backdrop-blur-xl'>
                        <CodePanel
                            node={selectedNode}
                            subagentType={selectedSubagentType}
                            onClose={() => setSelectedNodeId(null)}
                        />
                    </div>
                )}
            </div>

            {/* final result */}
            {finalResult && (
                <div className='max-h-[200px] overflow-y-auto border-t border-emerald-300/20 bg-emerald-300/10 px-4 py-3'>
                    <div className='flex items-start gap-2'>
                        <span className='flex-shrink-0 text-xs font-medium uppercase text-emerald-200'>Result:</span>
                        <p className='whitespace-pre-wrap text-sm text-emerald-50'>{finalResult}</p>
                    </div>
                </div>
            )}

            {/* input area */}
            <div className='border-t border-white/10 bg-black/20 p-4 backdrop-blur-xl'>
                <div className='space-y-3'>
                    {/* query input */}
                    <div>
                        <label className='mb-1 block text-xs font-medium text-white/[0.65]'>Query</label>
                        <input
                            type='text'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='What do you want to analyze?'
                            className='w-full rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-white/[0.35] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#8ef3b7]'
                            disabled={isRunning}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>

                    {/* context input */}
                    <div>
                        <div className='flex items-center justify-between mb-1'>
                            <label className='text-xs font-medium text-white/[0.65]'>
                                Context <span className='text-white/[0.35]'>({context.length.toLocaleString()} chars)</span>
                            </label>
                            <label className='flex cursor-pointer items-center gap-1 text-xs text-[#8ef3b7] hover:text-[#b2f8c9]'>
                                <UploadIcon className='h-3 w-3' />
                                Upload file
                                <input type='file' className='hidden' accept='.txt,.json,.csv,.md' onChange={handleFileUpload} />
                            </label>
                        </div>

                        {/* GitHub status message */}
                        {githubState.status !== 'idle' && (
                            <div className={cn(
                                'mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                                githubState.status === 'loading' && 'bg-blue-400/[0.12] text-blue-100',
                                githubState.status === 'success' && 'bg-emerald-300/[0.12] text-emerald-100',
                                githubState.status === 'error' && 'bg-red-400/[0.12] text-red-100'
                            )}>
                                {githubState.status === 'loading' && (
                                    <LoaderIcon className='h-4 w-4 animate-spin' />
                                )}
                                {githubState.status === 'success' && (
                                    <CheckCircleIcon className='h-4 w-4' />
                                )}
                                {githubState.status === 'error' && (
                                    <XCircleIcon className='h-4 w-4' />
                                )}
                                <span>{githubState.message}</span>
                            </div>
                        )}

                        <div className='relative'>
                            <textarea
                                value={context}
                                onChange={handleContextChange}
                                placeholder='Paste your data, GitHub URL (e.g., owner/repo), or upload a file...'
                                className={cn(
                                    'h-24 w-full resize-none rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 font-mono text-sm text-white placeholder:text-white/[0.35] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#8ef3b7]',
                                    githubState.status === 'loading' && 'opacity-50'
                                )}
                                disabled={isRunning || githubState.status === 'loading'}
                            />
                            {githubState.status === 'loading' && (
                                <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 backdrop-blur-sm'>
                                    <div className='flex items-center gap-2 text-blue-100'>
                                        <GithubIcon className='h-5 w-5' />
                                        <LoaderIcon className='h-4 w-4 animate-spin' />
                                        <span className='text-sm font-medium'>Extracting repository...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* action buttons */}
                    <div className='flex items-center gap-2'>
                        {!isRunning ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!query.trim() || !context.trim()}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                                    query.trim() && context.trim()
                                        ? 'bg-[#8ef3b7] text-black hover:bg-[#b2f8c9]'
                                        : 'bg-white/[0.08] text-white/[0.3] cursor-not-allowed'
                                )}
                            >
                                <PlayIcon className='h-4 w-4' />
                                Execute RLM
                            </button>
                        ) : (
                            <button
                                onClick={handleReset}
                                className='flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400'
                            >
                                <StopCircleIcon className='h-4 w-4' />
                                Stop
                            </button>
                        )}

                        {treeState.nodes.length > 0 && !isRunning && (
                            <button
                                onClick={handleReset}
                                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/[0.55] transition-colors hover:text-white'
                            >
                                <RefreshCwIcon className='h-4 w-4' />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
