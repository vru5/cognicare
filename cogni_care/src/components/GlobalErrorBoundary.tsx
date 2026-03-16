"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GlobalErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/login?error=connection_failed";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Connection Issue</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We're having trouble connecting to the backend. Please check your internet or try again later.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
               <p className="text-xs text-muted-foreground bg-slate-100 p-3 rounded-lg font-mono">
                  {this.state.error?.message || "Unknown connectivity error"}
               </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={this.handleReset}
                className="w-full py-6 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/20"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap for export as default if needed, though class is fine
export default GlobalErrorBoundary;
