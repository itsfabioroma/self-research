'use client';

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { CodeIcon, TerminalIcon, BrainIcon, XIcon, GlobeIcon, MapPinIcon, PencilIcon } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { BrowserView } from './browser-view';
import type { RLMNode } from '@/lib/rlm/types';
import type { SubagentType } from './execution-node';

export interface CodePanelProps {
    node: RLMNode | null;
    subagentType?: SubagentType;
    onClose: () => void;
}

// subagent URL mappings for live scraping
const SUBAGENT_SCRAPE_URLS: Partial<Record<SubagentType, string>> = {
    yelp: 'https://www.yelp.com/search?find_desc=restaurants&find_loc=San+Francisco',
    'google-maps': 'https://www.google.com/maps/search/restaurants/@37.7749,-122.4194,13z',
    luma: 'https://lu.ma/sf',
};

// subagent labels
const SUBAGENT_LABELS: Partial<Record<SubagentType, { name: string; icon: typeof GlobeIcon }>> = {
    yelp: { name: 'Yelp Reviews', icon: PencilIcon },
    'google-maps': { name: 'Google Maps', icon: MapPinIcon },
    luma: { name: 'Events & Activities', icon: GlobeIcon },
};

// browser-enabled subagent types
const BROWSER_SUBAGENTS: SubagentType[] = ['yelp', 'google-maps', 'luma'];

export const CodePanel = memo(({ node, subagentType, onClose }: CodePanelProps) => {
    const [showBrowser, setShowBrowser] = useState(true);

    // check if this is a browser-enabled subagent
    const isBrowserSubagent = subagentType && BROWSER_SUBAGENTS.includes(subagentType);
    const scrapeUrl = subagentType ? SUBAGENT_SCRAPE_URLS[subagentType] : undefined;
    const subagentLabel = subagentType ? SUBAGENT_LABELS[subagentType] : undefined;

    if (!node) {
        return (
            <div className='flex h-full w-full items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl'>
                <div className='text-center text-white/[0.4]'>
                    <CodeIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
                    <p className='text-sm'>Select a node to view details</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-black/[0.22] backdrop-blur-2xl'>
            {/* header */}
            <div className='flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl'>
                <div className='flex items-center gap-2'>
                    {subagentLabel ? (
                        <>
                            <subagentLabel.icon className='h-4 w-4 text-white/[0.7]' />
                            <span className='text-sm font-medium text-white/[0.82]'>{subagentLabel.name}</span>
                        </>
                    ) : (
                        <span className='text-sm font-medium text-white/[0.82]'>Node #{node.id.slice(0, 6)}</span>
                    )}
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-xs',
                            node.status === 'completed' && 'bg-emerald-300/[0.14] text-emerald-100',
                            node.status === 'error' && 'bg-red-400/[0.14] text-red-100',
                            node.status === 'executing' && 'bg-sky-400/[0.14] text-sky-100',
                            node.status === 'llm-calling' && 'bg-fuchsia-400/[0.14] text-fuchsia-100',
                            node.status === 'pending' && 'bg-white/[0.08] text-white/[0.7]'
                        )}
                    >
                        {node.status}
                    </span>
                </div>
                <div className='flex items-center gap-1'>
                    {isBrowserSubagent && (
                        <button
                            onClick={() => setShowBrowser(!showBrowser)}
                            className={cn(
                                'rounded-lg px-2 py-1 text-xs transition-colors',
                                showBrowser
                                    ? 'bg-sky-400/[0.14] text-sky-100'
                                    : 'bg-white/[0.08] text-white/[0.65] hover:bg-white/[0.12]'
                            )}
                        >
                            <GlobeIcon className='mr-1 inline h-3 w-3' />
                            {showBrowser ? 'Hide Browser' : 'Show Browser'}
                        </button>
                    )}
                    <button onClick={onClose} className='rounded p-1 text-white/[0.45] hover:text-white/[0.8]'>
                        <XIcon className='h-4 w-4' />
                    </button>
                </div>
            </div>

            {/* browser view for yelp/google-maps */}
            {isBrowserSubagent && showBrowser && scrapeUrl && (
                <div className='h-[350px] border-b border-white/10 bg-black/20'>
                    <BrowserView url={scrapeUrl} className='h-full' />
                </div>
            )}

            {/* content */}
            <div className='flex-1 space-y-4 overflow-auto p-4'>
                {/* code section */}
                {node.code && (
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <CodeIcon className='h-4 w-4 text-sky-300' />
                            <span className='text-xs font-medium uppercase text-white/[0.6]'>Generated Code</span>
                        </div>
                        <pre className='overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/45 p-3 text-xs font-mono text-white/[0.88]'>
                            {node.code}
                        </pre>
                    </div>
                )}

                {/* output section */}
                {node.output && (
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <TerminalIcon className='h-4 w-4 text-emerald-300' />
                            <span className='text-xs font-medium uppercase text-white/[0.6]'>Output</span>
                        </div>
                        <pre className='max-h-[200px] overflow-y-auto overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs font-mono text-white/[0.82]'>
                            {node.output}
                        </pre>
                    </div>
                )}

                {/* LLM prompt/response section */}
                {node.llmPrompt && (
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <BrainIcon className='h-4 w-4 text-fuchsia-300' />
                            <span className='text-xs font-medium uppercase text-white/[0.6]'>LLM Prompt</span>
                        </div>
                        <div className='max-h-[250px] overflow-y-auto overflow-x-auto whitespace-pre-wrap rounded-xl border border-fuchsia-300/15 bg-fuchsia-400/[0.08] p-3 text-xs text-white/[0.82]'>
                            {node.llmPrompt}
                        </div>
                    </div>
                )}

                {node.llmResponse && (
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <BrainIcon className='h-4 w-4 text-fuchsia-300' />
                            <span className='text-xs font-medium uppercase text-white/[0.6]'>LLM Response</span>
                        </div>
                        <div className='max-h-[250px] overflow-y-auto overflow-x-auto rounded-xl border border-fuchsia-300/15 bg-fuchsia-400/[0.08] p-3 text-sm text-white/[0.84]'>
                            <Streamdown>{node.llmResponse}</Streamdown>
                        </div>
                    </div>
                )}

                {/* error section */}
                {node.error && (
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <XIcon className='h-4 w-4 text-red-300' />
                            <span className='text-xs font-medium uppercase text-white/[0.6]'>Error</span>
                        </div>
                        <pre className='overflow-x-auto whitespace-pre-wrap rounded-xl border border-red-300/15 bg-red-400/[0.08] p-3 text-xs font-mono text-red-100'>
                            {node.error}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
});

CodePanel.displayName = 'CodePanel';
