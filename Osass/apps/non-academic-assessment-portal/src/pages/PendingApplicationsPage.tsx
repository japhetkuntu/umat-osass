import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import assessmentApi from "@/services/assessmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  User,
  GraduationCap,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState, useMemo } from "react";

export default function PendingApplicationsPage() {
  const { committeeType } = useParams<{ committeeType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const currentCommittee = user?.committees.find(
    (c) => c.committeeType === committeeType
  );

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["pending-applications", committeeType],
    queryFn: async () => {
      const response = await assessmentApi.getPendingApplications(committeeType!);
      if (response.code >= 200 && response.code < 300 && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch applications");
    },
    enabled: !!committeeType,
  });

  

  const applications_list = useMemo(() => {
    if (!applications) return [];
    // Backend returns { results: [...], totalCount, pageIndex, pageSize, ... }
    const items = Array.isArray(applications) ? applications : (applications.results || applications.items || applications.Items || []);
    
    if (items.length === 0) return [];
    
    return items.map((a: any) => {
      const perf = a.applicantPerformance || a.ApplicantPerformance || {};
      return {
        applicationId: a.applicationId || a.ApplicationId,
        applicantId: a.applicantId || a.ApplicantId,
        applicantName: a.applicantName || a.ApplicantName,
        applicantEmail: a.applicantEmail || a.ApplicantEmail,
        applyingForPosition: a.applyingForPosition || a.ApplyingForPosition || a.promotionPosition || a.PromotionPosition,
        currentPosition: a.currentPosition || a.ApplicantCurrentPosition,
        unitName: a.unitName || a.departmentName || a.ApplicantDepartmentName || a.ApplicantFacultyName,
        applicantPerformance: {
          performanceAtWorkPerformance: perf.performanceAtWorkPerformance || perf.PerformanceAtWorkPerformance || perf.teachingPerformance || perf.TeachingPerformance || a.PerformanceAtWorkPerformance || "Adequate",
          knowledgeProfessionPerformance: perf.knowledgeProfessionPerformance || perf.KnowledgeProfessionPerformance || perf.publicationPerformance || perf.PublicationPerformance || a.KnowledgeProfessionPerformance || "Adequate",
          servicePerformance: perf.servicePerformance || perf.ServicePerformance || a.ServicePerformance || "Adequate",
        },
        applicationStatus: a.applicationStatus || a.ApplicationStatus || "Pending",
        submissionDate: a.submissionDate || a.SubmissionDate,
        isResubmission: a.isResubmission || a.IsResubmission,
        resubmissionCount: a.resubmissionCount || a.ResubmissionCount || 0,
      };
    });
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications_list;
    const term = searchTerm.toLowerCase();
    return applications_list.filter(app =>
      (app.applicantName || "").toLowerCase().includes(term) ||
      (app.unitName || "").toLowerCase().includes(term) ||
      (app.applyingForPosition || "").toLowerCase().includes(term)
    );
  }, [applications_list, searchTerm]);

  const getPerformanceBadge = (performance: string) => {
    const variants: Record<string, { variant: "success" | "warning" | "destructive" | "secondary"; icon: React.ReactNode }> = {
      High: { variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
      Good: { variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
      Adequate: { variant: "warning", icon: <AlertCircle className="h-3 w-3" /> },
      InAdequate: { variant: "destructive", icon: <MinusCircle className="h-3 w-3" /> },
    };
    const config = variants[performance] || { variant: "secondary" as const, icon: null };
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {performance}
      </Badge>
    );
  };

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
        <div className="content-container py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-serif font-semibold text-foreground">{committeeType}</h1>
              <p className="text-sm text-muted-foreground">
                {getCommitteeDisplayName(committeeType!)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentCommittee?.isChairperson && (
                <Badge className="text-xs">
                  Chairperson
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to={`/history/${committeeType}`}>
                  View History
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="content-container space-y-6">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="card-elevated p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Failed to Load Applications</h3>
                <p className="text-sm text-muted-foreground mb-4">Unable to retrieve pending applications for review.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No pending applications</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "No applications match your search criteria"
                : "There are no applications awaiting review at this time"}
            </p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted/30">
                  <TableHead className="font-semibold text-foreground">Applicant</TableHead>
                  <TableHead className="font-semibold text-foreground">Position</TableHead>
                  <TableHead className="font-semibold text-foreground">Department</TableHead>
                  <TableHead className="font-semibold text-foreground">Performance</TableHead>
                  <TableHead className="font-semibold text-foreground">Submitted</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.applicationId}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => navigate(`/review/${app.applicationId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{app.applicantName}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.applicantEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{app.applyingForPosition}</p>
                        <p className="text-xs text-muted-foreground">from {app.currentPosition}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{app.unitName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">W:</span>
                          {getPerformanceBadge(app.applicantPerformance.performanceAtWorkPerformance)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">K:</span>
                          {getPerformanceBadge(app.applicantPerformance.knowledgeProfessionPerformance)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">S:</span>
                          {getPerformanceBadge(app.applicantPerformance.servicePerformance)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          {format(new Date(app.submissionDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      {app.isResubmission && (
                        <Badge variant="outline" className="text-xs mt-2">
                          Resubmission #{app.resubmissionCount}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
