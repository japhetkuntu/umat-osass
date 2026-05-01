import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

const ScoreGuide = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in pb-20">
            <div className="border-b border-border/30 pb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Promotion Criteria & Scoring Guide</h1>
                <p className="text-muted-foreground text-base font-light">Official Guidelines for Appointment and Promotion of Non-Academic Staff, University of Mines and Technology (UMaT)</p>
            </div>

            {/* Performance Level Overview */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">Performance Assessment Levels</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">All three assessable areas—Performance at Work, Knowledge & Profession, and Service—are evaluated using the following four performance levels. Equal importance is accorded to each area.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { level: "High", description: "Excellence evidenced by superior performance" },
                        { level: "Good", description: "Strong mastery and consistent achievement" },
                        { level: "Adequate", description: "Satisfactory fulfillment of requirements" },
                        { level: "Inadequate", description: "Below required minimum standards" },
                    ].map((item) => (
                        <div key={item.level} className="p-4 border border-border/50 rounded-lg hover:border-border transition-colors">
                            <h4 className="font-semibold text-foreground mb-2 text-sm">{item.level}</h4>
                            <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Position Requirements */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">Minimum Eligibility Requirements</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">Specific minimum combinations for each target position are configured by the administrator in the admin portal. The general assessment frameworks below apply across all positions.</p>
                <div className="space-y-4">
                    {[
                        {
                            combination: "2 HIGH + 1 ADEQUATE",
                            description: "Excellence in two of the three areas with satisfactory performance in the third.",
                        },
                        {
                            combination: "3 GOOD",
                            description: "Consistent strong performance across all three assessment areas.",
                        },
                        {
                            combination: "2 HIGH + 1 GOOD",
                            description: "Excellence in two areas with strong performance in the third.",
                        },
                        {
                            combination: "3 HIGH",
                            description: "Outstanding performance across all three areas — the highest standard.",
                        },
                    ].map((item, idx) => (
                        <div key={idx} className="border-l border-border/50 pl-6 py-2">
                            <h3 className="text-sm font-semibold text-foreground mb-1">{item.combination}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Performance at Work Evaluation */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">1. Performance at Work</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">Assessment of work effectiveness across 10 performance categories. Scored on a scale of 0-10 per category (0-100 total).</p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Performance Level</TableHead>
                                <TableHead className="text-right">Score Range</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { level: "High", range: "80 - 100" },
                                { level: "Good", range: "60 - 79.9" },
                                { level: "Adequate", range: "50 - 59.9" },
                                { level: "Inadequate", range: "Below 50" },
                            ].map((row) => (
                                <TableRow key={row.level} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-bold">{row.level}</TableCell>
                                    <TableCell className="text-right font-medium">{row.range}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-5 border border-border/50 rounded-lg bg-background/50">
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Assessment Indicators</h4>
                    <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-5">
                        <li>Accuracy on schedule and meeting deadlines</li>
                        <li>Quality of work output</li>
                        <li>Punctuality and regularity</li>
                        <li>Knowledge of procedures and regulations</li>
                        <li>Ability to work on own initiative</li>
                        <li>Ability to work under pressure</li>
                        <li>Willingness to take on additional responsibility</li>
                        <li>Human relations and interpersonal skills</li>
                        <li>Initiative and foresight</li>
                        <li>Ability to inspire and motivate others</li>
                    </ul>
                </div>
            </section>

            {/* Knowledge & Profession */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">2. Knowledge & Profession</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">Assessment of professional knowledge contributions including technical reports, manuals, journals, and other materials. Quality and quantity of professional outputs scored on a cumulative points basis.</p>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Performance Scoring</h4>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Performance Level</TableHead>
                                    <TableHead className="text-right">Total Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { level: "High", range: "90 and above" },
                                    { level: "Good", range: "70 - 89.9" },
                                    { level: "Adequate", range: "50 - 69.9" },
                                    { level: "Inadequate", range: "Below 50" },
                                ].map((row) => (
                                    <TableRow key={row.level} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold">{row.level}</TableCell>
                                        <TableCell className="text-right font-medium">{row.range}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Material Types</h4>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Material Type</TableHead>
                                    <TableHead className="text-right">Max Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { type: "Refereed Journal Paper", points: "14" },
                                    { type: "Conference Paper (Peer Reviewed)", points: "10 (+2 if presenter)" },
                                    { type: "Published Book", points: "8" },
                                    { type: "Technical Report", points: "6" },
                                    { type: "Manual / Handbook", points: "6" },
                                    { type: "Other Professional Output", points: "4" },
                                ].map((row) => (
                                    <TableRow key={row.type} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold text-sm">{row.type}</TableCell>
                                        <TableCell className="text-right font-medium">{row.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="p-5 border border-border/50 rounded-lg bg-background/50 space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Co-authorship Credit Guidelines</h4>
                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Three authors:</span> Each author credited with 1 full publication</p>
                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Four or more authors:</span> Principal author receives 1 publication; others receive ½ each</p>
                </div>
            </section>

            {/* Service */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">3. Service</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">Assessment of contributions to the University community, national organizations, and international professional bodies. Service roles and responsibilities are valued based on institutional impact and leadership scope.</p>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Performance Scoring</h4>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Performance Level</TableHead>
                                    <TableHead className="text-right">Total Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { level: "High", range: "100 and above" },
                                    { level: "Good", range: "50 - 99.9" },
                                    { level: "Adequate", range: "30 - 49.9" },
                                    { level: "Inadequate", range: "Below 30" },
                                ].map((row) => (
                                    <TableRow key={row.level} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold">{row.level}</TableCell>
                                        <TableCell className="text-right font-medium">{row.range}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 border border-border/50 rounded-lg bg-background/50">
                        <h4 className="font-semibold text-sm mb-3 text-foreground">University Service Activities</h4>
                        <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-5 leading-relaxed">
                            <li>Administrative positions (Director: 30 pts; Head of Unit/Section: 20 pts)</li>
                            <li>Statutory committee membership (6–10 pts)</li>
                            <li>Non-statutory committee membership (2–8 pts)</li>
                            <li>Staff training and mentoring junior staff (4 pts)</li>
                            <li>Resource mobilization (10 pts)</li>
                            <li>Special assignments and projects (4–8 pts)</li>
                        </ul>
                    </div>
                    <div className="p-5 border border-border/50 rounded-lg bg-background/50">
                        <h4 className="font-semibold text-sm mb-3 text-foreground">National &amp; External Service</h4>
                        <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-5 leading-relaxed">
                            <li>Professional body leadership (8–10 pts)</li>
                            <li>Technical committee membership (6–8 pts)</li>
                            <li>Technical assessor / evaluator role (6–10 pts)</li>
                            <li>Consultancy work (4 pts)</li>
                            <li>Community engagement and public service (4 pts)</li>
                            <li>National/international recognition or awards (4 pts)</li>
                        </ul>
                    </div>
                </div>

                <div className="p-5 border-l-2 border-destructive/50 bg-destructive/5 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Minimum Service Thresholds</h4>
                    <ul className="text-xs space-y-1.5 text-muted-foreground list-none pl-0 leading-relaxed">
                        <li>• All promotion candidates must demonstrate consistent university service throughout the review period.</li>
                        <li>• <span className="font-semibold">Generally:</span> a minimum of 30 service points from University service activities is expected.</li>
                        <li>• Positions with greater national or international scope may have higher service minimums as configured by the administrator.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ScoreGuide;
