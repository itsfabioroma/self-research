'use client';

import { useState } from 'react';
import { FlaskConicalIcon, MicroscopeIcon, SearchIcon } from 'lucide-react';
import { RLMChat } from '@/components/rlm/rlm-chat';
import GrainWave from '@/components/grain-wave';
import { generateContradictionDataset } from '@/lib/rlm/contradiction-generator';
import { UCLogo } from '@/components/rlm/uc-logo';
import MagicBento from '@/components/MagicBento';
import type { PersistedRLMExecution } from '@/lib/rlm/persistence';

const HYPOTHESIS_CONTEXT = `# Project
Disease area: EGFR-mutant non-small-cell lung cancer
Question: Does adaptive resistance emerge through bypass signaling rather than secondary EGFR mutation?

## Evidence
- Early phosphoproteomics shows ERK rebound after 48 hours of EGFR inhibition
- RNA-seq shows MET and ERBB3 induction in resistant clones
- Single-cell data suggests a pre-existing persister subpopulation
- A small CRISPR screen weakly supports SHP2 dependence
- Two xenograft studies report partial rescue with combined EGFR + MET blockade
- One recent paper argues resistance is mainly due to altered chromatin state rather than bypass signaling
- Internal lab notes mention inconsistent MET activation across replicates

## Goal
Evaluate whether the bypass-signaling hypothesis is supported, what alternative explanations remain plausible, and what experiments would best falsify it.
`;

const SELF_EXPERIMENTATION_CONTEXT = `# Program
Objective: Iteratively improve a wet-lab perturbation pipeline for organoid screening.

## Current system
- Cell models: colorectal cancer organoids with matched normal controls
- Readouts: viability, morphology, targeted RNA panel, cytokine panel
- Perturbations: KRAS inhibitor dose matrix, MEK inhibitor combinations, hypoxia condition
- Constraints: 2 technicians, 3-week cycle time, limited sequencing budget

## Prior runs
- Run 1: strong viability effect, weak transcriptional separation
- Run 2: better separation, but batch effects confounded interpretation
- Run 3: added controls and plate randomization, but morphology scoring drifted

## Goal
Propose the next experiment cycle, identify the highest-value measurements, and suggest a strategy for learning from each run without exploding cost.
`;

type DemoExample = {
    id: string;
    name: string;
    description: string;
    query: string;
    contextGenerator: () => string;
};

const DEMO_EXAMPLES: DemoExample[] = [
    {
        id: 'falsiability',
        name: 'Falsiability',
        description: 'Contradiction scan',
        query: 'Find all contradicting statement pairs. Use llm_query_batch() for maximum parallelism.',
        contextGenerator: () => generateContradictionDataset(500, 0.1).statements,
    },
    {
        id: 'hypothesis-verification',
        name: 'Hypothesis Verification',
        description: 'Mechanism audit',
        query: 'Evaluate this biological hypothesis. Map supporting evidence, contradictions, alternative explanations, and the highest-value falsification experiments.',
        contextGenerator: () => HYPOTHESIS_CONTEXT,
    },
    {
        id: 'self-experimentation',
        name: 'Self-Experimentation',
        description: 'Experiment loops',
        query: 'Design the next experiment cycle from this research history. Prioritize interventions, measurements, controls, and how to learn across iterations.',
        contextGenerator: () => SELF_EXPERIMENTATION_CONTEXT,
    },
];

export function ResearchWorkspace({
    initialExecution,
    contextId,
}: {
    initialExecution?: PersistedRLMExecution | null;
    contextId?: string | null;
}) {
    const inferredExample = DEMO_EXAMPLES.find((example) => example.query === initialExecution?.query) ?? null;
    const [selectedExample, setSelectedExample] = useState<DemoExample | null>(inferredExample);
    const [generatedContext, setGeneratedContext] = useState(initialExecution?.context ?? '');
    const [generatedQuery, setGeneratedQuery] = useState(initialExecution?.query ?? '');
    const [maxDepth, setMaxDepth] = useState(initialExecution?.maxDepth ?? 1);

    const handleExampleSelect = (example: DemoExample) => {
        setSelectedExample(example);
        setGeneratedContext(example.contextGenerator());
        setGeneratedQuery(example.query);
    };

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
                            <div>
                                <h1 className='text-lg font-semibold text-white'>Bio Research Workspace</h1>
                                <p className='text-xs text-white/[0.6]'>Large-context recursive research for biological evidence synthesis</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm backdrop-blur-md'>
                            <span className='text-white/[0.6]'>Depth:</span>
                            <input
                                type='range'
                                min='1'
                                max='4'
                                value={maxDepth}
                                onChange={(event) => setMaxDepth(Number(event.target.value))}
                                className='w-16 accent-[#8ba08e]'
                            />
                            <span className='font-mono text-white'>{maxDepth}</span>
                        </div>
                    </div>
                </header>

                <div className='mt-3 rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-1.5 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.24)]'>
                    <div className='mb-1 px-1.5'>
                        <div>
                            <div className='text-[11px] font-medium uppercase tracking-[0.22em] text-white/45'>Research Templates</div>
                        </div>
                    </div>

                    <div className='overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                        <div className='min-w-[920px]'>
                            <MagicBento
                                cards={DEMO_EXAMPLES.map((example) => ({
                                    id: example.id,
                                    title: example.name,
                                    description: example.description,
                                    selected: selectedExample?.id === example.id,
                                    onClick: () => handleExampleSelect(example),
                                    color: 'linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))',
                                    icon: example.id === 'falsiability' ? (
                                        <SearchIcon className='h-4 w-4' />
                                    ) : example.id === 'hypothesis-verification' ? (
                                        <MicroscopeIcon className='h-4 w-4' />
                                    ) : (
                                        <FlaskConicalIcon className='h-4 w-4' />
                                    ),
                                }))}
                                textAutoHide={true}
                                enableStars={false}
                                enableSpotlight
                                enableBorderGlow={true}
                                enableTilt
                                enableMagnetism
                                clickEffect
                                spotlightRadius={320}
                                particleCount={12}
                                glowColor='137, 146, 132'
                                disableAnimations={false}
                            />
                        </div>
                    </div>
                </div>

                <div className='mt-2.5 flex-1 pb-4'>
                    <div
                        className='min-h-[520px] overflow-hidden rounded-[32px] border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]'
                        style={{ height: 'calc(100vh - 308px)' }}
                    >
                        <RLMChat
                            initialContext={generatedContext}
                            initialQuery={generatedQuery}
                            initialContextId={contextId ?? initialExecution?.snapshot.rootContextId ?? null}
                            initialTreeState={initialExecution?.snapshot}
                            initialFinalResult={initialExecution?.result ?? initialExecution?.snapshot.finalResult ?? null}
                            maxDepth={maxDepth}
                            className='h-full'
                            key={`${contextId ?? 'new'}-${selectedExample?.name ?? 'session'}-${maxDepth}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
