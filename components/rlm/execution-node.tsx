'use client';

import { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import {
    CodeIcon,
    CheckCircleIcon,
    XCircleIcon,
    LoaderIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    TicketIcon,
    SparklesIcon,
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { UCLogo } from './uc-logo';
import { AirbnbLogo, AirbnbMini } from './airbnb-logo';
import type { RLMNode, RLMNodeStatus } from '@/lib/rlm/types';

// subagent types for the concierge
export type SubagentType = 'yelp' | 'airbnb-user' | 'google-maps' | 'reddit' | 'luma';

// subagent config with branded icons
export const SUBAGENT_CONFIG: Record<
    SubagentType,
    {
        name: string;
        iconifyIcon?: string; // iconify icon name
        lucideIcon?: typeof TicketIcon; // fallback lucide icon
        color: string;
        bgColor: string;
        borderColor: string;
        gradientFrom: string;
        gradientTo: string;
    }
> = {
    yelp: {
        name: 'Yelp Reviews',
        iconifyIcon: 'simple-icons:yelp',
        color: 'text-[#D32323]',
        bgColor: 'bg-red-50',
        borderColor: 'border-[#D32323]',
        gradientFrom: 'from-[#D32323]',
        gradientTo: 'to-red-700',
    },
    'google-maps': {
        name: 'Nearby Places',
        iconifyIcon: 'simple-icons:googlemaps',
        color: 'text-[#4285F4]',
        bgColor: 'bg-blue-50',
        borderColor: 'border-[#4285F4]',
        gradientFrom: 'from-[#4285F4]',
        gradientTo: 'to-[#34A853]',
    },
    reddit: {
        name: 'Local Tips',
        iconifyIcon: 'simple-icons:reddit',
        color: 'text-[#FF4500]',
        bgColor: 'bg-orange-50',
        borderColor: 'border-[#FF4500]',
        gradientFrom: 'from-[#FF4500]',
        gradientTo: 'to-orange-600',
    },
    luma: {
        name: 'Events & Activities',
        lucideIcon: TicketIcon,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-400',
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-purple-600',
    },
    'airbnb-user': {
        name: 'Guest Profile',
        iconifyIcon: 'simple-icons:airbnb',
        color: 'text-[#FF5A5F]',
        bgColor: 'bg-pink-50',
        borderColor: 'border-[#FF5A5F]',
        gradientFrom: 'from-[#FF5A5F]',
        gradientTo: 'to-[#FF385C]',
    },
};

// node data type for React Flow
export interface ExecutionNodeData {
    rlmNode: RLMNode;
    isSelected?: boolean;
    hasChildren?: boolean;
    isExpanded?: boolean;
    childCount?: number;
    subagentType?: SubagentType;
    isAirbnbDemo?: boolean;
    onClick?: () => void;
    onExpand?: () => void;
    [key: string]: unknown;
}

// status config
const STATUS_CONFIG: Record<
    RLMNodeStatus,
    {
        icon: typeof LoaderIcon | null;
        color: string;
        bgColor: string;
        borderColor: string;
        label: string;
        animate?: boolean;
    }
> = {
    pending: {
        icon: LoaderIcon,
        color: 'text-white/45',
        bgColor: 'bg-white/[0.05]',
        borderColor: 'border-white/12 border-dashed',
        label: 'Pending',
    },
    executing: {
        icon: CodeIcon,
        color: 'text-sky-200',
        bgColor: 'bg-sky-400/[0.12]',
        borderColor: 'border-sky-300/45',
        label: 'Executing',
        animate: true,
    },
    'llm-calling': {
        icon: null,
        color: 'text-fuchsia-200',
        bgColor: 'bg-fuchsia-400/[0.12]',
        borderColor: 'border-fuchsia-300/45',
        label: 'Calling LLM',
        animate: true,
    },
    completed: {
        icon: CheckCircleIcon,
        color: 'text-emerald-200',
        bgColor: 'bg-emerald-300/[0.10]',
        borderColor: 'border-emerald-300/45',
        label: 'Completed',
    },
    error: {
        icon: XCircleIcon,
        color: 'text-red-200',
        bgColor: 'bg-red-400/[0.12]',
        borderColor: 'border-red-300/45',
        label: 'Error',
    },
};

// format duration
function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

interface ExecutionNodeProps {
    data: ExecutionNodeData;
}

// render status icon
function StatusIcon({ config, className }: { config: (typeof STATUS_CONFIG)[RLMNodeStatus]; className?: string }) {
    if (config.icon === null) {
        return <UCLogo className={className} animate={config.animate} />;
    }
    const Icon = config.icon;
    return <Icon className={className} />;
}

// custom execution node component
export const ExecutionNode = memo(({ data }: ExecutionNodeProps) => {
    const { rlmNode, isSelected, hasChildren, isExpanded, childCount, subagentType, isAirbnbDemo, onClick, onExpand } = data;
    const config = STATUS_CONFIG[rlmNode.status];
    const [liveDuration, setLiveDuration] = useState(() =>
        Math.max(0, (rlmNode.completedAt ?? Date.now()) - rlmNode.startedAt)
    );

    useEffect(() => {
        if (rlmNode.completedAt) return;

        const intervalId = window.setInterval(() => {
            setLiveDuration(Math.max(0, Date.now() - rlmNode.startedAt));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [rlmNode.completedAt, rlmNode.startedAt]);

    // calc duration
    const duration = rlmNode.completedAt ? rlmNode.completedAt - rlmNode.startedAt : liveDuration;

    // preview content
    const previewContent = rlmNode.parentId ? rlmNode.llmPrompt : rlmNode.code;
    const codePreview = previewContent
        ? previewContent
              .split('\n')
              .slice(0, 3)
              .map((line: string) => line.slice(0, 40))
              .join('\n')
        : '';

    const isChild = !!rlmNode.parentId;

    // AIRBNB SUBAGENT NODE (child with branded icon + Airbnb badge)
    if (isChild && subagentType && isAirbnbDemo) {
        const subConfig = SUBAGENT_CONFIG[subagentType];

        return (
            <div className='relative group'>
                {/* glow effect */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity',
                        `bg-gradient-to-br ${subConfig.gradientFrom} ${subConfig.gradientTo}`
                    )}
                />

                <div
                    className={cn(
                        'relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200',
                        'border-2 shadow-lg hover:shadow-xl hover:scale-110',
                        'bg-black/25 backdrop-blur-xl',
                        subConfig.borderColor,
                        isSelected && 'ring-2 ring-[#FF5A5F] scale-110',
                        config.animate && 'animate-pulse'
                    )}
                    onClick={onClick}
                    title={`${subConfig.name}\n${config.label}`}
                >
                    <Handle type='target' position={Position.Top} className='!bg-transparent !border-0 !w-1 !h-1' />

                    {/* branded icon - iconify or lucide */}
                    {subConfig.iconifyIcon ? (
                        <Icon icon={subConfig.iconifyIcon} className={cn('w-5 h-5', subConfig.color)} />
                    ) : subConfig.lucideIcon ? (
                        <subConfig.lucideIcon className={cn('w-5 h-5', subConfig.color)} strokeWidth={2.5} />
                    ) : null}

                    {/* airbnb badge */}
                    <div
                        className={cn(
                            'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md',
                            `bg-gradient-to-br ${subConfig.gradientFrom} ${subConfig.gradientTo}`
                        )}
                    >
                        <AirbnbMini className='w-3 h-3 text-white' />
                    </div>

                    <Handle type='source' position={Position.Bottom} className='!bg-transparent !border-0 !w-1 !h-1' />
                </div>

                {/* status indicator ring */}
                {config.animate && (
                    <div className='absolute inset-0 rounded-full border-2 border-[#FF5A5F] animate-ping opacity-30' />
                )}

                {/* expand badge */}
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpand?.();
                        }}
                        className={cn(
                            'absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center',
                            'border border-white/10 bg-black/65 shadow-md backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/[0.08]',
                            'text-[9px] font-bold text-white/80'
                        )}
                    >
                        {isExpanded ? <ChevronDownIcon className='w-3 h-3' /> : <span>{childCount}</span>}
                    </button>
                )}
            </div>
        );
    }

    // COMPACT CIRCLE for generic child nodes
    if (isChild) {
        return (
            <div className='relative'>
                <div
                    className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all',
                        'border shadow-lg backdrop-blur-xl',
                        config.bgColor,
                        config.borderColor,
                        isSelected && 'ring-2 ring-[#8ef3b7] scale-125',
                        config.animate && 'animate-pulse'
                    )}
                    onClick={onClick}
                    title={`#${rlmNode.id.slice(0, 4)} - ${config.label}${rlmNode.llmPrompt ? '\n' + rlmNode.llmPrompt.slice(0, 100) : ''}`}
                >
                    <Handle type='target' position={Position.Top} className='!bg-transparent !border-0 !w-1 !h-1' />
                    <StatusIcon config={config} className={cn('w-3.5 h-3.5', config.color)} />
                    <Handle type='source' position={Position.Bottom} className='!bg-transparent !border-0 !w-1 !h-1' />
                </div>

                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpand?.();
                        }}
                        className={cn(
                            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                            'border border-white/10 bg-black/70 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/[0.08]',
                            'text-[8px] font-bold text-white/75'
                        )}
                        title={isExpanded ? `Collapse ${childCount} children` : `Expand ${childCount} children`}
                    >
                        {isExpanded ? <ChevronDownIcon className='w-2.5 h-2.5' /> : <span>{childCount}</span>}
                    </button>
                )}
            </div>
        );
    }

    // AIRBNB ROOT NODE - Premium branded card
    if (isAirbnbDemo) {
        return (
            <div
                className={cn(
                    'cursor-pointer overflow-hidden rounded-2xl border border-white/12 shadow-2xl transition-all duration-300',
                    'min-w-[260px] max-w-[280px] bg-black/30 backdrop-blur-2xl',
                    'hover:shadow-[0_20px_60px_-15px_rgba(255,90,95,0.4)] hover:scale-[1.02]',
                    isSelected && 'ring-4 ring-[#FF5A5F]',
                    config.animate && 'animate-pulse'
                )}
                onClick={onClick}
            >
                {/* premium header with Airbnb gradient */}
                <div className='relative bg-gradient-to-r from-[#FF5A5F] via-[#FF385C] to-[#E31C5F] px-4 py-3'>
                    {/* sparkle effect */}
                    <div className='absolute top-2 right-3 opacity-60'>
                        <SparklesIcon className='w-4 h-4 text-white animate-pulse' />
                    </div>

                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-white/20 backdrop-blur-sm rounded-xl'>
                            <AirbnbLogo className='w-6 h-6 text-white' />
                        </div>
                        <div>
                            <h3 className='text-sm font-bold text-white tracking-tight'>Concierge AI</h3>
                            <p className='text-[10px] text-white/80 font-medium'>Crafting your experience</p>
                        </div>
                    </div>
                </div>

                {/* status bar */}
                <div className='flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl'>
                    <div className='flex items-center gap-2'>
                        {config.animate ? (
                            <div className='w-2 h-2 bg-[#FF5A5F] rounded-full animate-pulse' />
                        ) : config.label === 'Completed' ? (
                            <CheckCircleIcon className='w-4 h-4 text-emerald-500' />
                        ) : (
                            <div className='w-2 h-2 bg-white/30 rounded-full' />
                        )}
                        <span className={cn('text-xs font-semibold', config.animate ? 'text-[#FF5A5F]' : 'text-white/70')}>
                            {config.label}
                        </span>
                    </div>
                    <span className='text-xs font-mono text-white/40'>{formatDuration(duration)}</span>
                </div>

                {/* code preview */}
                {codePreview && (
                    <div className='bg-white/[0.04] px-4 py-3'>
                        <pre className='overflow-hidden whitespace-pre-wrap line-clamp-3 text-[10px] font-mono text-white/55'>
                            {codePreview.slice(0, 120)}...
                        </pre>
                    </div>
                )}

                {/* expand button */}
                {hasChildren && (
                    <div className='border-t border-white/10 bg-black/12 px-4 py-2'>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand?.();
                            }}
                            className={cn(
                                'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium text-[#FF9A9D] transition-colors hover:bg-white/[0.06]'
                            )}
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronDownIcon className='w-4 h-4' />
                                    Hide {childCount} subagents
                                </>
                            ) : (
                                <>
                                    <ChevronRightIcon className='w-4 h-4' />
                                    Show {childCount} subagents
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* error */}
                {rlmNode.error && (
                    <div className='bg-red-400/[0.12] px-4 py-2 text-[10px] font-medium text-red-200'>
                        {rlmNode.error.slice(0, 60)}...
                    </div>
                )}

                <Handle type='source' position={Position.Bottom} className='!bg-[#FF5A5F] !w-4 !h-4 !border-2 !border-black/60' />
            </div>
        );
    }

    // DEFAULT ROOT NODE CARD
    return (
        <div
            className={cn(
                'cursor-pointer rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-200',
                'min-w-[200px] max-w-[240px]',
                'bg-black/28',
                config.borderColor,
                isSelected && 'ring-2 ring-[#8ef3b7]',
                config.animate && 'animate-pulse'
            )}
            onClick={onClick}
        >
            {/* header */}
            <div className={cn('flex items-center justify-between border-b border-white/10 px-3 py-2')}>
                <div className='flex items-center gap-2'>
                    <StatusIcon config={config} className={cn('w-4 h-4', config.color)} />
                    <span className='text-xs font-medium text-white/80'>Root #{rlmNode.id.slice(0, 4)}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='text-xs text-white/45'>{formatDuration(duration)}</span>

                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand?.();
                            }}
                            className='flex items-center gap-0.5 text-xs text-white/45 hover:text-white/80'
                            title={isExpanded ? 'Collapse children' : 'Expand children'}
                        >
                            {isExpanded ? <ChevronDownIcon className='w-3 h-3' /> : <ChevronRightIcon className='w-3 h-3' />}
                            <span className='text-[10px]'>{childCount}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* status */}
            <div className='border-b border-white/10 px-3 py-1.5'>
                <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
            </div>

            {/* code preview */}
            {codePreview && (
                <div className='px-3 py-2'>
                    <pre className='overflow-hidden whitespace-pre-wrap line-clamp-3 text-[10px] font-mono text-white/58'>
                        {codePreview.slice(0, 120)}...
                    </pre>
                </div>
            )}

            {/* error */}
            {rlmNode.error && (
                <div className='truncate bg-red-400/[0.12] px-3 py-1 text-[10px] text-red-200'>{rlmNode.error.slice(0, 50)}...</div>
            )}

            <Handle type='source' position={Position.Bottom} className='!bg-white/35 !w-3 !h-3 !border !border-black/60' />
        </div>
    );
});

ExecutionNode.displayName = 'ExecutionNode';
