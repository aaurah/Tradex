import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('[Tradex ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = window.location.origin;
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-white">Application Render Notice</h2>
              <p className="text-xs text-[#888] leading-relaxed">
                The terminal encountered an unexpected execution event in this preview window.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-[11px] font-mono text-red-300 text-left break-words overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold font-mono flex items-center justify-center space-x-1.5 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Recover View</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black text-xs font-black font-mono flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Terminal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
