import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ProgressTimeline } from "@/components/promotion/ProgressTimeline";
import { useAuth } from "@/contexts/AuthContext";

const Confirmation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const timelineSteps = [
    {
      id: "submitted",
      label: "Application Submitted",
      status: "completed" as const,
    },
    {
      id: "department",
      label: "Department Review",
      status: "current" as const,
    },
    {
      id: "institutional",
      label: "Institutional Review",
      status: "upcoming" as const,
    },
    {
      id: "external",
      label: "External Assessment",
      status: "upcoming" as const,
    },
    {
      id: "committee",
      label: "University Committee",
      status: "upcoming" as const,
    },
    {
      id: "decision",
      label: "Final Decision",
      status: "upcoming" as const,
    },
  ];

  return (
    <div className="page-container">
      <Header
        userName={user?.fullName}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
        onChangePassword={() => navigate("/change-password")}
      />

      <main className="content-container flex flex-col items-center justify-center min-h-[70vh]">
        {/* Success Message */}
        <div className="text-center mb-10">
          {/* Success icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Application Submitted
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your promotion application has been received and is now under review.
          </p>
        </div>

        {/* Timeline Card */}
        <div className="border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Application Timeline
            </h2>
          </div>
          <ProgressTimeline steps={timelineSteps} />
        </div>

        {/* Info Note */}
        <div className="bg-muted rounded-lg p-5 mb-8">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What happens next?</strong>
            <br />
            Your application will be reviewed by the Department Promotions Committee.
            You'll receive email notifications as your application progresses through each stage.
            <span className="block mt-2 text-primary font-medium">
              Average review time: 4-6 weeks per stage
            </span>
          </p>
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/promotion-letter")}
            className="inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Promotion Letter
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
