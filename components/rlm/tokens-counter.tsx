'use client';

import { useState, useEffect, useRef } from 'react';

interface TokensCounterProps {
    isRunning: boolean;
    className?: string;
}

const TOKEN_STEP = 1_000;
const TICK_MS = 120;

export function TokensCounter({ isRunning, className }: TokensCounterProps) {
    const [tokens, setTokens] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            startTimeoutRef.current = setTimeout(() => {
                setTokens(TOKEN_STEP);
            }, 0);

            intervalRef.current = setInterval(() => {
                setTokens((current) => current + TOKEN_STEP);
            }, TICK_MS);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current);
                startTimeoutRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current);
            }
        };
    }, [isRunning]);

    const formatTokens = (n: number): string => {
        if (n >= 1_000) {
            return `${Math.floor(n / 1_000)}K`;
        }
        return n.toString();
    };

    if (tokens === 0 && !isRunning) return null;

    return (
        <div className={className}>
            <span className='text-xs font-mono text-gray-500'>
                {formatTokens(tokens)} tokens
            </span>
        </div>
    );
}
