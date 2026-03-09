'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { PencilIcon, PlusIcon, MessageSquareIcon } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { isResearchContext } from '@/lib/rlm/persistence';

interface Context {
    id: string;
    metadata?: {
        name?: string;
        kind?: string;
        [key: string]: unknown;
    };
}

export function AppSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [contexts, setContexts] = useState<Context[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [hoveredContextId, setHoveredContextId] = useState<string | null>(null);
    const [renameContextId, setRenameContextId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [savingRename, setSavingRename] = useState(false);
    const contextsRef = useRef<Context[]>([]);
    const researchContexts = contexts.filter(isResearchContext);

    // Handle client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        contextsRef.current = contexts;
    }, [contexts]);

    // Fetch contexts list - refetch when navigating to a context not in list
    useEffect(() => {
        if (!mounted) return;

        // Check if current path is a context we don't have yet
        const contextMatch = pathname.match(/^\/research\/(.+)$/);
        const currentContextId = contextMatch?.[1];
        const hasContext = contextsRef.current.some((c) => c.id === currentContextId);

        // Skip refetch if we already have this context (or not on a context page)
        if (currentContextId && hasContext) return;

        async function loadContexts() {
            setLoading(contextsRef.current.length === 0);
            try {
                const response = await fetch('/api/contexts');
                if (response.ok) {
                    const result = await response.json();
                    setContexts(result.contexts?.data || []);
                }
            } catch (error) {
                console.error('Failed to load contexts:', error);
            } finally {
                setLoading(false);
            }
        }

        loadContexts();
    }, [mounted, pathname]);

    // Handle new chat
    const handleNewChat = () => {
        router.push('/research');
    };

    // Truncate first message for display
    const getContextName = (context: Context) => {
        return context.metadata?.name || 'New Chat';
    };

    const openRenameDialog = (context: Context) => {
        setRenameContextId(context.id);
        setRenameValue(getContextName(context));
    };

    const closeRenameDialog = () => {
        if (savingRename) return;
        setRenameContextId(null);
        setRenameValue('');
    };

    const handleRename = async () => {
        const nextName = renameValue.trim();
        if (!renameContextId || !nextName) return;

        setSavingRename(true);
        try {
            const response = await fetch('/api/contexts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextId: renameContextId,
                    name: nextName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename context');
            }

            setContexts((current) =>
                current.map((context) =>
                    context.id === renameContextId
                        ? {
                              ...context,
                              metadata: {
                                  ...(context.metadata ?? {}),
                                  name: nextName,
                              },
                          }
                        : context
                )
            );
            setRenameContextId(null);
            setRenameValue('');
        } catch (error) {
            console.error('Failed to rename context:', error);
        } finally {
            setSavingRename(false);
        }
    };

    // Check if context is active
    const isActive = (contextId: string) => {
        return pathname === `/research/${contextId}`;
    };

    return (
        <Sidebar
            variant='floating'
            className='z-30 px-1 py-2 [&_[data-slot=sidebar-inner]]:border [&_[data-slot=sidebar-inner]]:border-white/10 [&_[data-slot=sidebar-inner]]:bg-black/25 [&_[data-slot=sidebar-inner]]:backdrop-blur-2xl [&_[data-slot=sidebar-inner]]:shadow-[0_24px_80px_rgba(0,0,0,0.45)] [&_[data-slot=sidebar-inner]]:rounded-[28px]'
        >
            <SidebarHeader className='px-3 pt-3'>
                <Button
                    onClick={handleNewChat}
                    className='w-full justify-start rounded-xl border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.14] hover:text-white'
                    variant='outline'
                >
                    <PlusIcon className='size-4' />
                    New Research
                </Button>
            </SidebarHeader>

            <SidebarContent className='px-2 pb-3'>
                <SidebarGroup className='gap-2'>
                    <SidebarGroupLabel className='px-3 text-white/55 uppercase tracking-[0.18em] text-[11px]'>Researches</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className='gap-1.5'>
                            {!mounted ? null : loading ? (

// Loading skeleton
                                Array.from({ length: 5 }).map((_, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuSkeleton
                                            showIcon
                                            className='rounded-xl bg-white/[0.04]'
                                        />
                                    </SidebarMenuItem>
                                ))
                            ) : researchContexts.length === 0 ? (
                                // Empty state
                                <div className='px-3 py-4 text-center text-sm text-white/40'>
                                    No researches yet
                                </div>
                            ) : (
                                // Context list
                                researchContexts.map((context) => (
                                    <SidebarMenuItem key={context.id} className='group/item'>
                                        <motion.div
                                            layout
                                            className='flex items-center'
                                            onHoverStart={() => setHoveredContextId(context.id)}
                                            onHoverEnd={() => setHoveredContextId((current) => current === context.id ? null : current)}
                                        >
                                            <motion.div layout className='min-w-0 flex-1'>
                                                <SidebarMenuButton
                                                    isActive={isActive(context.id)}
                                                    className='min-w-0 w-full rounded-xl border border-transparent bg-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.08] hover:text-white data-[active=true]:border-white/12 data-[active=true]:bg-white/[0.12] data-[active=true]:text-white'
                                                    onClick={() => router.push(`/research/${context.id}`)}
                                                >
                                                    <MessageSquareIcon className='text-white/45' />
                                                    <span className='truncate'>{getContextName(context)}</span>
                                                </SidebarMenuButton>
                                            </motion.div>

                                            <motion.div
                                                layout
                                                initial={false}
                                                animate={{
                                                    width: hoveredContextId === context.id ? 36 : 0,
                                                    opacity: hoveredContextId === context.id ? 1 : 0,
                                                    marginLeft: hoveredContextId === context.id ? 4 : 0,
                                                }}
                                                transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                                                className='overflow-hidden'
                                            >
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='size-8 shrink-0 rounded-lg text-white/40 hover:bg-white/[0.08] hover:text-white'
                                                    onClick={() => openRenameDialog(context)}
                                                    aria-label={`Rename ${getContextName(context)}`}
                                                    tabIndex={hoveredContextId === context.id ? 0 : -1}
                                                >
                                                    <PencilIcon className='size-4' />
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <Dialog open={renameContextId !== null} onOpenChange={(open) => (!open ? closeRenameDialog() : null)}>
                <DialogContent className='border-white/10 bg-[#0b1014] text-white sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Rename Research</DialogTitle>
                        <DialogDescription className='text-white/55'>
                            Save a custom title for this research in the local workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-2'>
                        <label htmlFor='rename-context' className='text-sm text-white/70'>
                            Title
                        </label>
                        <Input
                            id='rename-context'
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && renameValue.trim()) {
                                    event.preventDefault();
                                    void handleRename();
                                }
                            }}
                            className='border-white/10 bg-white/[0.06] text-white'
                            placeholder='Research title'
                            disabled={savingRename}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant='ghost' onClick={closeRenameDialog} disabled={savingRename}>
                            Cancel
                        </Button>
                        <Button onClick={() => void handleRename()} disabled={!renameValue.trim() || savingRename}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sidebar>
    );
}
