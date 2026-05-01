import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { fetchDashboardStats } from '@/services/api';
import type { DashboardStats } from '@/types';

interface StatCard {
  label: string;
  key: keyof DashboardStats;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface StatGroup {
  title: string;
  cards: StatCard[];
}

const statGroups: StatGroup[] = [
  {
    title: 'Organization',
    cards: [
      { key: 'totalSchools', label: 'Schools', icon: Building2, href: '/schools', color: 'text-blue-600' },
      { key: 'totalFaculties', label: 'Faculties', icon: GraduationCap, href: '/faculties', color: 'text-indigo-600' },
      { key: 'totalDepartments', label: 'Academic Departments', icon: Layers, href: '/departments', color: 'text-violet-600' },
      { key: 'totalUnits', label: 'Units & Sections', icon: Network, href: '/units-sections', color: 'text-purple-600' },
    ],
  },
  {
    title: 'Academic',
    cards: [
      { key: 'totalAcademicStaff', label: 'Academic Staff', icon: Users, href: '/academic-staff', color: 'text-emerald-600' },
      { key: 'totalAcademicPositions', label: 'Academic Positions', icon: TrendingUp, href: '/academic-positions', color: 'text-teal-600' },
      { key: 'totalServicePositions', label: 'Service Positions', icon: Briefcase, href: '/service-positions', color: 'text-cyan-600' },
      { key: 'totalPublicationIndicators', label: 'Publication Indicators', icon: BookOpen, href: '/publication-types', color: 'text-sky-600' },
      { key: 'totalAcademicCommitteeMembers', label: 'Committee Members', icon: UserCheck, href: '/committees', color: 'text-blue-500' },
    ],
  },
  {
    title: 'Non-Academic',
    cards: [
      { key: 'totalNonAcademicStaff', label: 'Non-Academic Staff', icon: Users, href: '/non-academic-staff', color: 'text-orange-600' },
      { key: 'totalNonAcademicPositions', label: 'Positions', icon: TrendingUp, href: '/non-academic-positions', color: 'text-amber-600' },
      { key: 'totalNonAcademicCommitteeMembers', label: 'Committee Members', icon: UserCheck, href: '/non-academic-committees', color: 'text-yellow-600' },
    ],
  },
];

function StatCard({ label, value, icon: Icon, href, color, isLoading }: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
  isLoading: boolean;
}) {
  return (
    <a href={href} className="block group">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
            {label}
          </CardTitle>
          <div className={`rounded-md p-1.5 bg-muted/50 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalStaff = stats ? stats.totalAcademicStaff + stats.totalNonAcademicStaff : 0;

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of university administration data"
      />

      {/* Summary totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Staff', value: totalStaff, icon: Users, color: 'text-primary', href: '/academic-staff' },
          { label: 'Total Schools', value: stats?.totalSchools ?? 0, icon: Building2, color: 'text-blue-600', href: '/schools' },
          { label: 'Total Departments & Units', value: (stats?.totalDepartments ?? 0) + (stats?.totalUnits ?? 0), icon: Layers, color: 'text-violet-600', href: '/departments' },
          { label: 'Total Committee Members', value: stats?.totalCommitteeMembers ?? 0, icon: UserCheck, color: 'text-emerald-600', href: '/committees' },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <a key={label} href={href} className="block group">
            <Card className="border-2 transition-all duration-200 hover:shadow-md hover:border-primary/40 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className={`${color}`}><Icon className="h-5 w-5" /></div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {isLoading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-3xl font-bold">{value.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Per-section breakdowns */}
      <div className="space-y-8">
        {statGroups.map((group) => (
          <section key={group.title}>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-primary inline-block" />
              {group.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.cards.map(({ key, label, icon, href, color }) => (
                <StatCard
                  key={key}
                  label={label}
                  value={stats?.[key] ?? 0}
                  icon={icon}
                  href={href}
                  color={color}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
}

