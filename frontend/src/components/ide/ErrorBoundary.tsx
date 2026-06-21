import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-destructive/5 border border-destructive/10 rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {this.props.fallbackTitle || "Panel Load Error"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto line-clamp-3">
              {this.state.error?.message || "An unexpected error occurred in this view."}
            </p>
          </div>
          <button
            className="text-xs text-primary hover:underline font-medium"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Reloading Panel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
