import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, RotateCcw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[SutraSparsh ErrorBoundary caught error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleResetCache = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("sutrasparsh_promo_last_date");
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f6fb] text-[#1d1b2e] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#cfcbe0] rounded-[28px] p-8 shadow-[0_10px_30px_-12px_rgb(27_23_64_/_0.28)] text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fbf0d6] border border-[#f0cf8a] flex items-center justify-center text-[#b8801f] shadow-xs">
              <span className="text-3xl font-serif">ॐ</span>
            </div>

            <div className="space-y-2">
              <div className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#b8801f]">
                SutraSparsh • Sacred Connection
              </div>
              <h2 className="text-2xl font-bold font-serif-sacred text-[#1b1740]">
                Graceful Sanctuary Recovery
              </h2>
              <p className="text-xs text-[#55526b] leading-relaxed">
                A temporary glitch occurred while loading the sacred contemplation. Tap below to refresh your connection immediately.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#1b1740] hover:bg-[#2b2560] text-[#f4f2ff] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload SutraSparsh</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#efedf6] hover:bg-[#e2def0] text-[#1b1740] border border-[#cfcbe0] transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#b8801f]" />
                <span>Clear Session &amp; Reload</span>
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 text-left p-3 rounded-xl bg-[#f7f6fb] border border-[#cfcbe0]/60 text-[11px] text-[#55526b]">
                <summary className="cursor-pointer font-medium text-[#1b1740] flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-[#b8801f]" />
                  <span>Technical Diagnostic Note</span>
                </summary>
                <div className="mt-2 font-mono text-[10px] break-all bg-white p-2 rounded border border-[#cfcbe0]/50 text-red-700">
                  {this.state.error.message || String(this.state.error)}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
