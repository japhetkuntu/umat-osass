import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred while displaying this page.
            </p>
            {this.state.error && (
              <div className="p-3 bg-muted/50 rounded-lg text-left overflow-auto max-h-32 border border-border mt-4">
                <p className="text-[10px] font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={this.handleReset} className="w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href="/">Back Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
