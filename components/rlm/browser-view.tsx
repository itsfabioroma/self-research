'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { GlobeIcon, LoaderIcon, XIcon, RefreshCwIcon, ExternalLinkIcon } from 'lucide-react';

export interface BrowserViewProps {
    // URL to scrape (triggers new session)
    url?: string;

    // or direct live URL (if session already exists)
    liveUrl?: string;

    // styling
    className?: string;

    // callback when session created
    onSessionCreated?: (sessionId: string, liveUrl: string) => void;

    // callback when closed
    onClose?: () => void;
}

export function BrowserView({ url, liveUrl: initialLiveUrl, className, onSessionCreated, onClose }: BrowserViewProps) {
    const [liveUrl, setLiveUrl] = useState<string | null>(initialLiveUrl || null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    // start session when url provided (only once per url)
    useEffect(() => {
        if (!url || initialLiveUrl || hasStarted) return;

        const startSession = async () => {
            setLoading(true);
            setError(null);
            setHasStarted(true);

            try {
                const res = await fetch('/api/scrape/live', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to create session');
                }

                setLiveUrl(data.liveUrl);
                setSessionId(data.sessionId);
                onSessionCreated?.(data.sessionId, data.liveUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to start browser');
            } finally {
                setLoading(false);
            }
        };

        startSession();
    }, [url, initialLiveUrl, hasStarted, onSessionCreated]);

    // retry handler
    const handleRetry = useCallback(() => {
        setHasStarted(false);
        setError(null);
    }, []);

    // cleanup session on unmount
    useEffect(() => {
        return () => {
            if (sessionId) {
                fetch('/api/scrape/live', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                }).catch(console.error);
            }
        };
    }, [sessionId]);

    // loading state
    if (loading) {
        return (
            <div className={cn('flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8', className)}>
                <LoaderIcon className='w-8 h-8 text-blue-400 animate-spin mb-3' />
                <p className='text-sm text-gray-400'>Starting browser session...</p>
                <p className='text-xs text-gray-500 mt-1'>{url}</p>
            </div>
        );
    }

    // error state
    if (error) {
        return (
            <div className={cn('flex flex-col items-center justify-center bg-red-950 rounded-lg p-8', className)}>
                <XIcon className='w-8 h-8 text-red-400 mb-3' />
                <p className='text-sm text-red-300 mb-3'>{error}</p>
                {url && (
                    <button
                        onClick={handleRetry}
                        className='flex items-center gap-2 px-3 py-1.5 bg-red-900 text-red-200 rounded text-xs hover:bg-red-800 transition-colors'
                    >
                        <RefreshCwIcon className='w-3 h-3' />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // no URL state
    if (!liveUrl) {
        return (
            <div className={cn('flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8', className)}>
                <GlobeIcon className='w-8 h-8 text-gray-600 mb-3' />
                <p className='text-sm text-gray-500'>No browser session active</p>
            </div>
        );
    }

    // live view iframe
    return (
        <div className={cn('flex flex-col bg-gray-900 rounded-lg overflow-hidden', className)}>
            {/* toolbar */}
            <div className='flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700'>
                <div className='flex items-center gap-2'>
                    <GlobeIcon className='w-4 h-4 text-green-400' />
                    <span className='text-xs text-gray-400 truncate max-w-[200px]'>{url || 'Live Session'}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <a
                        href={liveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-1.5 text-gray-500 hover:text-gray-300 transition-colors'
                        title='Open in new tab'
                    >
                        <ExternalLinkIcon className='w-3.5 h-3.5' />
                    </a>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className='p-1.5 text-gray-500 hover:text-gray-300 transition-colors'
                            title='Close'
                        >
                            <XIcon className='w-3.5 h-3.5' />
                        </button>
                    )}
                </div>
            </div>

            {/* iframe */}
            <iframe
                src={liveUrl}
                className='flex-1 w-full bg-white'
                style={{ minHeight: '400px' }}
                frameBorder='0'
                allow='clipboard-read; clipboard-write'
            />
        </div>
    );
}
