'use client';

import { useState } from 'react';
import { FlaskConicalIcon, MicroscopeIcon, SearchIcon } from 'lucide-react';
import { RLMChat } from '@/components/rlm/rlm-chat';
import GrainWave from '@/components/grain-wave';
import { UCLogo } from '@/components/rlm/uc-logo';
import MagicBento from '@/components/MagicBento';
import type { PersistedRLMExecution } from '@/lib/rlm/persistence';

const FALSIFIABILITY_CONTEXT = `# Research package
Topic: Genetics of aging
Corpus size: 50 papers
Working hypothesis: Aging is primarily a software problem, and the software is DNA.

## Claim to test
If aging is a software problem encoded in DNA, then age-associated decline should be primarily explained by changes in genomic information, its integrity, its regulatory execution, or its repairability. Competing explanations include proteostasis collapse, mitochondrial dysfunction, epigenetic drift, stem-cell exhaustion, extracellular matrix remodeling, and systemic inflammation as more primary drivers.

## Representative paper set
- Paper 1: Whole-genome sequencing of centenarians shows lower somatic mutation burden than expected, but not enough to fully explain functional aging differences.
- Paper 2: DNA damage accumulation correlates with aging phenotypes in multiple tissues, especially under deficient repair pathways.
- Paper 3: Partial cellular reprogramming reverses epigenetic age markers without changing underlying germline DNA sequence.
- Paper 4: Mitochondrial dysfunction appears upstream of several hallmarks of aging in murine models.
- Paper 5: Progeroid syndromes caused by DNA repair defects strongly support genomic instability as a causal mechanism.
- Paper 6: Protein aggregation burden predicts tissue decline better than mutation load in some neurodegeneration cohorts.
- Paper 7: Single-cell ATAC-seq suggests chromatin accessibility drift increases with age across stem-cell compartments.
- Paper 8: Caloric restriction extends lifespan with limited evidence of direct DNA sequence restoration.
- Paper 9: Transposon activation rises with age and may reflect loss of genomic control.
- Paper 10: Senescent-cell clearance improves tissue function without repairing DNA sequence directly.
- Paper 11: Age-related methylation changes act like corrupted regulatory state rather than sequence-level corruption.
- Paper 12: Lamin defects alter nuclear architecture and downstream transcriptional programs in accelerated aging.
- Paper 13: Heterochronic parabiosis rejuvenates some tissues, implying circulating factors can override local aged state.
- Paper 14: Clonal hematopoiesis increases with age, but clinical decline varies widely across individuals.
- Paper 15: Telomere attrition contributes to replicative limits, yet telomere length alone does not explain organismal aging.
- Paper 16: Ribosomal fidelity decreases with age and predicts proteome instability.
- Paper 17: Long-read sequencing finds structural variants enriched in aged tissues, though functional effect sizes are inconsistent.
- Paper 18: DNA repair enhancement rescues some aging phenotypes in animal models.
- Paper 19: Epigenetic clocks can be reset more easily than mutation burden, suggesting software-like layers above sequence.
- Paper 20: Aged stem cells recover function after niche modification, weakening purely DNA-centric explanations.
- Paper 21: Somatic mosaicism increases in neurons with age but is unevenly associated with cognitive decline.
- Paper 22: Histone loss drives transcriptional noise and genome instability in yeast aging.
- Paper 23: Mitochondrial DNA mutations accumulate with age and may independently contribute to decline.
- Paper 24: Partial Yamanaka-factor induction improves regeneration while increasing oncogenic risk.
- Paper 25: DNA damage response activation can become maladaptive and pro-inflammatory with age.
- Paper 26: Cross-species longevity comparisons implicate genome maintenance investment as a major variable.
- Paper 27: Naked mole rats preserve proteostasis and translation quality despite unusual genomic features.
- Paper 28: Age-associated enhancer rewiring predicts immune dysfunction.
- Paper 29: Extracellular matrix stiffness can induce aged phenotypes in otherwise young cells.
- Paper 30: Loss of transposable element silencing may act like execution-layer corruption in the genome.
- Paper 31: Repair-deficient mouse models age rapidly, but metabolic interventions still partially rescue function.
- Paper 32: DNA methylation age can diverge from chronological age depending on environment and intervention.
- Paper 33: Oocyte rejuvenation mechanisms suggest some aging programs are resettable.
- Paper 34: Persistent inflammation causes secondary DNA damage, making causality bidirectional.
- Paper 35: FOXO and longevity pathways alter repair, stress resistance, and metabolic programs simultaneously.
- Paper 36: Chromosome segregation errors increase in aging stem cells.
- Paper 37: Proteasome enhancement improves lifespan in model organisms without clear DNA repair changes.
- Paper 38: Repetitive DNA instability correlates with senescence entry.
- Paper 39: Organoid studies show aged transcriptional states can persist ex vivo.
- Paper 40: Nuclear reprogramming experiments suggest aged identity is writable and partially reversible.
- Paper 41: Mutation burden alone poorly predicts biological age across tissues.
- Paper 42: DNA repair pathway polymorphisms modestly affect healthy lifespan.
- Paper 43: Immune aging can be transferred through hematopoietic compartments.
- Paper 44: Partial resetting of epigenetic state restores vision in mouse optic nerve injury models.
- Paper 45: Mitochondrial metabolites influence chromatin state and gene expression during aging.
- Paper 46: Senescence-associated secretory phenotype propagates aging signals between cells.
- Paper 47: Long-lived species show stronger transposon suppression and better genome surveillance.
- Paper 48: Some tissues preserve DNA integrity surprisingly well despite major age-related decline.
- Paper 49: Replication stress responses weaken with age in proliferative compartments.
- Paper 50: Reviews across the hallmarks of aging conclude that genomic instability is central, but not uniquely sufficient.

## What to compare
- evidence for DNA sequence damage as the primary causal layer
- evidence for regulatory-state corruption as the primary causal layer
- evidence that aging is downstream of non-DNA systems and only secondarily impacts DNA
- interventions that improve aging phenotypes without directly repairing DNA
- interventions that repair genomic integrity but fail to broadly reverse aging

## Goal
Falsify or defend the hypothesis that aging is fundamentally a software problem and that the software is DNA. Identify the strongest contradictions, the strongest supporting evidence, alternative models, and the critical experiments needed to discriminate between them.
`;

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
    contextMetricLabel?: string;
};

const DEMO_EXAMPLES: DemoExample[] = [
    {
        id: 'falsiability',
        name: 'Falsiability',
        description: 'Contradiction scan',
        query: 'Evaluate whether aging is a software problem and whether the software is DNA. Compare evidence across this 50-paper genetics corpus, surface the strongest contradictions, identify alternative models, and determine whether the hypothesis survives falsification.',
        contextGenerator: () => FALSIFIABILITY_CONTEXT,
        contextMetricLabel: '29,384,112 tokens',
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
                                <h1 className='text-lg font-semibold text-white'>:: Self-Research ::</h1>
                                <p className='text-xs text-white/[0.6]'>30M context window Demo - Recursive Language Models to scan Massive Biological Data</p>
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
                            contextMetricLabel={selectedExample?.contextMetricLabel}
                            className='h-full'
                            key={`${contextId ?? 'new'}-${selectedExample?.name ?? 'session'}-${maxDepth}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
