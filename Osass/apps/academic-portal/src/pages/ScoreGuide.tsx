import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

const ScoreGuide = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in pb-20">
            <div className="border-b border-border/30 pb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Promotion Criteria & Scoring Guide</h1>
                <p className="text-muted-foreground text-base font-light">Official Guidelines for Appointment and Promotion of Senior Members, University of Mines and Technology, Tarkwa</p>
            </div>

            {/* Performance Level Overview */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">Performance Assessment Levels</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">All three assessable areas—Teaching, Promotion of Knowledge, and Service—are evaluated using the following four performance levels. Equal importance is accorded to each area.</p>
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
                <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">Candidates must achieve the following performance profiles across the three assessment areas to meet promotion eligibility.</p>
                <div className="space-y-4">
                    {[
                        {
                            position: "Senior Lecturer / Senior Research Fellow",
                            requirements: [
                                "HIGH in any two areas + ADEQUATE in the third, OR",
                                "GOOD in all three areas",
                            ],
                        },
                        {
                            position: "Associate Professor",
                            requirements: [
                                "HIGH in any two areas + GOOD in the third",
                            ],
                        },
                        {
                            position: "Professor",
                            requirements: [
                                "HIGH in all three areas (Teaching, Promotion of Knowledge, and Service)",
                            ],
                        },
                    ].map((item, idx) => (
                        <div key={item.position} className="border-l border-border/50 pl-6 py-2">
                            <h3 className="text-sm font-semibold text-foreground mb-3">{idx + 1}. {item.position}</h3>
                            <ul className="space-y-2">
                                {item.requirements.map((req, reqIdx) => (
                                    <li key={reqIdx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                        <span className="text-primary font-semibold flex-shrink-0">•</span>
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Teaching Evaluation */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">1. Teaching</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">Assessment of pedagogical effectiveness, student impact, and course delivery quality. Scored on a scale of 0-100 points.</p>
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
                        <li>Lecture load, preparedness and ability to handle various courses</li>
                        <li>Ability to adapt teaching to accommodate new data and ideas</li>
                        <li>Regularity and punctuality to lectures</li>
                        <li>Quality of lecture materials (notes, handouts, slides)</li>
                        <li>Student examination performance</li>
                        <li>Ability to complete course syllabus</li>
                        <li>Quality of examination questions and marking schemes</li>
                        <li>Supervision of undergraduate and postgraduate projects/theses</li>
                        <li>Student feedback and assessment of teaching</li>
                    </ul>
                </div>
            </section>

            {/* Promotion of Knowledge */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">2. Promotion of Knowledge</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">Assessment of research output including publications, inventions, and development of technology or products. Quality and quantity of scholarly contributions scored on a cumulative points basis (max. 10 papers assessed).</p>
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
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Publication Types</h4>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Publication Type</TableHead>
                                    <TableHead className="text-right">Max Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { type: "Refereed Journal Paper", points: "14" },
                                    { type: "Conference Paper (Peer Reviewed)", points: "10 (+2 if presenter)" },
                                    { type: "Published Book", points: "8" },
                                    { type: "Peer Reviewed Document / Patent", points: "6" },
                                    { type: "Book Chapter", points: "½ of full publication" },
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
                            <li>Administrative positions (Dean: 40 pts; HOD: 20–30 pts)</li>
                            <li>Statutory committee membership (6–10 pts)</li>
                            <li>Non-statutory committee membership (2–8 pts)</li>
                            <li>Thesis/project assessment (1–3 pts)</li>
                            <li>Laboratory supervision (4 pts)</li>
                            <li>Resource mobilization (10 pts)</li>
                        </ul>
                    </div>
                    <div className="p-5 border border-border/50 rounded-lg bg-background/50">
                        <h4 className="font-semibold text-sm mb-3 text-foreground">National & International Service</h4>
                        <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-5 leading-relaxed">
                            <li>Professional body leadership (8–10 pts)</li>
                            <li>Editorial board membership (8–10 pts)</li>
                            <li>External examiner/assessor (10 pts)</li>
                            <li>Journal paper review (4 pts)</li>
                            <li>Consultancy work (4 pts)</li>
                            <li>International recognition (4 pts)</li>
                        </ul>
                    </div>
                </div>

                <div className="p-5 border-l-2 border-destructive/50 bg-destructive/5 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Minimum Service Thresholds</h4>
                    <ul className="text-xs space-y-1.5 text-muted-foreground list-none pl-0 leading-relaxed">
                        <li>• <span className="font-semibold">Senior Lecturer:</span> 30 points (University service)</li>
                        <li>• <span className="font-semibold">Associate Professor:</span> 20 pts (National) + 5 pts (International)</li>
                        <li>• <span className="font-semibold">Professor:</span> 20 pts (National) + 20 pts (International)</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ScoreGuide;
