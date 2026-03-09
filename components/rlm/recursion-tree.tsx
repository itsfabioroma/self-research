'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MaximizeIcon, MinimizeIcon } from 'lucide-react';

import { ExecutionNode, type ExecutionNodeData, type SubagentType } from './execution-node';
import type { RLMTreeState, RLMNode } from '@/lib/rlm/types';
import GrainWave from '@/components/grain-wave';

// hardcoded subagent types for concierge demo (order matters)
const SUBAGENT_TYPES: SubagentType[] = ['yelp', 'google-maps', 'reddit', 'luma', 'airbnb-user'];

// node types
const nodeTypes = {
    execution: ExecutionNode,
};

// layout config
const CHILD_NODE_SIZE = 32; // circle diameter

// radial/circular layout around parent - supports nested levels
function getRadialLayout(nodes: Node[], edges: Edge[]) {
    if (nodes.length === 0) return { nodes, edges };

    // build parent positions map (computed incrementally)
    const positions: Record<string, { x: number; y: number }> = {};

    // group children by parent
    const childrenByParent: Record<string, Node[]> = {};
    let rootId: string | null = null;

    nodes.forEach((node) => {
        const data = node.data as ExecutionNodeData;
        const parentId = data?.rlmNode?.parentId;
        if (!parentId) {
            rootId = node.id;
        } else {
            if (!childrenByParent[parentId]) childrenByParent[parentId] = [];
            childrenByParent[parentId].push(node);
        }
    });

    if (!rootId) return { nodes, edges };

    // position root at center
    positions[rootId] = { x: 0, y: 0 };

    // BFS to position all nodes level by level
    const queue: string[] = [rootId];
    while (queue.length > 0) {
        const parentId = queue.shift()!;
        const parentPos = positions[parentId];
        const children = childrenByParent[parentId] || [];

        if (children.length === 0) continue;

        // get parent's depth to determine radius
        const parentNode = nodes.find((n) => n.id === parentId);
        const parentDepth = (parentNode?.data as ExecutionNodeData)?.rlmNode?.depth || 0;

        // radius grows with depth and child count
        const baseRadius = 120 + parentDepth * 80;
        const radius = baseRadius + Math.sqrt(children.length) * 10;

        children.forEach((child, idx) => {
            const total = children.length;
            const angle = (idx / total) * Math.PI * 2 - Math.PI / 2; // start at top

            positions[child.id] = {
                x: parentPos.x + Math.cos(angle) * radius,
                y: parentPos.y + Math.sin(angle) * radius,
            };

            queue.push(child.id);
        });
    }

    // apply positions
    const layoutedNodes = nodes.map((node) => {
        const pos = positions[node.id] || { x: 0, y: 0 };
        const data = node.data as ExecutionNodeData;
        const isRoot = !data?.rlmNode?.parentId;

        return {
            ...node,
            position: {
                x: pos.x - (isRoot ? 100 : CHILD_NODE_SIZE / 2),
                y: pos.y - (isRoot ? 45 : CHILD_NODE_SIZE / 2),
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}

// check if a node's parent chain is all expanded (visible)
function isNodeVisible(
    node: RLMNode,
    allNodes: RLMNode[],
    expandedNodes: Set<string>
): boolean {
    // root is always visible
    if (!node.parentId) return true;

    // depth 1 nodes are always visible (children of root)
    if (node.depth === 1) return true;

    // for deeper nodes, check if parent is expanded
    const parent = allNodes.find((n) => n.id === node.parentId);
    if (!parent) return false;

    // parent must be expanded AND visible itself
    return expandedNodes.has(parent.id) && isNodeVisible(parent, allNodes, expandedNodes);
}

// convert RLM tree state to React Flow elements
function convertToFlowElements(
    treeState: RLMTreeState,
    selectedNodeId: string | null,
    expandedNodes: Set<string>,
    onNodeClick: (nodeId: string) => void,
    onNodeExpand: (nodeId: string) => void,
    isAirbnbDemo?: boolean
): { nodes: Node[]; edges: Edge[] } {
    // build children map
    const childrenByParent: Record<string, RLMNode[]> = {};
    treeState.nodes.forEach((node) => {
        if (node.parentId) {
            if (!childrenByParent[node.parentId]) childrenByParent[node.parentId] = [];
            childrenByParent[node.parentId].push(node);
        }
    });

    // filter to visible nodes only
    const visibleNodes = treeState.nodes.filter((node) =>
        isNodeVisible(node, treeState.nodes, expandedNodes)
    );

    // track child index per parent for subagent assignment
    const childIndexByParent: Record<string, number> = {};

    const nodes: Node[] = visibleNodes.map((rlmNode) => {
        const children = childrenByParent[rlmNode.id] || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedNodes.has(rlmNode.id);

        // assign subagent type to first 5 depth-1 children only (no repeating)
        let subagentType: SubagentType | undefined;
        if (rlmNode.parentId && rlmNode.depth === 1) {
            const parentId = rlmNode.parentId;
            if (childIndexByParent[parentId] === undefined) childIndexByParent[parentId] = 0;
            const idx = childIndexByParent[parentId];
            subagentType = idx < SUBAGENT_TYPES.length ? SUBAGENT_TYPES[idx] : undefined;
            childIndexByParent[parentId]++;
        }

        return {
            id: rlmNode.id,
            type: 'execution',
            position: { x: 0, y: 0 },
            data: {
                rlmNode,
                isSelected: rlmNode.id === selectedNodeId,
                hasChildren,
                isExpanded,
                childCount: children.length,
                subagentType: isAirbnbDemo ? subagentType : undefined,
                isAirbnbDemo,
                onClick: () => onNodeClick(rlmNode.id),
                onExpand: () => onNodeExpand(rlmNode.id),
            } as ExecutionNodeData,
        };
    });

    // edges only between visible nodes
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const edges: Edge[] = visibleNodes
        .filter((node) => node.parentId && visibleIds.has(node.parentId))
        .map((node) => ({
            id: `${node.parentId}-${node.id}`,
            source: node.parentId!,
            target: node.id,
            type: 'straight',
            animated: node.status === 'executing' || node.status === 'llm-calling',
            style: {
                stroke: node.status === 'pending' ? '#e5e7eb' : '#9ca3af',
                strokeWidth: 1,
            },
        }));

    return getRadialLayout(nodes, edges);
}

export interface RecursionTreeProps {
    treeState: RLMTreeState;
    selectedNodeId: string | null;
    onNodeSelect: (nodeId: string | null) => void;
    isAirbnbDemo?: boolean;
}

export function RecursionTree({ treeState, selectedNodeId, onNodeSelect, isAirbnbDemo }: RecursionTreeProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // track which nodes are expanded (show their children)
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const prevRootIdRef = useRef<string | null>(null);

    // auto-expand root node when new execution starts
    useEffect(() => {
        const rootNode = treeState.nodes.find((n) => !n.parentId);
        if (!rootNode) return;

        // new execution started - reset and expand root
        if (rootNode.id !== prevRootIdRef.current) {
            prevRootIdRef.current = rootNode.id;
            const frameId = window.requestAnimationFrame(() => {
                setExpandedNodes(new Set([rootNode.id]));
            });
            return () => window.cancelAnimationFrame(frameId);
        }
    }, [treeState.nodes]);

    // handle fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // handle node click (select for details panel)
    const handleNodeClick = useCallback(
        (nodeId: string) => {
            onNodeSelect(selectedNodeId === nodeId ? null : nodeId);
        },
        [selectedNodeId, onNodeSelect]
    );

    // handle node expand/collapse
    const handleNodeExpand = useCallback((nodeId: string) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    // update nodes/edges when tree state or expanded state changes
    useEffect(() => {
        if (treeState.nodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = convertToFlowElements(
            treeState,
            selectedNodeId,
            expandedNodes,
            handleNodeClick,
            handleNodeExpand,
            isAirbnbDemo
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [treeState, selectedNodeId, expandedNodes, handleNodeClick, handleNodeExpand, setNodes, setEdges, isAirbnbDemo]);

    // empty state
    if (treeState.nodes.length === 0) {
        return (
            <div className='flex h-full w-full items-center justify-center rounded-[24px] border border-white/10 border-dashed bg-white/[0.04] backdrop-blur-xl'>
                <div className='text-center text-white/45'>
                    <p className='text-sm font-medium'>No execution tree</p>
                    <p className='mt-1 text-xs'>Submit a query to start</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className='glass-flow relative h-full w-full overflow-hidden rounded-[28px] bg-transparent'>
            {isFullscreen && (
                <>
                    <div className='pointer-events-none absolute inset-0 z-0'>
                        <GrainWave
                            width='100%'
                            height='100%'
                            speed={0.5}
                            waveCount={25}
                            waveAmplitude={0.85}
                            waveFrequency={4}
                            lineThickness={0.2}
                            grainIntensity={50}
                            startColor='#173f3c'
                            endColor='#899284'
                            lightBackground='#000000'
                            darkBackground='#000000'
                            brightness={1}
                            speedVariation={0.006}
                            waveWidth={3.5}
                            scale={0.6}
                            className='h-full w-full'
                        />
                    </div>
                    <div className='pointer-events-none absolute inset-0 z-0 bg-black/30 backdrop-blur-[28px]' />
                    <div className='pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%)]' />
                </>
            )}
            <ReactFlow
                className='relative z-10 bg-transparent'
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.05}
                maxZoom={2}
                attributionPosition='bottom-left'
            >
                <Background color='rgba(255, 255, 255, 0.08)' gap={16} />

                {/* zoom controls + fullscreen */}
                <Controls showInteractive={false} className='!rounded-2xl !border !border-white/10 !bg-black/20 !backdrop-blur-xl !shadow-none'>
                    <button
                        onClick={toggleFullscreen}
                        className='react-flow__controls-button !border-0 !bg-transparent !text-white/80 hover:!bg-white/[0.08]'
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <MinimizeIcon className='w-3 h-3' />
                        ) : (
                            <MaximizeIcon className='w-3 h-3' />
                        )}
                    </button>
                </Controls>

                <MiniMap
                    nodeColor={(node) => {
                        const data = node.data as ExecutionNodeData;
                        const status = data?.rlmNode?.status;
                        switch (status) {
                            case 'completed':
                                return '#22c55e';
                            case 'error':
                                return '#ef4444';
                            case 'executing':
                            case 'llm-calling':
                                return '#3b82f6';
                            default:
                                return '#94a3b8';
                        }
                    }}
                    maskColor='rgba(0, 0, 0, 0.35)'
                    pannable
                    zoomable
                    className='!rounded-2xl !border !border-white/10 !bg-black/35 !backdrop-blur-xl'
                />
            </ReactFlow>
        </div>
    );
}
