import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send boundary crashes to our observability layer
    logger.error('ErrorBoundary caught a component crash', error, errorInfo as any);
  }

  public render() {
    if (this.state.hasError) {
      // Return custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default safe fallback UI
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-[20px] border-[1.5px] border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-4 opacity-80" />
          <h2 className="text-[1.1rem] font-bold text-red-700 tracking-[-0.3px] mb-[6px]">
            Component failed to load
          </h2>
          <p className="text-[0.8rem] text-red-600/80 mb-[22px] max-w-[300px] leading-[1.6]">
            {this.state.error?.message || 'An unexpected rendering error occurred. Our engineers have been notified.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-[18px] py-[10px] bg-red-100 hover:bg-red-200 text-red-700 rounded-[10px] text-[0.8rem] font-bold transition-colors duration-200 cursor-pointer border-none"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
