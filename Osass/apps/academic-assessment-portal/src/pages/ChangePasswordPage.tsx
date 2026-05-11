import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ClipboardCheck, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggle = (field: keyof typeof showPasswords) =>
    setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match. Please make sure both new password fields match.");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.changePassword(formData.currentPassword, formData.newPassword);
      if (result.success) {
        authService.logout();
        setDone(true);
      } else {
        toast.error(result.message || "Failed to change password. Check your current password.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded bg-primary/10 mb-4">
            <ClipboardCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Assessment Portal</h1>
          <p className="text-sm text-muted-foreground">Academic Promotion Committee Review System</p>
        </div>

        {/* Card */}
        <div className="card-elevated p-8 border space-y-6">
          {done ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Password Changed Successfully</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Your password has been updated. Please sign in with your new password.
              </p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Sign In
              </Button>
            </div>
          ) : (
          <>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current" className="text-sm font-medium">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="current"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => toggle("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new" className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password (min. 8 characters)"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggle("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggle("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </button>
          </form>
          </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <div>University of Mines and Technology (UMaT)</div>
          <div>Academic Promotion Assessment System</div>
        </p>
      </div>
    </div>
  );
}
