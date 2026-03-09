import Link from 'next/link';
import Dither from '@/components/Dither';
import { Button } from '@/components/ui/button';

export default function Page() {
    return (
        <div className='min-h-screen bg-[#050816] text-white'>
            <section className='relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6'>
                <div className='absolute inset-0'>
                    <Dither
                        waveColor={[0.3, 1, 0.5]}
                        disableAnimation={false}
                        enableMouseInteraction
                        mouseRadius={0.3}
                        colorNum={4}
                        waveAmplitude={0.3}
                        waveFrequency={3}
                        waveSpeed={0.05}
                    />
                </div>

                <div className='relative z-10 flex max-w-3xl flex-col items-center text-center'>
                    <div className='mb-6 rounded-full border border-white/12 bg-black/25 px-6 py-2 font-mono text-sm tracking-[0.28em] text-white/75 backdrop-blur-md'>
                        :: self-research ::
                    </div>
                    <h1 className='text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl'>
                        Massive-context AI research
                        <span className='block'>for biological discovery</span>
                    </h1>
                    <p className='mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg'>
                        Use recursive language models to verify hypotheses, trace contradictions, and plan experiment loops
                        across large biological context windows.
                    </p>
                    <Button
                        asChild
                        size='lg'
                        className='mt-10 bg-emerald-300 text-black hover:bg-emerald-200'
                    >
                        <Link href='/research'>Open Research</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
