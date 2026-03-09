'use client';

import { memo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { RLMTreeState } from '@/lib/rlm/types';

export interface ExecutionLogProps {
    treeState: RLMTreeState;
    className?: string;
}

export const ExecutionLog = memo(({ treeState, className }: ExecutionLogProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [treeState.nodes]);

    // build log entries from nodes
    const logEntries: { time: string; type: string; depth: number; message: string; nodeId: string }[] = [];

    treeState.nodes.forEach((node) => {
        const time = new Date(node.startedAt).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        // node created
        if (node.parentId) {
            logEntries.push({
                time,
                type: 'spawn',
                depth: node.depth,
                message: `Spawned #${node.id.slice(0, 4)}`,
                nodeId: node.id,
            });
        } else {
            logEntries.push({
                time,
                type: 'root',
                depth: 0,
                message: `Root agent started`,
                nodeId: node.id,
            });
        }

        // code generated (root)
        if (node.code && !node.parentId) {
            logEntries.push({
                time,
                type: 'code',
                depth: 0,
                message: `Generated ${node.code.split('\n').length} lines of Python`,
                nodeId: node.id,
            });
        }

        // output (includes depth info from sub-agents)
        if (node.output && node.output.trim()) {
            const lines = node.output.trim().split('\n').filter(Boolean);
            lines.forEach((line) => {
                // detect depth markers like [depth 1]
                const depthMatch = line.match(/\[depth (\d+)\]/);
                const isDepthLog = !!depthMatch;

                logEntries.push({
                    time,
                    type: isDepthLog ? 'exec' : 'output',
                    depth: depthMatch ? parseInt(depthMatch[1]) : node.depth,
                    message: line.slice(0, 100),
                    nodeId: node.id,
                });
            });
        }

        // completion
        if (node.status === 'completed' && node.completedAt) {
            const duration = node.completedAt - node.startedAt;
            logEntries.push({
                time: new Date(node.completedAt).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
                type: 'done',
                depth: node.depth,
                message: `#${node.id.slice(0, 4)} done (${duration}ms)`,
                nodeId: node.id,
            });
        }

        // error
        if (node.error) {
            logEntries.push({
                time,
                type: 'error',
                depth: node.depth,
                message: `Error: ${node.error.slice(0, 60)}`,
                nodeId: node.id,
            });
        }
    });

    // sort by time
    logEntries.sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className={cn('flex flex-col overflow-hidden bg-transparent', className)}>
            {/* log content */}
            <div ref={scrollRef} className='flex-1 overflow-y-auto p-2 font-mono text-xs'>
                {logEntries.length === 0 ? (
                    <div className='italic text-white/[0.35]'>Waiting for execution...</div>
                ) : (
                    logEntries.map((entry, idx) => (
                        <div key={idx} className='flex gap-2 rounded-md py-0.5 hover:bg-white/5'>
                            <span className='flex-shrink-0 text-white/[0.3]'>{entry.time}</span>

                            {/* depth indicator */}
                            <span
                                className={cn(
                                    'flex-shrink-0 w-6 text-center font-medium',
                                    entry.depth === 0 && 'text-blue-500',
                                    entry.depth === 1 && 'text-fuchsia-300',
                                    entry.depth === 2 && 'text-amber-300',
                                    entry.depth >= 3 && 'text-red-300'
                                )}
                            >
                                d{entry.depth}
                            </span>

                            {/* type badge */}
                            <span
                                className={cn(
                                    'flex-shrink-0 w-14',
                                    entry.type === 'spawn' && 'text-purple-600',
                                    entry.type === 'root' && 'text-sky-300',
                                    entry.type === 'code' && 'text-cyan-300',
                                    entry.type === 'exec' && 'text-amber-300',
                                    entry.type === 'output' && 'text-white/[0.45]',
                                    entry.type === 'done' && 'text-emerald-300',
                                    entry.type === 'error' && 'text-red-300'
                                )}
                            >
                                [{entry.type}]
                            </span>

                            {/* message */}
                            <span className='truncate text-white/[0.78]'>{entry.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

ExecutionLog.displayName = 'ExecutionLog';
