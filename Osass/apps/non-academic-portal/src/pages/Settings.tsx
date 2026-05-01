import { User, Bell, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
    const { user, eligibility } = useAuth();
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Settings saved",
            description: "Your profile preferences have been updated.",
        });
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="border-b border-border/50 pb-6">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account preferences and security settings.</p>
            </div>

            <div className="grid gap-8">
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <User className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Profile Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 card-elevated p-8">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input defaultValue={user.fullName} disabled className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Staff ID</Label>
                            <Input defaultValue={user.staffId} disabled className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Current Rank</Label>
                            <Input defaultValue={eligibility?.applicantCurrentPosition || user.position} disabled className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Input defaultValue={user.staffCategory || "—"} disabled className="bg-muted/50" />
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <Bell className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Notifications</h2>
                    </div>

                    <div className="card-elevated p-8 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div>
                                <p className="font-bold">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive updates about your promotion application status.</p>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-bold">System Announcements</p>
                                <p className="text-sm text-muted-foreground">Stay informed about institutional policy changes.</p>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <Shield className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Security</h2>
                    </div>

                    <div className="card-elevated p-8">
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                            Change System Password
                        </Button>
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                    <Button onClick={handleSave} size="lg" className="bg-primary text-white px-10">
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
