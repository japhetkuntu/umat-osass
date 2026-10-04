import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Building2,
  GraduationCap,
  Layers,
  Users,
  TrendingUp,
  Briefcase,
  BookOpen,
  UserCheck,
  Network,
  ArrowRight,
  X,
} from 'lucide-react';
import { fetchDashboardStats } from '@/services/api';
import type { DashboardStats } from '@/types';

interface StatCard {
  label: string;
  key: keyof DashboardStats;
  icon: React.ElementType;
  href: string;
}

interface StatGroup {
  title: string;
  cards: StatCard[];
}

const statGroups: StatGroup[] = [
  {
    title: 'Organization',
    cards: [
      { key: 'totalSchools', label: 'Schools', icon: Building2, href: '/schools' },
      { key: 'totalFaculties', label: 'Faculties', icon: GraduationCap, href: '/faculties' },
      { key: 'totalDepartments', label: 'Academic Departments', icon: Layers, href: '/departments' },
      { key: 'totalUnits', label: 'Units & Sections', icon: Network, href: '/units-sections' },
    ],
  },
  {
    title: 'Teaching Staff',
    cards: [
      { key: 'totalAcademicStaff', label: 'Teaching Staff', icon: Users, href: '/academic-staff' },
      { key: 'totalAcademicPositions', label: 'Teaching Staff Positions', icon: TrendingUp, href: '/academic-positions' },
      { key: 'totalServicePositions', label: 'Service Positions', icon: Briefcase, href: '/service-positions' },
      { key: 'totalPublicationIndicators', label: 'Publication Indicators', icon: BookOpen, href: '/publication-types' },
      { key: 'totalAcademicCommitteeMembers', label: 'Committee Members', icon: UserCheck, href: '/committees' },
    ],
  },
  {
    title: 'Non-Teaching Staff',
    cards: [
      { key: 'totalNonAcademicStaff', label: 'Non-Teaching Staff', icon: Users, href: '/non-academic-staff' },
      { key: 'totalNonAcademicPositions', label: 'Non-Teaching Staff Positions', icon: TrendingUp, href: '/non-academic-positions' },
      { key: 'totalNonAcademicCommitteeMembers', label: 'Committee Members', icon: UserCheck, href: '/non-academic-committees' },
    ],
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadStats = () => {
    setIsLoading(true);
    setLoadError(false);
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalStaff = stats ? stats.totalAcademicStaff + stats.totalNonAcademicStaff : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of university administration data"
      />

      {loadError && (
        <div className="card-elevated rounded-lg border border-destructive/20 bg-destructive/5 p-4 mb-6 flex items-start gap-3">
          <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Unable to load dashboard statistics</p>
            <p className="text-sm text-muted-foreground">Something went wrong while fetching the latest data.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadStats}>
            Try Again
          </Button>
        </div>
      )}

      {/* Summary totals */}
      <section aria-label="Institutional totals" className="mb-8 grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-md border border-border bg-card sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: 'Total Staff', value: totalStaff },
          { label: 'Total Schools', value: stats?.totalSchools ?? 0, href: '/schools' },
          { label: 'Departments & Units', value: (stats?.totalDepartments ?? 0) + (stats?.totalUnits ?? 0), href: '/departments' },
          { label: 'Committee Members', value: stats?.totalCommitteeMembers ?? 0, href: '/committees' },
        ].map(({ label, value, href }) => {
          const content = (
            <>
              <span className="block text-xs font-medium text-muted-foreground">{label}</span>
              {isLoading ? (
                <span className="mt-2 block h-7 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <span className="mt-1 block text-2xl font-semibold tabular-nums text-foreground">{value.toLocaleString()}</span>
              )}
            </>
          );

          return href ? (
            <Link key={label} to={href} className="min-h-20 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
              {content}
            </Link>
          ) : (
            <div key={label} className="min-h-20 px-4 py-3">
              {content}
            </div>
          );
        })}
      </section>

      {/* Per-section breakdowns */}
      <div className="space-y-8">
        {statGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-base font-semibold text-foreground">{group.title}</h2>
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {group.cards.map(({ key, label, icon: Icon, href }) => (
                <Link
                  key={key}
                  to={href}
                  className="group flex min-h-12 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-4"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary/75" />
                  <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
                  {isLoading ? (
                    <span className="h-5 w-10 animate-pulse rounded bg-muted" />
                  ) : (
                    <span className="text-sm font-medium tabular-nums text-foreground">{(stats?.[key] ?? 0).toLocaleString()}</span>
                  )}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
