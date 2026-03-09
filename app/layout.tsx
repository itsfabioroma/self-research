import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
    title: 'Self Research',
    description: 'Research, chat, and documentation tools in one workspace.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang='en'
            suppressHydrationWarning
        >
            <body className='antialiased'>
                <ThemeProvider
                    attribute='class'
                    forcedTheme='light'
                >
                    <AppShell>{children}</AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
