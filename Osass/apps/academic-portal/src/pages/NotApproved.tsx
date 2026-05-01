import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, FileEdit, Info, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ApplicationStatusBadge } from "@/components/promotion/ApplicationStatusBadge";
import { useAuth } from "@/contexts/AuthContext";

const NotApproved = () => {
  const navigate = useNavigate();
  const { user, eligibility, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-container">
      <Header
        userName={user.fullName}
        onLogout={handleLogout}
        onChangePassword={() => navigate("/change-password")}
      />

      <main className="content-container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
            <FileEdit className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Application Decision
          </h1>
          <div className="flex justify-center mb-3">
            <ApplicationStatusBadge status="not-approved" size="lg" />
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto font-light">
            Your application for promotion to {eligibility?.applicantNextPosition || "the next rank"} was not approved at this time.
          </p>
        </div>

        {/* Info Card */}
        <div className="card-elevated p-6 mb-6 animate-slide-up">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
                <Info className="w-5 h-5 text-info" />
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-2">
                What This Means
              </h2>
              <p className="text-muted-foreground mb-4">
                The review committee has determined that your application requires additional
                strengthening before approval. This decision reflects the current state of your
                application and does not preclude future success.
              </p>
              <p className="text-muted-foreground">
                Your application has been returned for update. All your previously entered information
                remains intact, and you may now make adjustments to strengthen your case.
              </p>
            </div>
          </div>
        </div>

        {/* What You Can Do Card */}
        <div className="card-elevated p-6 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="font-semibold text-foreground mb-4">
            What You Can Do Now
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Review your submitted application to understand your current profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Adjust self-assessment scores where you have additional evidence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Update remarks to better justify your assessments</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Add or replace supporting documents where appropriate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
              <span>Resubmit when ready for a new review cycle</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/application/view")}
            className="inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Previous Submission
          </Button>
          <Button
            variant="hero"
            onClick={() => navigate("/application")}
            className="inline-flex items-center gap-2 group"
          >
            Update Application
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotApproved;
