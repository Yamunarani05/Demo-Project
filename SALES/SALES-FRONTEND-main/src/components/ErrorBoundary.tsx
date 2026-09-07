import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", backgroundColor: "#ffebeb", color: "red", zIndex: 9999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
          <pre style={{fontSize: '12px'}}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}
