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
  FileText,
  Search,
  HelpCircle,
  TrendingUp,
  Lock,
  Workflow,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    name: "Teaching Staff Promotion Portal",
    shortName: "Teaching Staff Portal",
    description: "Submit and track your teaching staff promotion application.",
    longDescription:
      "For lecturers and teaching staff applying for promotion. Record teaching, publication and service evidence, then review your application in the applicant portal.",
    audience: "Applicant",
    url: env("VITE_ACADEMIC_PORTAL_URL", "/login"),
    internal: true,
    icon: GraduationCap,
    accent: "primary",
    highlights: [
      "Check promotion eligibility and forecast",
      "Record teaching, publications and service",
      "Review saved applications and history",
    ],
  },
  {
    id: "non-academic",
    name: "Non-Teaching Staff Promotion Portal",
    shortName: "Non-Teaching Staff Portal",
    description: "Promotion applications for administrative & technical staff.",
    longDescription:
      "Designed for senior members and senior staff outside the teaching cadre. Tailored sections, criteria and evidence for non-teaching staff promotion.",
    audience: "Applicant",
    url: env("VITE_NON_ACADEMIC_PORTAL_URL", "http://localhost:3002"),
    icon: Users,
    accent: "accent",
    highlights: [
      "Check eligibility and promotion forecast",
      "Record performance, knowledge and service",
      "Review saved applications and history",
    ],
  },
  {
    id: "academic-assessment",
    name: "Teaching Staff Assessment Portal",
    shortName: "Teaching Staff Assessor",
    description: "For assessors reviewing teaching staff promotion applications.",
    longDescription:
      "Committee members review assigned teaching staff applications, assess teaching, publication and service evidence, and record scores and remarks.",
    audience: "Assessor",
    url: env("VITE_ACADEMIC_ASSESSMENT_PORTAL_URL", "http://localhost:3003"),
    icon: ClipboardCheck,
    accent: "secondary",
    highlights: [
      "Review applications assigned to your committee",
      "Assess teaching, publication and service evidence",
      "Record scores, remarks and available actions",
    ],
  },
  {
    id: "non-academic-assessment",
    name: "Non-Teaching Staff Assessment Portal",
    shortName: "Non-Teaching Staff Assessor",
    description: "Assessment workspace for non-teaching staff promotion panels.",
    longDescription:
      "Committee members review assigned non-teaching staff applications, assess performance, knowledge and service records, and record scores and remarks.",
    audience: "Assessor",
    url: env("VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL", "http://localhost:3004"),
    icon: ClipboardCheck,
    accent: "accent",
    highlights: [
      "Review applications assigned to your committee",
      "Assess performance, knowledge and service records",
      "Record scores, remarks and available actions",
    ],
  },
  {
    id: "admin",
    name: "OSASS Administration Portal",
    shortName: "Admin Portal",
    description: "Maintain institutional records and OSASS reference data.",
    longDescription:
      "For authorised administrators. Maintain the university structure, staff and positions, committees, staff updates and audit logs.",
    audience: "Administrator",
    url: env("VITE_ADMIN_PORTAL_URL", "http://localhost:3001"),
    icon: ShieldCheck,
    accent: "primary",
    highlights: [
      "Manage organisation and staff records",
      "Maintain positions and committees",
      "Review staff updates and audit logs",
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
  { bg: string; text: string }
> = {
  primary: {
    bg: "bg-primary",
    text: "text-primary",
  },
  accent: {
    bg: "bg-accent",
    text: "text-accent-foreground",
  },
  secondary: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
  },
  destructive: {
    bg: "bg-destructive",
    text: "text-destructive",
  },
};

const PortalCard = ({ portal }: { portal: Portal }) => {
  const a = accentClasses[portal.accent];
  const Icon = portal.icon;
  const isExternal = !portal.internal;

  const inner = (
    <div
      className="group flex h-full flex-col border-b border-border py-5 transition-colors hover:bg-muted/30 sm:px-4"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon aria-hidden="true" className={`h-4 w-4 ${a.text}`} />
        <span>{portal.audience}</span>
      </div>

      <div className="mt-3 space-y-2">
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {portal.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {portal.longDescription}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {portal.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-foreground/80">
            <span aria-hidden="true" className={`mt-2 h-1 w-1 shrink-0 rounded-full ${a.bg}`} />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-sm font-semibold text-primary group-hover:underline">
          Open portal
        </span>
        <span className="text-primary transition-transform group-hover:translate-x-1">
          {isExternal ? (
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          ) : (
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
        className="block h-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`Open ${portal.name}`}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      to={portal.url}
      className="block h-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative whitespace-nowrap text-sm font-medium transition-colors hover:text-primary ${
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

        <div className="hidden lg:flex items-center gap-2">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
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
    className="border-b border-border bg-muted/20"
  >
    <div className="container grid gap-12 py-14 md:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-20">
      {/* Left: copy */}
      <div className="lg:col-span-7 flex flex-col justify-center">
        <div className="w-fit border-l-2 border-secondary pl-3 text-primary">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Staff promotion and appointment
          </span>
        </div>

        <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Every UMaT staff{" "}
          <span className="text-primary">promotion</span> journey,
          {" "}
          <br className="hidden sm:block" />
          one place.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          OSASS supports the University of Mines and Technology's staff
          promotion process. Staff prepare and track applications, committees
          assess submissions, and administrators maintain institutional records.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="h-11 px-5 text-base font-semibold"
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
            className="h-11 px-5 text-base"
          >
            <a href="#how-it-works">
              <BookOpen className="mr-2 h-5 w-5" />
              How it works
            </a>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Staff and committee roles
          </span>
          <span className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            Committee review
          </span>
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Application records
          </span>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="border-y border-border">
          <p className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Choose by role
          </p>
          {[
            {
              title: "Applicants",
              description: "Prepare and follow a teaching or non-teaching application.",
            },
            {
              title: "Committee members",
              description: "Review assigned applications and record assessments.",
            },
            {
              title: "Administrators",
              description: "Maintain university, staff and committee records.",
            },
          ].map((role) => (
            <a
              key={role.title}
              href="#portals"
              className="group flex items-start justify-between gap-4 border-t border-border py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>
                <span className="block text-base font-semibold text-foreground">{role.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{role.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
            </a>
          ))}
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
      title: "2. Sign in to your portal",
      text: "Sign in with the credentials for your staff or administrator account. Access depends on your assigned role.",
    },
    {
      icon: Workflow,
      title: "3. Complete your task",
      text: "Prepare an application, assess an assigned submission or maintain institutional records in the relevant portal.",
    },
    {
      icon: TrendingUp,
      title: "4. Track every outcome",
      text: "Applicants can check their application status and history. Committee members can review assigned work and its recorded activity.",
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
      icon: Users,
      title: "Separate workspaces by role",
      text: "Applicants, committee members and administrators have dedicated portals for their work.",
    },
    {
      icon: FileText,
      title: "Cadre-specific applications",
      text: "Teaching staff record teaching, publication and service evidence; non-teaching staff record performance, knowledge and service.",
    },
    {
      icon: TrendingUp,
      title: "Eligibility and forecasts",
      text: "Applicant portals provide eligibility information and promotion forecasts.",
    },
    {
      icon: ClipboardCheck,
      title: "Committee assessment",
      text: "Committee members review assigned applications, assess evidence and record scores and remarks.",
    },
    {
      icon: FileText,
      title: "Application history",
      text: "Applicants can return to review saved records and check the status and history of their applications.",
    },
    {
      icon: ShieldCheck,
      title: "Institutional administration",
      text: "Administrators maintain university structure, staff, positions, committees, staff updates and audit logs.",
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
      a: "If you are a lecturer or teaching staff member applying for promotion, use the Teaching Staff Promotion Portal. Administrative and technical staff should use the Non-Teaching Staff Promotion Portal. Assessors and committee members have dedicated assessment portals, and OSASS administrators use the Admin Portal.",
    },
    {
      q: "Which credentials should I use?",
      a: "Use the staff or administrator credentials assigned to your account. Access to committee and administration functions depends on your account role and assignments.",
    },
    {
      q: "Where can I learn about the promotion criteria?",
      a: "Each applicant portal has a dedicated Guidelines and Score Guide section that explains the UMaT promotion criteria for your cadre, with score-by-score breakdowns and worked examples.",
    },
    {
      q: "Can I save my application and continue later?",
      a: "Your progress is saved automatically as you make changes. Nothing is submitted to a committee until you choose Submit Application. You can return to the portal to continue your application.",
    },
    {
      q: "How do I know what stage my application is at?",
      a: "Open Application Progress in your applicant portal to check the status and any committee updates available for your application.",
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
    className="scroll-mt-20 border-y border-border bg-muted/30"
  >
    <div className="container py-12 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Support
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold md:text-3xl">
            Need help with OSASS?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            For help with your account or an application, contact UMaT IT Support.
          </p>
        </div>

        <div className="lg:col-span-8 lg:border-l lg:border-border lg:pl-10">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div className="border-t border-border pt-3">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1">
                <a
                  href="mailto:support@umat.edu.gh"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  support@umat.edu.gh
                </a>
              </dd>
            </div>
            <div className="border-t border-border pt-3">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-1">
                <a
                  href="tel:+233312020324"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  +233 (0)312 020 324
                </a>
              </dd>
            </div>
            <div className="border-t border-border pt-3 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Location
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                University of Mines and Technology, Tarkwa, Ghana
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border pt-4">
            <a
              href="#portals"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Browse portals
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
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
