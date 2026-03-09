'use client';

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface AirbnbLogoProps {
    className?: string;
    animate?: boolean;
}

// Real Airbnb logo from Iconify
export function AirbnbLogo({ className, animate }: AirbnbLogoProps) {
    return (
        <Icon
            icon='simple-icons:airbnb'
            className={cn(className, animate && 'animate-pulse')}
        />
    );
}

// Mini version for badges
export function AirbnbMini({ className }: { className?: string }) {
    return <Icon icon='simple-icons:airbnb' className={className} />;
}
