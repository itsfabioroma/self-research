'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    if (pathname === '/') {
        return (
            <>
                <Toaster />
                {children}
            </>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='relative'>
                <SidebarTrigger className='absolute top-5 left-3 z-10' />
                <Toaster />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
