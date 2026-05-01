import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ClipboardCheck,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  CheckCircle2,
  FileText,
  Sparkles,
  Search,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  LineChart,
  Lock,
  Workflow,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// Portal registry — URLs come from build-time env vars with sensible defaults
// =============================================================================
type Audience = "Applicant" | "Assessor" | "Administrator";

interface Portal {
  id: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  audience: Audience;
  url: string;
  internal?: boolean; // if true, link via react-router (same app)
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "accent" | "secondary" | "destructive";
  highlights: string[];
}

const env = (key: string, fallback: string) =>
  (import.meta.env[key as keyof ImportMetaEnv] as string | undefined) ?? fallback;

const PORTALS: Portal[] = [
  {
    id: "academic",
    name: "Academic Staff Promotion Portal",
    shortName: "Academic Portal",
    description: "Submit and track your academic promotion application.",
    longDescription:
      "For lecturers and academic staff applying for promotion. Build your dossier, attach evidence and follow your application through every stage.",
    audience: "Applicant",
    url: env("VITE_ACADEMIC_PORTAL_URL", "/login"),
    internal: true,
    icon: GraduationCap,
    accent: "primary",
    highlights: [
      "Eligibility & forecasting tools",
      "Teaching, publications & service sections",
      "Real-time application progress",
    ],
  },
  {
    id: "non-academic",
    name: "Non-Academic Staff Promotion Portal",
    shortName: "Non-Academic Portal",
    description: "Promotion applications for administrative & technical staff.",
    longDescription:
      "Designed for senior members and senior staff outside the teaching cadre. Tailored sections, criteria and evidence for non-academic promotion.",
    audience: "Applicant",
    url: env("VITE_NON_ACADEMIC_PORTAL_URL", "http://localhost:3002"),
    icon: Users,
    accent: "accent",
    highlights: [
      "Role-specific scoring rubrics",
      "Guided evidence upload",
      "Consolidated career timeline",
    ],
  },
  {
    id: "academic-assessment",
    name: "Academic Assessment Portal",
    shortName: "Academic Assessor",
    description: "For assessors reviewing academic promotion applications.",
    longDescription:
      "Internal & external assessors score applications, leave structured feedback and submit recommendations through a secure, auditable workflow.",
    audience: "Assessor",
    url: env("VITE_ACADEMIC_ASSESSMENT_PORTAL_URL", "http://localhost:3003"),
    icon: ClipboardCheck,
    accent: "secondary",
    highlights: [
      "Blind & open assessment modes",
      "Structured scoring sheets",
      "Comment & recommendation logs",
    ],
  },
  {
    id: "non-academic-assessment",
    name: "Non-Academic Assessment Portal",
    shortName: "Non-Academic Assessor",
    description: "Assessment workspace for non-academic promotion panels.",
    longDescription:
      "Panel members evaluate non-academic applications using role-specific criteria, with side-by-side evidence preview and decision capture.",
    audience: "Assessor",
    url: env("VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL", "http://localhost:3004"),
    icon: ClipboardCheck,
    accent: "accent",
    highlights: [
      "Side-by-side evidence viewer",
      "Panel decision capture",
      "Audit-ready review trail",
    ],
  },
  {
    id: "admin",
    name: "OSASS Administration Portal",
    shortName: "Admin Portal",
    description: "System administration, configuration & analytics.",
    longDescription:
      "For UAPC, FAPC, DAPC and IT administrators. Manage users, configure promotion rounds, monitor activity and generate institutional reports.",
    audience: "Administrator",
    url: env("VITE_ADMIN_PORTAL_URL", "http://localhost:3000"),
    icon: ShieldCheck,
    accent: "destructive",
    highlights: [
      "User & role management",
      "Promotion round configuration",
      "Reports, analytics & audit logs",
    ],
  },
];

const AUDIENCE_FILTERS: { label: string; value: Audience | "All" }[] = [
  { label: "All portals", value: "All" },
  { label: "Applicants", value: "Applicant" },
  { label: "Assessors", value: "Assessor" },
  { label: "Administrators", value: "Administrator" },
];

// =============================================================================
// Helpers
// =============================================================================
const accentClasses: Record<
  Portal["accent"],
  { bg: string; text: string; ring: string; soft: string; chip: string }
