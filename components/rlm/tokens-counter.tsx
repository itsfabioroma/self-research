'use client';

import { useState, useEffect, useRef } from 'react';

interface TokensCounterProps {
    isRunning: boolean;
    className?: string;
}

// fake tokens counter: 0 -> 20M over ~30s
export function TokensCounter({ isRunning, className }: TokensCounterProps) {
    const [tokens, setTokens] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            // reset and start
            setTokens(0);
            startTimeRef.current = Date.now();

            intervalRef.current = setInterval(() => {
                const elapsed = Date.now() - (startTimeRef.current || Date.now());
                const progress = Math.min(elapsed / 30000, 1); // 30s to reach 20M

                // easing: start fast, slow down
                const eased = 1 - Math.pow(1 - progress, 2);
                const newTokens = Math.floor(eased * 20_000_000);

                setTokens(newTokens);
            }, 50);
        } else {
            // stop
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    // format number with K/M suffix
    const formatTokens = (n: number): string => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return n.toString();
    };

    // don't render if no tokens yet and not running
    if (tokens === 0 && !isRunning) return null;

    return (
        <div className={className}>
            <span className='text-xs font-mono text-gray-500'>
                {formatTokens(tokens)} tokens
            </span>
        </div>
    );
}
