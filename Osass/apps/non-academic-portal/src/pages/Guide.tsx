import { Printer, BookOpen, CheckCircle2, BarChart3, FileText, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Guide = () => {
  return (
    <div className="space-y-8 pb-20">
      {/* Header — hidden when printing */}
      <section className="flex items-center justify-between border-b border-border pb-6 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Non-Academic Staff Portal
          </p>
          <h1 className="text-3xl font-serif font-semibold text-foreground">User Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A complete walkthrough of the OSASS Non-Academic Staff Portal features.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 shrink-0">
          <Printer className="h-4 w-4" />
          Print as PDF
        </Button>
      </section>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">OSASS — Non-Academic Staff Portal: User Guide</h1>
        <p className="text-sm text-gray-500">University of Mines and Technology (UMaT)</p>
        <hr className="my-4" />
      </div>

      {/* Quick Nav — hidden when printing */}
      <nav className="print:hidden grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: "/dashboard", label: "Dashboard", icon: <Layers className="w-4 h-4" /> },
          { to: "/eligibility", label: "Eligibility Check", icon: <CheckCircle2 className="w-4 h-4" /> },
          { to: "/forecast", label: "Career Forecast", icon: <BarChart3 className="w-4 h-4" /> },
          { to: "/application", label: "My Application", icon: <FileText className="w-4 h-4" /> },
          { to: "/guidelines", label: "Promotion Guidelines", icon: <BookOpen className="w-4 h-4" /> },
          { to: "/score-guide", label: "Scoring Reference", icon: <ExternalLink className="w-4 h-4" /> },
        ].map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group text-sm font-medium text-foreground"
          >
            <span className="text-primary/60 group-hover:text-primary transition-colors">{icon}</span>
            {label}
            <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </nav>

      {/* Section 1: Overview */}
      <GuideSection
        icon={<BookOpen className="h-5 w-5" />}
        num="01"
        title="Overview"
      >
        <p>
          The OSASS Non-Academic Staff Portal is your self-service platform for applying for non-academic
          promotion at UMaT. It guides you through every step — from assessing your eligibility,
          building your application with evidence, to tracking your submission through the
          committee review process.
        </p>
        <p>
          Use the left sidebar to navigate between sections. You can save progress at any time,
          and your application is only submitted when you explicitly send it for review.
        </p>
      </GuideSection>

      {/* Section 2: Dashboard */}
      <GuideSection
        icon={<Layers className="h-5 w-5" />}
        num="02"
        title="Dashboard"
        action={{ to: "/dashboard", label: "Go to Dashboard" }}
      >
        <p>
          The <strong>Dashboard</strong> is your home page showing:
        </p>
        <ul>
          <li><strong>Current position and target rank</strong> — the promotion you are eligible to apply for.</li>
          <li><strong>Application status card</strong> — a real-time snapshot of where your current application stands.</li>
          <li><strong>Quick-action buttons</strong> — jump directly to the Application, Eligibility, or Forecast sections.</li>
        </ul>
        <p>
          If this is your first visit, a welcome banner explains each part of the portal. It
          disappears once you dismiss it and will not reappear.
        </p>
      </GuideSection>

      {/* Section 3: Eligibility */}
      <GuideSection
        icon={<CheckCircle2 className="h-5 w-5" />}
        num="03"
        title="Eligibility Check"
        action={{ to: "/eligibility", label: "Check My Eligibility" }}
      >
        <p>
          The <strong>Eligibility</strong> section shows whether you currently meet the minimum
          requirements to apply for promotion. The system evaluates:
        </p>
        <ul>
          <li>Years spent in your current position</li>
          <li>Minimum knowledge &amp; profession material count</li>
          <li>Annual performance appraisal requirements</li>
          <li>Service contributions</li>
        </ul>
        <p>
          If you are not yet eligible, the system shows exactly what is outstanding. Hover over
          any criterion for a brief explanation of what it measures.
        </p>
        <p>
          The <strong>Promotion Guidelines</strong> page gives the full official requirements for
          each target rank, including any implementation circulars you can download.{' '}
          <Link to="/guidelines" className="text-primary underline underline-offset-2 hover:text-primary/80 print:hidden">
            View Guidelines →
          </Link>
        </p>
      </GuideSection>

      {/* Section 4: Forecast */}
      <GuideSection
        icon={<BarChart3 className="h-5 w-5" />}
        num="04"
        title="Eligibility Forecast"
        action={{ to: "/forecast", label: "View My Forecast" }}
      >
        <p>
          The <strong>Forecast</strong> section shows a milestone roadmap for your entire
          remaining career progression, not just the next step. For each future position you will
          see:
        </p>
        <ul>
          <li><strong>Projected eligibility date</strong> — based on your current position date and the minimum years required.</li>
          <li><strong>Performance criteria thresholds</strong> — the score combinations set by the university for that position.</li>
          <li><strong>Materials already counted</strong> — only knowledge &amp; profession materials submitted under this application are counted toward that milestone.</li>
        </ul>
        <p>
          Milestones beyond the immediately next rank are locked and shown for planning purposes
          only. You must complete each rank before the next one unlocks.
        </p>
      </GuideSection>

      {/* Section 5: Promotion Application */}
      <GuideSection
        icon={<FileText className="h-5 w-5" />}
        num="05"
        title="Promotion Application"
        action={{ to: "/application", label: "Open My Application" }}
      >
        <p>
          The <strong>Application</strong> is divided into three evidence categories. You must
          complete all three before you can submit:
        </p>

        <h3>Performance at Work{' '}
          <Link to="/application/performance" className="text-primary text-xs font-normal underline underline-offset-2 print:hidden">→ Go to Performance at Work</Link>
        </h3>
        <p>
          Record your work performance data for the review period. The system evaluates you across
          10 performance indicators — including accuracy, quality of output, punctuality, initiative,
          and interpersonal skills. Each indicator is scored out of 10 (maximum 100 points total).
        </p>

        <h3>Knowledge &amp; Profession{' '}
          <Link to="/application/knowledge" className="text-primary text-xs font-normal underline underline-offset-2 print:hidden">→ Go to Knowledge &amp; Profession</Link>
        </h3>
        <p>
          Add professional materials produced during the review period — including technical reports,
          manuals, refereed publications, conference papers, and other professional outputs. Each
          entry requires a title, type, year, and supporting evidence. Points accumulate based on
          material type. Only materials submitted under <em>this specific application</em> are
          counted toward your eligibility.
        </p>
        <p>
          See the full scoring table on the{' '}
          <Link to="/score-guide" className="text-primary underline underline-offset-2 hover:text-primary/80 print:hidden">
            Scoring Reference page →
          </Link>
        </p>

        <h3>Service{' '}
          <Link to="/application/service" className="text-primary text-xs font-normal underline underline-offset-2 print:hidden">→ Go to Service</Link>
        </h3>
        <p>
          Record contributions such as departmental committees, national boards, community
          engagement activities, and administrative roles. Each entry requires a start date and a
          description. If the role was an <strong>acting / temporary appointment</strong>, tick the{' '}
          <em>"Acting / Temporary Position?"</em> toggle — the score for such entries is
          automatically halved (50%) to reflect the temporary nature of the role.
        </p>

        <h3>Submitting</h3>
        <p>
          Once all three sections are complete and validated, the <strong>Submit for Review</strong>{' '}
          button becomes active. After submission, your application is routed automatically to the
          appropriate committee (HOU → AAPSC → UAPC) based on your unit/section.
        </p>
      </GuideSection>

      {/* Section 6: Tracking */}
      <GuideSection
        icon={<CheckCircle2 className="h-5 w-5" />}
        num="06"
        title="Tracking Your Application"
        action={{ to: "/progress", label: "View Application Progress" }}
      >
        <p>
          After submission you can monitor progress on the <strong>Application Progress</strong>{' '}
          page. The timeline shows each committee stage and its outcome:
        </p>
        <ul>
          <li><strong>Under Review</strong> — the committee is currently deliberating.</li>
          <li><strong>Approved</strong> — the committee has recommended promotion.</li>
          <li><strong>Returned</strong> — the committee has requested changes or additional evidence. You will receive a notification with specific remarks. Correct the issues and resubmit.</li>
        </ul>
        <p>
          You will receive email and in-portal notifications at each stage transition.
        </p>
      </GuideSection>

      {/* Footer */}
      <div className="border-t border-border pt-6 text-xs text-muted-foreground">
        <p>
          For technical support, contact the OSASS system administrator. For promotion policy
          queries, contact your Administrative and Allied Professions Sub-Committee (AAPSC) coordinator.
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { font-size: 12pt; color: #000; }
          nav, aside, .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          h2 { page-break-after: avoid; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

interface GuideSectionProps {
  icon: React.ReactNode;
  num: string;
  title: string;
  children: React.ReactNode;
  action?: { to: string; label: string };
}

function GuideSection({ icon, num, title, children, action }: GuideSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Section {num}
            </span>
            <h2 className="text-xl font-serif font-semibold text-foreground leading-snug">{title}</h2>
          </div>
        </div>
        {action && (
          <Link
            to={action.to}
            className="print:hidden shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
          >
            {action.label}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="ml-12 space-y-3 text-sm text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}

export default Guide;