> = {
  primary: {
    bg: "bg-primary",
    text: "text-primary",
    ring: "group-hover:ring-primary/30",
    soft: "bg-primary/10",
    chip: "bg-primary/10 text-primary border-primary/20",
  },
  accent: {
    bg: "bg-accent",
    text: "text-accent",
    ring: "group-hover:ring-accent/30",
    soft: "bg-accent/10",
    chip: "bg-accent/10 text-accent border-accent/20",
  },
  secondary: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    ring: "group-hover:ring-secondary/40",
    soft: "bg-secondary/15",
    chip: "bg-secondary/15 text-secondary-foreground border-secondary/30",
  },
  destructive: {
    bg: "bg-destructive",
    text: "text-destructive",
    ring: "group-hover:ring-destructive/30",
    soft: "bg-destructive/10",
    chip: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const PortalCard = ({ portal }: { portal: Portal }) => {
  const a = accentClasses[portal.accent];
  const Icon = portal.icon;
  const isExternal = !portal.internal;

  const inner = (
    <div
      className={`group relative h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ring-1 ring-transparent ${a.ring} hover:ring-4`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${a.soft} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-6 w-6 ${a.text}`} />
        </div>
        <Badge variant="outline" className={`${a.chip} text-[10px] uppercase tracking-wider font-semibold`}>
          {portal.audience}
        </Badge>
      </div>

      <div className="mt-5 space-y-2">
        <h3 className="text-lg font-bold text-foreground leading-tight">
          {portal.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {portal.longDescription}
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {portal.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${a.text}`} />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Open portal
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${a.soft} ${a.text} transition-transform duration-300 group-hover:translate-x-1`}
        >
          {isExternal ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </span>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={portal.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={`Open ${portal.name}`}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      to={portal.url}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`Open ${portal.name}`}
    >
      {inner}
    </Link>
  );
};

// =============================================================================
// Sections
// =============================================================================
const NAV_LINKS = [
  { label: "Portals", href: "#portals", id: "portals" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Features", href: "#features", id: "features" },
  { label: "FAQ", href: "#faq", id: "faq" },
  { label: "Support", href: "#support", id: "support" },
];

/** Highlights the nav link of the section currently in view. */
const useActiveSection = () => {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = NAV_LINKS.map((l) => l.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return active;
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-foreground">UMaT OSASS</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Promotion & Appointment
            </p>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -bottom-1.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <a href="#portals">
              Browse portals
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        </div>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-muted ${
                  active === l.id ? "text-primary bg-primary/5" : "text-foreground"
                }`}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="flex-1">
                <a href="#portals" onClick={() => setOpen(false)}>
                  Browse portals
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = () => (
  <section
    id="top"
    className="relative isolate overflow-hidden border-b border-border bg-background"
  >
    {/* Layered, soft background */}
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent_70%)]"
    />
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-primary/5 to-transparent"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:42px_42px]"
    />
    <div
      aria-hidden
      className="absolute -top-32 -left-32 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
    />
    <div
      aria-hidden
      className="absolute -bottom-40 -right-32 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
    />

    <div className="container relative grid gap-14 py-16 md:py-24 lg:grid-cols-12 lg:gap-10 lg:py-28">
      {/* Left: copy */}
      <div className="lg:col-span-7 flex flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            One entry point · {PORTALS.length} portals
          </span>
        </div>

        <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Every UMaT staff{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">promotion</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-secondary/50 md:h-4"
            />
          </span>{" "}
          journey,
          <br className="hidden sm:block" />
          one place.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          OSASS is the Online Staff Appointment & Promotion System for the
          University of Mines and Technology, Tarkwa. Apply, assess and
          administer — every workflow, every committee, one signed-in
          experience.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="h-12 px-6 text-base font-semibold shadow-lg shadow-primary/20"
          >
            <a href="#portals">
              Choose your portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 px-6 text-base"
          >
            <a href="#how-it-works">
              <BookOpen className="mr-2 h-5 w-5" />
              How it works
            </a>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure UMaT sign-in
          </span>
          <span className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            DAPC · FAPC · UAPC
          </span>
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Auditable end-to-end
          </span>
        </div>
      </div>

      {/* Right: portal stack visual */}
      <div className="lg:col-span-5 relative">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Decorative glow behind the stack */}
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 blur-2xl"
          />

          {/* Floating stat card */}
          <div className="absolute -left-3 -top-8 z-20 hidden rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Active portals
            </p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-primary">
              {PORTALS.length}
            </p>
          </div>
          <div className="absolute -right-3 -bottom-5 z-20 hidden rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                One sign-in
              </p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Across all OSASS services
            </p>
          </div>

          {/* Stacked portal cards */}
          <div className="relative space-y-3 rounded-2xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                osass.umat.edu.gh
              </span>
            </div>

            {PORTALS.slice(0, 4).map((p, i) => {
              const a = accentClasses[p.accent];
              const Icon = p.icon;
              return (
                <a
                  key={p.id}
                  href="#portals"
                  className="group flex items-center gap-4 rounded-xl border border-border bg-background p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.soft}`}
                  >
                    <Icon className={`h-5 w-5 ${a.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.shortName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.audience}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              );
            })}

            <a
              href="#portals"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              View all portals
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Portals = () => {
  const [filter, setFilter] = useState<Audience | "All">("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PORTALS.filter((p) => {
      const matchesAudience = filter === "All" || p.audience === filter;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.longDescription.toLowerCase().includes(q) ||
        p.highlights.join(" ").toLowerCase().includes(q);
      return matchesAudience && matchesQuery;
    });
  }, [filter, query]);

  return (
    <section id="portals" className="scroll-mt-20 border-b border-border bg-background">
      <div className="container py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Portals
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Pick the right portal for you
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Filter by your role or search to quickly land in the workspace
            built for what you need to do today.
          </p>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === f.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search portals…"
              className="pl-10 h-11"
              aria-label="Search portals"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <PortalCard key={p.id} portal={p} />
          ))}
          {visible.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No portals match your search.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setFilter("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Find your portal",
      text: "Identify whether you're an applicant, assessor or administrator and open the matching portal from the catalogue above.",
    },
    {
      icon: Lock,
      title: "2. Sign in securely",
      text: "Use your UMaT staff credentials. Multi-factor verification and audit logging keep your account protected.",
    },
    {
      icon: Workflow,
      title: "3. Complete your task",
      text: "Build a dossier, score an application or configure a promotion round — every workflow is guided step-by-step.",
    },
    {
      icon: TrendingUp,
      title: "4. Track every outcome",
      text: "Real-time progress, notifications and a complete audit trail keep everyone aligned through every committee stage.",
    },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border bg-muted/30">
      <div className="container py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold text-foreground">
            From application to appointment, one journey
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            OSASS connects every committee — DAPC, FAPC and UAPC — so there is
            no chasing forms or paper files. Just clear progress, end to end.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.text}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 h-px w-6 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const items = [
    {
      icon: ShieldCheck,
      title: "Secure & auditable",
      text: "Role-based access control, encrypted storage and an immutable audit trail across every portal.",
    },
    {
      icon: FileText,
      title: "Evidence-driven dossiers",
      text: "Upload publications, teaching evidence and service records once — reuse them across submissions.",
    },
    {
      icon: LineChart,
      title: "Forecasting & analytics",
      text: "Eligibility forecasts for staff and institutional dashboards for administrators.",
    },
    {
      icon: Award,
      title: "Aligned with UMaT criteria",
      text: "Built around the official UMaT promotion criteria and committee workflow (DAPC → FAPC → UAPC).",
    },
    {
      icon: Clock,
      title: "Save time at every stage",
      text: "Auto-saved drafts, smart validation and instant notifications mean no more chasing paper.",
    },
    {
      icon: Sparkles,
      title: "One sign-in, many portals",
      text: "Your UMaT identity unlocks every OSASS portal you're authorised to access.",
    },
  ];
  return (
    <section id="features" className="scroll-mt-20 border-b border-border bg-background">
      <div className="container py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Why OSASS
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Built for UMaT, by UMaT
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every detail — from criteria to committees — reflects how
            promotions actually happen at UMaT.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {it.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const items = [
    {
      q: "Which portal should I use?",
      a: "If you are a lecturer or academic staff member applying for promotion, use the Academic Promotion Portal. Administrative and technical staff should use the Non-Academic Promotion Portal. Assessors and committee members have dedicated assessment portals, and OSASS administrators use the Admin Portal.",
    },
    {
      q: "Do I need separate accounts for each portal?",
      a: "No. Your UMaT staff identity gives you access to every OSASS portal you are authorised to use. Sign in once with your staff credentials.",
    },
    {
      q: "Where can I learn about the promotion criteria?",
      a: "Each applicant portal has a dedicated Guidelines and Score Guide section that explains the UMaT promotion criteria for your cadre, with score-by-score breakdowns and worked examples.",
    },
    {
      q: "Can I save my application and continue later?",
      a: "Yes. Drafts are auto-saved as you go and remain available until you submit. You can stop and resume from any device.",
    },
    {
      q: "How do I know what stage my application is at?",
      a: "The Application Progress page shows your dossier moving through each committee — DAPC, FAPC and UAPC — with timestamps, comments and the current decision-maker.",
    },
    {
      q: "What if I have a problem signing in or using a portal?",
      a: "Contact UMaT IT Support at support@umat.edu.gh or use the help link inside any portal — administrators can also reset access on your behalf.",
    },
  ];
  return (
    <section id="faq" className="scroll-mt-20 border-b border-border bg-muted/30">
      <div className="container py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Questions
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Frequently asked
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Quick answers to the questions we hear most often.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-border bg-card px-6">
          <Accordion type="single" collapsible className="w-full">
            {items.map((it, i) => (
              <AccordionItem key={it.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {it.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

const Support = () => (
  <section
    id="support"
    className="scroll-mt-20 relative overflow-hidden border-b border-border bg-primary text-primary-foreground"
  >
    <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
    <div className="container relative py-20 md:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Support
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold">
            We're here to help
          </h2>
          <p className="mt-4 max-w-xl text-primary-foreground/80 leading-relaxed">
            Whether you're applying, assessing or administering, the OSASS team
            and UMaT IT Support are a click away.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:support@umat.edu.gh"
              className="flex items-center gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60">
                  Email
                </p>
                <p className="text-sm font-semibold">support@umat.edu.gh</p>
              </div>
            </a>
            <a
              href="tel:+233312020324"
              className="flex items-center gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60">
                  Phone
                </p>
                <p className="text-sm font-semibold">+233 (0)312 020 324</p>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 sm:col-span-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60">
                  Visit
                </p>
                <p className="text-sm font-semibold">
                  University of Mines and Technology, Tarkwa, Ghana
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 backdrop-blur">
          <h3 className="font-serif text-2xl font-semibold">Ready to begin?</h3>
          <p className="mt-3 text-sm text-primary-foreground/75 leading-relaxed">
            Sign in to the academic promotion portal to start a new application
            or check the status of an existing one.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              asChild
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-5 font-semibold flex-1"
            >
              <Link to="/login">
                Sign in
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-5 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground flex-1"
            >
              <a href="#portals">All portals</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-background">
    <div className="container py-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} University of Mines and Technology,
            Tarkwa. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <a href="#portals" className="hover:text-primary">
            Portals
          </a>
          <a href="#faq" className="hover:text-primary">
            FAQ
          </a>
          <a href="#support" className="hover:text-primary">
            Support
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// =============================================================================
// Page
// =============================================================================
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

const Landing = () => {
  // Apply smooth scrolling and a scroll offset so anchored sections are not
  // hidden behind the sticky header.
  useEffect(() => {
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    const prevPadding = html.style.scrollPaddingTop;
    html.style.scrollBehavior = "smooth";
    html.style.scrollPaddingTop = "5rem";
    return () => {
      html.style.scrollBehavior = prevBehavior;
      html.style.scrollPaddingTop = prevPadding;
    };
  }, []);

  // Set a public-friendly document title while the landing page is mounted.
  useEffect(() => {
    const previous = document.title;
    document.title =
      "OSASS \u2014 UMaT Online Staff Appointment & Promotion System";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Portals />
        <HowItWorks />
        <Features />
        <FAQ />
        <Support />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Landing;
