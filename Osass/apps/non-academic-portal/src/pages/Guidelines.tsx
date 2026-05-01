import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ImplementationGuidelineDownload } from "@/components/ImplementationGuidelineDownload";

const Guidelines = () => {
    const { eligibility } = useAuth();
    const requirement = eligibility?.applicationRequirment;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/30 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">Promotion Guidelines</h1>
                    <p className="text-base text-muted-foreground font-light">
                        Requirements for advancement to {requirement?.name || eligibility?.applicantNextPosition || 'Next Rank'}
                    </p>
                </div>
                <ImplementationGuidelineDownload size="sm" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">01</span>
                            Eligibility Requirements
                        </h2>
                        <div className="card-elevated p-8 space-y-4">
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                <p className="text-sm">
                                    Minimum of {requirement?.minimumNumberOfYearsFromLastPromotion || 4} years of continuous service as a {requirement?.previousPosition || 'current position holder'}.
                                </p>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                <p className="text-sm">
                                    Must have at least {requirement?.minimumNumberOfKnowledgeMaterials || 0} Knowledge &amp; Profession materials, including at least {requirement?.minimumNumberOfJournals || 0} refereed publications.
                                </p>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                <p className="text-sm">Consistent satisfaction of annual appraisal requirements.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">02</span>
                            Assessment Scoring Tables
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card-elevated p-6 space-y-4">
                                <h3 className="font-bold border-b border-border pb-2 text-sm uppercase tracking-wider">Performance at Work (Max 100)</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">High</span>
                                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">80 - 100</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Good</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">60 - 79.9</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Adequate</span>
                                        <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold">50 - 59.9</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Not Met</span>
                                        <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold">&lt; 50</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-elevated p-6 space-y-4">
                                <h3 className="font-bold border-b border-border pb-2 text-sm uppercase tracking-wider">Knowledge &amp; Profession</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">High</span>
                                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">90 - 140</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Good</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">70 - 89.9</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Adequate</span>
                                        <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold">50 - 69.9</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Not Met</span>
                                        <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold">&lt; 50</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">03</span>
                            Promotion Performance Matrix
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                Advancement is determined by the combination of assessment levels across Performance at Work, Knowledge &amp; Profession, and Service. Below are the minimum requirements per position:
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { rank: "Standard Advancement", combinations: ["2 Highs + 1 Adequate", "3 Goods"] },
                                    { rank: "Merit Advancement", combinations: ["2 Highs + 1 Good"] },
                                    { rank: "Distinguished Advancement", combinations: ["3 Highs"] },
                                ].map((rankItem) => (
                                    <div key={rankItem.rank} className="border border-border rounded-lg p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h3 className="text-lg font-bold text-foreground shrink-0">{rankItem.rank}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {rankItem.combinations.map((c, idx) => (
                                                <span key={idx} className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/10">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {requirement?.performanceCriteria && requirement.performanceCriteria.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Specific Combinations for {requirement.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {requirement.performanceCriteria.map((criteria, i) => {
                                        const [t, p, s] = criteria.split(",");
                                        return (
                                            <div key={i} className="card-elevated p-6 space-y-3 bg-secondary/5 border border-secondary/20">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                        <span>Performance at Work</span>
                                                        <span className="text-secondary font-black">{t}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                        <span>Knowledge &amp; Profession</span>
                                                        <span className="text-secondary font-black">{p}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                        <span>Service</span>
                                                        <span className="text-secondary font-black">{s}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-primary text-white p-6 rounded-2xl shadow-xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/20 pb-3">
                            <AlertCircle className="w-5 h-5 text-secondary" />
                            <h3 className="font-bold text-lg text-secondary">Important Note</h3>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">
                            The OSASS system strictly adheres to the UMaT Statutes. Your advancement to {requirement?.name || 'the next rank'} depends on meeting these minimum combinations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guidelines;
