'use client';

import { memo } from 'react';
import { ActivityIcon, CheckCircleIcon, XCircleIcon, ClockIcon, LayersIcon } from 'lucide-react';
import { UCLogo } from './uc-logo';
import { TokensCounter } from './tokens-counter';
import type { RLMTreeState } from '@/lib/rlm/types';
import { getTreeStats } from '@/lib/rlm/tree-state';

export interface RLMStatusProps {
    treeState: RLMTreeState;
    isRunning: boolean;
}

// format duration
function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}.${Math.floor((ms % 1000) / 100)}s`;
}

export const RLMStatus = memo(({ treeState, isRunning }: RLMStatusProps) => {
    const stats = getTreeStats(treeState);

    // progress percentage
    const progress = stats.totalNodes > 0 ? Math.round((stats.completedNodes / stats.totalNodes) * 100) : 0;

    return (
        <div className='flex items-center justify-between border-b border-white/10 bg-black/[0.12] px-4 py-2 backdrop-blur-md'>
            {/* logo + status */}
            <div className='flex items-center gap-4'>
                {/* UltraContext logo */}
                <div className='flex items-center gap-1.5'>
                    <UCLogo className='w-5 h-5 text-[#8ef3b7]' />
                    <span className='text-sm font-semibold text-white'>UltraContext</span>
                    <span className='text-xs text-white/35'>RLM</span>
                </div>

                {/* divider */}
                <div className='h-4 w-px bg-white/10' />

                {/* running indicator */}
                <div className='flex items-center gap-1.5'>
                    {isRunning ? (
                        <>
                            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                            <span className='text-xs font-medium text-blue-200'>Running</span>
                        </>
                    ) : treeState.status === 'completed' ? (
                        <>
                            <CheckCircleIcon className='w-4 h-4 text-green-500' />
                            <span className='text-xs font-medium text-emerald-200'>Completed</span>
                        </>
                    ) : treeState.status === 'error' ? (
                        <>
                            <XCircleIcon className='w-4 h-4 text-red-500' />
                            <span className='text-xs font-medium text-red-200'>Error</span>
                        </>
                    ) : (
                        <>
                            <div className='w-2 h-2 bg-white/30 rounded-full' />
                            <span className='text-xs font-medium text-white/[0.55]'>Idle</span>
                        </>
                    )}
                </div>

                {/* progress bar (only when running) */}
                {isRunning && stats.totalNodes > 0 && (
                    <div className='flex items-center gap-2'>
                        <div className='h-1.5 w-24 overflow-hidden rounded-full bg-white/10'>
                            <div
                                className='h-full rounded-full bg-[#8ef3b7] transition-all duration-300'
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className='text-xs text-white/[0.55]'>{progress}%</span>
                    </div>
                )}
            </div>

            {/* stats */}
            <div className='flex items-center gap-4'>
                {/* tokens counter */}
                <TokensCounter isRunning={isRunning} />

                {/* nodes count */}
                <div className='flex items-center gap-1.5'>
                    <LayersIcon className='w-3.5 h-3.5 text-white/35' />
                    <span className='text-xs text-white/[0.65]'>
                        {stats.completedNodes}/{stats.totalNodes} nodes
                    </span>
                </div>

                {/* max depth */}
                {stats.maxDepth > 0 && (
                    <div className='flex items-center gap-1.5'>
                        <ActivityIcon className='w-3.5 h-3.5 text-white/35' />
                        <span className='text-xs text-white/[0.65]'>depth {stats.maxDepth}</span>
                    </div>
                )}

                {/* duration */}
                <div className='flex items-center gap-1.5'>
                    <ClockIcon className='w-3.5 h-3.5 text-white/35' />
                    <span className='text-xs text-white/[0.65]'>{formatDuration(stats.duration)}</span>
                </div>

                {/* errors */}
                {stats.errorNodes > 0 && (
                    <div className='flex items-center gap-1.5'>
                        <XCircleIcon className='w-3.5 h-3.5 text-red-400' />
                        <span className='text-xs text-red-600'>{stats.errorNodes} errors</span>
                    </div>
                )}
            </div>
        </div>
    );
});

RLMStatus.displayName = 'RLMStatus';
