import { useState, useEffect } from "react";
import { Bell, Calendar, ChevronLeft, ChevronRight, ArrowLeft, ExternalLink, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { academicService } from "@/services/academicService";
import type { StaffUpdateItem, PagedResult } from "@/types/academic";
import { format } from "date-fns";

const StaffUpdates = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [pagedData, setPagedData] = useState<PagedResult<StaffUpdateItem> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Detail view
    const [selectedUpdate, setSelectedUpdate] = useState<StaffUpdateItem | null>(null);

    useEffect(() => {
        loadUpdates();
    }, [page]);

    const loadUpdates = async () => {
        setIsLoading(true);
        try {
            const res = await academicService.getStaffUpdates(page, pageSize);
            if (res.success && res.data) {
                setPagedData(res.data);
            }
        } catch {
            // silent fail — empty state will show
        } finally {
            setIsLoading(false);
        }
    };

    const updates = pagedData?.results ?? [];
    const totalPages = pagedData?.totalPages ?? 1;

    const priorityClass = (priority: string) => {
        if (priority === "high") return "bg-destructive/10 text-destructive border-destructive/20";
        if (priority === "medium") return "bg-warning/10 text-warning border-warning/20";
        return "bg-primary/10 text-primary border-primary/20";
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
            return format(new Date(dateStr), "MMM d, yyyy");
        } catch {
            return "";
        }
    };

    // Detail view
    if (selectedUpdate) {
        return (
            <div className="page-container">
                <Header
                    userName={user?.fullName}
                    onLogout={() => { logout(); navigate("/login"); }}
                    onChangePassword={() => navigate("/change-password")}
                />
                <main className="content-container max-w-4xl">
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2 text-muted-foreground"
                        onClick={() => setSelectedUpdate(null)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to updates
                    </Button>

                    <article>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityClass(selectedUpdate.priority)}`}>
                                {selectedUpdate.category}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(selectedUpdate.publishedAt || selectedUpdate.createdAt)}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-foreground mb-6">
                            {selectedUpdate.title}
                        </h1>

                        <div
                            className="prose prose-sm max-w-none text-foreground"
                            dangerouslySetInnerHTML={{ __html: selectedUpdate.content }}
                        />
                    </article>
                </main>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Header
                userName={user?.fullName}
                onLogout={() => { logout(); navigate("/login"); }}
                onChangePassword={() => navigate("/change-password")}
            />

            <main className="content-container max-w-4xl">
                <div className="mb-8 border-b border-border/30 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Staff Updates</h1>
                            <p className="text-sm text-muted-foreground mt-1">Announcements and policy changes</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : updates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Megaphone className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-1">No updates available</h2>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            There are no announcements or policy updates at this time. Check back later.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {updates.map((update) => (
                                <button
                                    key={update.id}
                                    className="card-elevated group p-6 transition-all duration-200 hover:border-primary/30 w-full text-left"
                                    onClick={() => setSelectedUpdate(update)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityClass(update.priority)}`}>
                                            {update.category}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(update.publishedAt || update.createdAt)}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {update.title}
                                    </h2>
                                    <div
                                        className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: update.content }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <section className="mt-12 bg-muted/30 p-8 rounded-xl border border-dashed border-border/50 text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">Institutional Resource</p>
                    <h3 className="text-2xl font-bold text-foreground mb-2">UMaT Repository</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">Access the complete archive of university statutes, regulations, and academic policies.</p>
                    <Button variant="outline" className="gap-2">
                        Visit Portal <ExternalLink className="w-4 h-4" />
                    </Button>
                </section>
            </main>
        </div>
    );
};

export default StaffUpdates;
