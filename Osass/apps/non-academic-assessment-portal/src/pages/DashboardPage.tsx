import { useQuery, useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import assessmentApi from "@/services/assessmentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["assessment-dashboard"],
    queryFn: async () => {
      const response = await assessmentApi.getDashboard();
      if (response.code >= 200 && response.code < 300 && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch dashboard");
    },
  });

  // Fetch pending counts per committee
  const committees = user?.committees ?? [];
  const committeePendingQueries = useQueries({
    queries: committees.map((c) => ({
      queryKey: ["committee-pending", c.committeeType],
      queryFn: async () => {
        const response = await assessmentApi.getPendingApplications(c.committeeType);
        if (response.code >= 200 && response.code < 300 && response.data) {
          return { type: c.committeeType, count: response.data.totalCount };
        }
        return { type: c.committeeType, count: 0 };
      },
      enabled: !!user,
    })),
  });

  const committeePendingCounts: Record<string, number> = {};
  for (const q of committeePendingQueries) {
    if (q.data) {
      committeePendingCounts[q.data.type] = q.data.count;
    }
  }

  const getCommitteeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      HOU: "Head of Unit",
      AAPSC: "Administrative and Allied Professions Sub-Committee",
      UAPC: "University Non-Academic Promotion Committee",
    };
    return names[type] || type;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="content-container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">Assessment Portal</h1>
            <p className="text-sm text-muted-foreground">Non-Academic Promotion Committee</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                {user?.fullName || user?.firstName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="content-container space-y-8">
        {/* Welcome Section */}
        <section className="section-header">
          <h2 className="section-title">Welcome, {(user?.fullName || user?.firstName || "")?.split(" ")[0]}</h2>
          <p className="section-description">
            Review and assess non-academic promotion applications across committees
          </p>
        </section>

        {/* Main Content */}
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="card-elevated p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Failed to Load Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">Unable to retrieve your committee assignments and application status.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Committee Assignments */}
            <section className="space-y-4">
              <div className="space-y-2 pb-4 border-b border-border">
                <h3 className="text-lg font-serif font-semibold text-foreground">Your Committees</h3>
                <p className="text-sm text-muted-foreground">Committee assignments and access</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user?.committees.map((committee) => {
                  const pendingCount = committeePendingCounts[committee.committeeType];
                  return (
                  <div
                    key={committee.committeeType}
                    className="card-elevated p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-foreground">
                            {committee.committeeType}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {getCommitteeDisplayName(committee.committeeType)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {committee.isChairperson && (
                          <Badge variant="outline" className="text-xs">
                            Chair
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={() => navigate(`/pending/${committee.committeeType}`)}
                        className="w-full text-left text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <span>Pending Applications</span>
                        <span className="flex items-center gap-2">
                          {pendingCount !== undefined && pendingCount > 0 && (
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              {pendingCount}
                            </Badge>
                          )}
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                      <button 
                        onClick={() => navigate(`/history/${committee.committeeType}`)}
                        className="w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between gap-2 group"
                      >
                        <span>View History</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* Status Overview */}
            <section className="space-y-4">
              <div className="space-y-2 pb-4 border-b border-border">
                <h3 className="text-lg font-serif font-semibold text-foreground">Overview</h3>
                <p className="text-sm text-muted-foreground">Application status across all committees</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Pending */}
                <div className="card-elevated p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pending</p>
                    <ClipboardList className="w-4 h-4 text-warning" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {dashboard?.pendingApplicationsCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </div>

                {/* In Progress */}
                <div className="card-elevated p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">In Progress</p>
                    <Clock className="w-4 h-4 text-info" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {dashboard?.inProgressCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Under assessment</p>
                </div>

                {/* Completed */}
                <div className="card-elevated p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Completed</p>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {dashboard?.completedThisMonthCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>

                {/* Returned */}
                <div className="card-elevated p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Returned</p>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {dashboard?.returnedCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Need revision</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            {dashboard?.recentActivities && dashboard.recentActivities.length > 0 && (
              <section className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-border">
                  <h3 className="text-lg font-serif font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Latest updates and submissions</p>
                </div>
                <div className="card-elevated divide-y border-border">
                  {dashboard.recentActivities.slice(0, 5).map((activity, index) => (
                    <div
                      key={index}
                      className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors flex items-center justify-between gap-4"
                      onClick={() => navigate(`/review/${activity.applicationId}`)}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{activity.applicantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description || activity.activityType}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
