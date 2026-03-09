'use client';

import { useState } from 'react';
import { RLMChat } from '@/components/rlm/rlm-chat';
import GrainWave from '@/components/grain-wave';
import { generateContradictionDataset } from '@/lib/rlm/contradiction-generator';
import { generateSampleCodebase } from '@/lib/doc-agent/sample-codebase';
import { UCLogo } from '@/components/rlm/uc-logo';
import { AirbnbLogo } from '@/components/rlm/airbnb-logo';
import type { PersistedRLMExecution } from '@/lib/rlm/persistence';

const AIRBNB_CONTEXT = `# Guest Profile
Name: Sarah Chen
Stay: March 15-20, 2025
Location: Mission District, San Francisco
Listing: Sunny 2BR with Garden View

## Preferences
- Foodie, loves dim sum and farm-to-table
- Morning runner, needs routes
- First time in SF
- Interested in local art scene
- Has food allergy: shellfish
- Budget: moderate-high
- Traveling with partner

## Past Bookings
- NYC: loved the jazz club rec
- Tokyo: appreciated the local ramen spots
- Paris: used walking tour suggestions daily

## Notes from Host
Guest mentioned wanting "authentic local experiences, not tourist traps"
`;

type DemoExample = {
    name: string;
    description: string;
    query: string;
    contextGenerator: () => string;
    expectedAnswer?: string;
    isAirbnb?: boolean;
};

const DEMO_EXAMPLES: DemoExample[] = [
    {
        name: 'Airbnb Concierge',
        description: 'Supercharged Experiences',
        query: 'Create a personalized 5-day itinerary for this guest. Use all subagents to gather recommendations for restaurants, activities, events, and local tips.',
        contextGenerator: () => AIRBNB_CONTEXT,
        expectedAnswer: 'Personalized itinerary',
        isAirbnb: true,
    },
    {
        name: 'Falsiability',
        description: '500 statements, ~125K pair comparisons',
        query: 'Find all contradicting statement pairs. Use llm_query_batch() for maximum parallelism.',
        contextGenerator: () => generateContradictionDataset(500, 0.1).statements,
        expectedAnswer: '~50 contradictions',
    },
    {
        name: 'Self-learning Docs',
        description: 'Generate docs for a codebase',
        query: 'Generate documentation for this codebase. For each file, use llm_query() to analyze it and return JSON with: summary, exports, dependencies, keyFunctions, tags. Then aggregate into a project overview.',
        contextGenerator: () => generateSampleCodebase(),
        expectedAnswer: 'Markdown documentation',
    },
];

export function ResearchWorkspace({
    initialExecution,
    contextId,
}: {
    initialExecution?: PersistedRLMExecution | null;
    contextId?: string | null;
}) {
    const [selectedExample, setSelectedExample] = useState<DemoExample | null>(null);
    const [generatedContext, setGeneratedContext] = useState(initialExecution?.context ?? '');
    const [generatedQuery, setGeneratedQuery] = useState(initialExecution?.query ?? '');
    const [maxDepth, setMaxDepth] = useState(initialExecution?.maxDepth ?? 1);

    const handleExampleSelect = (example: DemoExample) => {
        setSelectedExample(example);
        setGeneratedContext(example.contextGenerator());
        setGeneratedQuery(example.query);
    };

    const effectiveDepth = selectedExample?.isAirbnb ? 1 : maxDepth;

    return (
        <div className='relative min-h-screen overflow-hidden bg-transparent text-white'>
            <div className='pointer-events-none fixed inset-0 z-0'>
                <GrainWave
                    width='100%'
                    height='100vh'
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

            <div className='pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%)]' />

            <div className='relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4'>
                <header className='rounded-[28px] border border-white/[0.12] bg-white/[0.08] px-4 py-3 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-xl border border-white/10 bg-white/[0.08] p-1.5 backdrop-blur-md'>
                                <UCLogo className='h-5 w-5 text-white' />
                            </div>
                            {selectedExample?.isAirbnb ? (
                                <div>
                                    <h1 className='text-lg font-semibold text-white'>Airbnb Experiences Concierge</h1>
                                    <p className='text-xs text-white/[0.6]'>Powered by UltraContext 20M context window (RLMs)</p>
                                </div>
                            ) : (
                                <div>
                                    <h1 className='text-lg font-semibold text-white'>20M Context Window Demo</h1>
                                    <p className='text-xs text-white/[0.6]'>Self-evolving Agent Documentation</p>
                                </div>
                            )}
                        </div>

                        <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm backdrop-blur-md'>
                            <span className='text-white/[0.6]'>Depth:</span>
                            <input
                                type='range'
                                min='1'
                                max='4'
                                value={maxDepth}
                                onChange={(event) => setMaxDepth(Number(event.target.value))}
                                className={`w-16 ${selectedExample?.isAirbnb ? 'accent-[#FF5A5F]' : 'accent-[#8ef3b7]'}`}
                            />
                            <span className='font-mono text-white'>{maxDepth}</span>
                        </div>
                    </div>
                </header>

                <div className='mt-4 rounded-[28px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)]'>
                    <div className='mb-2 flex items-center gap-2'>
                        <span className='text-sm font-medium text-white/70'>Select Demo:</span>
                    </div>
                    <div className='flex items-center gap-3 overflow-x-auto pb-2'>
                        {DEMO_EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                onClick={() => handleExampleSelect(example)}
                                className={`flex-shrink-0 rounded-2xl border px-4 py-2.5 text-left transition-colors ${
                                    selectedExample?.name === example.name
                                        ? example.isAirbnb
                                            ? 'border-[#FF5A5F]/60 bg-[#FF5A5F]/15 text-white'
                                            : 'border-[#8ef3b7]/55 bg-[#8ef3b7]/12 text-white'
                                        : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20 hover:bg-white/8'
                                }`}
                            >
                                <div className='flex items-center gap-2'>
                                    {example.isAirbnb && <AirbnbLogo className='h-4 w-4' />}
                                    <span className='text-sm font-medium'>{example.name}</span>
                                </div>
                                <div className='text-xs text-white/[0.55]'>{example.description}</div>
                                {example.expectedAnswer && (
                                    <div className='mt-1 text-[10px] text-[#8ef3b7]'>Expected: {example.expectedAnswer}</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='mt-4 flex-1 pb-4'>
                    <div
                        className='overflow-hidden rounded-[32px] border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]'
                        style={{ height: 'calc(100vh - 280px)' }}
                    >
                        <RLMChat
                            initialContext={generatedContext}
                            initialQuery={generatedQuery}
                            initialContextId={contextId ?? initialExecution?.snapshot.rootContextId ?? null}
                            initialTreeState={initialExecution?.snapshot}
                            initialFinalResult={initialExecution?.result ?? initialExecution?.snapshot.finalResult ?? null}
                            maxDepth={effectiveDepth}
                            isAirbnbDemo={selectedExample?.isAirbnb}
                            className='h-full'
                            key={`${contextId ?? 'new'}-${selectedExample?.name ?? 'session'}-${effectiveDepth}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
