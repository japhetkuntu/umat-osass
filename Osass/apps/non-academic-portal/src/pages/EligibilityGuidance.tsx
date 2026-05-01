import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Users, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { YearsProgressBar } from "@/components/promotion/YearsProgressBar";
import { GuidanceCard } from "@/components/promotion/GuidanceCard";
import { useAuth } from "@/contexts/AuthContext";

const EligibilityGuidance = () => {
  const navigate = useNavigate();
  const { user, eligibility, logout } = useAuth();

  // The ProtectedRoute handles authentication check, but we need to check eligibility here
  useEffect(() => {
    if (eligibility?.isEligibleToApplyForNextPosition) {
      // If eligible, redirect to dashboard
      navigate("/dashboard");
    }
  }, [eligibility, navigate]);

  if (!user) {
    return null;
  }

  // Calculate estimated eligibility date
  const estimatedDate = eligibility?.estimatedEligibilityDate
    ? new Date(eligibility.estimatedEligibilityDate).toLocaleDateString()
    : "When eligible";

  const guidanceItems = [
    {
      icon: GraduationCap,
      title: "Prepare Your Performance Evidence",
      description: "Begin organizing materials related to your 10 work performance categories so you're ready when eligible. Consider documenting work outputs, supervisor feedback, and contributions to your unit.",
    },
    {
      icon: BookOpen,
      title: "Organize Your Knowledge Materials",
      description: "Keep records of knowledge materials and supporting documents as they are produced. Maintain a log of reports, manuals, journal articles, and other professional outputs.",
    },
    {
      icon: Users,
      title: "Document Service Contributions",
      description: "Maintain a record of university, national, or international service activities over time. Include committee memberships, community engagement, and professional service.",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
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

        {/* Header Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-3">
            Preparing for Your Next Promotion
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            You're making progress in your professional career. At this time, you're not yet eligible to apply for promotion based on time in your current position.
          </p>
        </div>

        {/* Years in Rank Card */}
        <div className="card-elevated p-8 mb-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Years-in-Rank Requirement
          </h2>
          <p className="text-muted-foreground mb-6">
            One of the eligibility requirements for promotion is a minimum number of years spent in your current rank.
          </p>

          {/* Rank Info */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Rank</p>
              <p className="text-lg font-semibold text-foreground">{eligibility?.applicantCurrentPosition || user.position}</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Target Rank</p>
              <p className="text-lg font-semibold text-primary">{eligibility?.applicantNextPosition || "Next Rank"}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <YearsProgressBar
            currentYears={eligibility?.totalNumberOfYearsInCurrentPosition || 0}
            requiredYears={eligibility?.totalNumberOfYearsRequiredInNextPosition || 3}
          />
        </div>

        {/* Guidance Section */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            How to Use This Time Productively
          </h2>
          <p className="text-muted-foreground mb-6">
            Here are some suggestions to help you prepare for when you become eligible.
          </p>

          <div className="space-y-4">
            {guidanceItems.map((item, index) => (
              <GuidanceCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                className="animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Eligibility Date Card */}
        <div
          className="bg-accent/50 border border-primary/10 rounded-xl p-6 mb-8 text-center animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-sm text-muted-foreground mb-1">Estimated Eligibility Date</p>
          <p className="text-2xl font-semibold text-primary">
            {estimatedDate}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You'll be eligible to apply for promotion from this date
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EligibilityGuidance;
