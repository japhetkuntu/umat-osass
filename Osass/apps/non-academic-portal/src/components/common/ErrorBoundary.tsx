import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/dashboard";
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background animate-fade-in">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 shadow-2xl shadow-destructive/10 animate-pulse">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                            <div className="absolute inset-0 rounded-3xl border-2 border-destructive/20 animate-ping" style={{ animationDuration: '3s' }} />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground leading-relaxed">
                                An unexpected error occurred while rendering this page. We've been notified and are working on a fix.
                            </p>
                            {this.state.error && (
                                <div className="p-3 bg-muted/50 rounded-lg text-left overflow-auto max-h-32 border border-border mt-4">
                                    <p className="text-[10px] font-mono text-muted-foreground break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            <Button
                                onClick={this.handleReset}
                                className="w-full sm:w-auto bg-primary hover:bg-primary-glow text-white shadow-xl shadow-primary/20"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/"}
                                className="w-full sm:w-auto"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Back Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
