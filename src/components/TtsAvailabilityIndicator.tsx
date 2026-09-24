import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Globe,
  Cloud,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  ttsService,
  type TtsAvailabilityData,
  type ProviderAvailabilityInfo,
} from "../services/tts.service.js";

interface TtsAvailabilityIndicatorProps {
  isLight?: boolean;
  compact?: boolean;
  showProbeButton?: boolean;
  onProbeComplete?: (data: TtsAvailabilityData) => void;
  className?: string;
}

export const TtsAvailabilityIndicator: React.FC<TtsAvailabilityIndicatorProps> = ({
  isLight = false,
  compact = false,
  showProbeButton = true,
  onProbeComplete,
  className = "",
}) => {
  const [availability, setAvailability] = useState<TtsAvailabilityData | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Fetch current availability from server
  const fetchAvailability = useCallback(async () => {
    try {
      const data = await ttsService.getAvailability();
      if (data) {
        setAvailability(data);
        setLastRefreshedAt(new Date(data.timestamp));
      }
    } catch {
      // Quiet fallback
    }
  }, []);

  // Live trigger probe
  const handleProbe = async () => {
    if (isProbing) return;
    setIsProbing(true);
    try {
      const updated = await ttsService.probeProviders();
      if (updated) {
        setAvailability(updated);
        setLastRefreshedAt(new Date(updated.timestamp));
        if (onProbeComplete) onProbeComplete(updated);
      }
    } catch {
      // Ignore
    } finally {
      setIsProbing(false);
    }
  };

  useEffect(() => {
    fetchAvailability();

    // Listen to custom updates from synthesis & test calls
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TtsAvailabilityData>;
      if (customEvent.detail) {
        setAvailability(customEvent.detail);
        setLastRefreshedAt(new Date(customEvent.detail.timestamp));
      }
    };

    window.addEventListener("sutrasparsh:tts_availability_updated", handleUpdate);

    // Periodic heartbeat poll (every 15s for live real-time status)
    const interval = setInterval(fetchAvailability, 15000);

    return () => {
      window.removeEventListener("sutrasparsh:tts_availability_updated", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchAvailability]);

  // Color & Badge Helpers
  const getStatusColor = (status: "operational" | "degraded" | "offline") => {
    switch (status) {
      case "operational":
        return {
          dotBg: "bg-emerald-500",
          ring: "ring-emerald-400/40",
          badgeBg: isLight ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          text: "text-emerald-500",
          icon: CheckCircle2,
        };
      case "degraded":
        return {
          dotBg: "bg-amber-500",
          ring: "ring-amber-400/40",
          badgeBg: isLight ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-amber-500/15 text-amber-400 border-amber-500/30",
          text: "text-amber-500",
          icon: AlertTriangle,
        };
      case "offline":
      default:
        return {
          dotBg: "bg-rose-500",
          ring: "ring-rose-400/40",
          badgeBg: isLight ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-rose-500/15 text-rose-400 border-rose-500/30",
          text: "text-rose-500",
          icon: XCircle,
        };
    }
  };

  const bhashini = availability?.providers.bhashini;
  const google = availability?.providers.google;

  // Compact Pill Mode (e.g. for header or compact row)
  if (compact) {
    return (
      <div
        id="tts-availability-compact-indicator"
        className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all ${
          isLight
            ? "bg-stone-50 border-stone-200 text-stone-700"
            : "bg-stone-900/80 border-white/10 text-stone-300"
        } ${className}`}
      >
        <div className="flex items-center space-x-1.5" title="Bhashini ULCA real-time status">
          <span className="text-[10px]">🇮🇳</span>
          <span
            className={`w-2 h-2 rounded-full ${
              bhashini?.status === "operational"
                ? "bg-emerald-500 animate-pulse"
                : bhashini?.status === "degraded"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <span className="font-semibold">Bhashini {bhashini ? `${bhashini.avgLatencyMs}ms` : "..."}</span>
        </div>

        <span className="text-stone-500">|</span>

        <div className="flex items-center space-x-1.5" title="Google Cloud TTS real-time status">
          <span className="text-[10px]">☁️</span>
          <span
            className={`w-2 h-2 rounded-full ${
              google?.status === "operational"
                ? "bg-emerald-500 animate-pulse"
                : google?.status === "degraded"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <span className="font-semibold">Google {google ? `${google.avgLatencyMs}ms` : "..."}</span>
        </div>

        {showProbeButton && (
          <button
            type="button"
            id="tts-probe-compact-button"
            onClick={handleProbe}
            disabled={isProbing}
            className="p-0.5 ml-1 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
            title="Probe live TTS availability now"
          >
            <RefreshCw className={`w-3 h-3 ${isProbing ? "animate-spin text-amber-500" : ""}`} />
          </button>
        )}
      </div>
    );
  }

  // Full Detailed View for Preferences & Settings
  const renderProviderCard = (
    provider: ProviderAvailabilityInfo | undefined,
    fallbackName: string,
    icon: React.ReactNode,
    flag: string
  ) => {
    if (!provider) {
      return (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? "bg-white border-stone-200" : "bg-black/20 border-white/10"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm">{flag}</span>
            <span className="text-xs font-bold text-stone-400">{fallbackName}</span>
          </div>
          <span className="text-[10px] text-stone-500 animate-pulse font-mono">Checking...</span>
        </div>
      );
    }

    const colors = getStatusColor(provider.status);
    const StatusIcon = colors.icon;

    return (
      <div
        id={`tts-availability-card-${provider.providerId}`}
        className={`p-3 rounded-xl border transition-all ${
          isLight
            ? "bg-stone-50/80 border-stone-200/90 shadow-2xs"
            : "bg-stone-900/60 border-white/10"
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-base">{flag}</span>
            <div>
              <div
                className={`text-xs font-bold truncate ${
                  isLight ? "text-stone-900" : "text-stone-100"
                }`}
              >
                {provider.name}
              </div>
              <div className="text-[10px] text-stone-500 truncate">{provider.displayName}</div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${colors.badgeBg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dotBg} ${provider.status === "operational" ? "animate-pulse ring-2 " + colors.ring : ""}`} />
              <span>{provider.statusLabel}</span>
            </span>
          </div>
        </div>

        {/* Real-Time Metrics & Latency Row */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
          {/* 1. Latency */}
          <div
            className={`p-1.5 rounded-lg border ${
              isLight ? "bg-white border-stone-200" : "bg-black/25 border-white/5"
            }`}
          >
            <div className="text-[9.5px] text-stone-500 font-medium flex items-center justify-center space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>Latency</span>
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                provider.avgLatencyMs < 600
                  ? isLight ? "text-emerald-700" : "text-emerald-400"
                  : provider.avgLatencyMs < 2000
                  ? isLight ? "text-amber-700" : "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {provider.avgLatencyMs} ms
            </div>
          </div>

          {/* 2. Success Rate */}
          <div
            className={`p-1.5 rounded-lg border ${
              isLight ? "bg-white border-stone-200" : "bg-black/25 border-white/5"
            }`}
          >
            <div className="text-[9.5px] text-stone-500 font-medium flex items-center justify-center space-x-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Reliability</span>
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                provider.successRate >= 95
                  ? isLight ? "text-emerald-700" : "text-emerald-400"
                  : provider.successRate >= 75
                  ? isLight ? "text-amber-700" : "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {provider.successRate}%
            </div>
          </div>

          {/* 3. Consecutive Trend */}
          <div
            className={`p-1.5 rounded-lg border ${
              isLight ? "bg-white border-stone-200" : "bg-black/25 border-white/5"
            }`}
          >
            <div className="text-[9.5px] text-stone-500 font-medium flex items-center justify-center space-x-1">
              <Zap className="w-2.5 h-2.5" />
              <span>Recent Trend</span>
            </div>
            <div className="text-xs font-mono font-bold mt-0.5 text-stone-300">
              {provider.consecutiveFailures > 0 ? (
                <span className="text-rose-400">{provider.consecutiveFailures} err</span>
              ) : (
                <span className={isLight ? "text-emerald-700" : "text-emerald-400"}>
                  {provider.consecutiveSuccesses}✓ pass
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Response Pattern Strip */}
        <div className="mt-2.5 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[9.5px] text-stone-500 mb-1">
            <span>Recent API Response Pattern</span>
            <span className="font-mono text-[9px]">
              {provider.recentPatterns.length > 0 ? "Latest ➔ Oldest" : "Awaiting requests"}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {provider.recentPatterns.length > 0 ? (
              provider.recentPatterns.slice(-7).map((item, idx) => {
                const isFast = item.latencyMs < 500;
                const isGood = item.success;
                return (
                  <div
                    key={idx}
                    className="group relative flex-1"
                    title={`${isGood ? "200 OK" : "Failed"} · ${item.latencyMs}ms${
                      item.isFallback ? " (Failsafe Fallback)" : ""
                    }`}
                  >
                    <div
                      className={`h-2 rounded-xs transition-all ${
                        !isGood
                          ? "bg-rose-500"
                          : item.isFallback
                          ? "bg-amber-400"
                          : isFast
                          ? "bg-emerald-500 hover:bg-emerald-400"
                          : "bg-emerald-600/80"
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-stone-950 text-[9px] font-mono text-stone-200 whitespace-nowrap shadow-sm z-20 pointer-events-none">
                      {item.success ? "✓" : "✗"} {item.latencyMs}ms {item.isFallback ? "• fallback" : ""}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-[10px] text-stone-500 py-0.5">
                No recent requests recorded
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="tts-availability-status-section"
      className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
        isLight
          ? "bg-stone-50/70 border-stone-200 shadow-xs"
          : "bg-black/20 border-white/10"
      } ${className}`}
    >
      {/* Header with Title and Real-Time Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-stone-900" : "text-stone-200"
              }`}
            >
              Real-Time TTS Provider Availability
            </div>
            <div className="text-[10px] text-stone-500">
              Live status based on recent API response patterns, latencies, and failsafe telemetry.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center space-x-1 text-[9.5px] font-mono text-stone-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Updated {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>

          {showProbeButton && (
            <button
              type="button"
              id="tts-probe-refresh-button"
              onClick={handleProbe}
              disabled={isProbing}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-stone-100 text-stone-700 border-stone-300"
                  : "bg-white/5 hover:bg-white/10 text-stone-300 border-white/10"
              }`}
              title="Ping both Bhashini and Google Cloud TTS endpoints to verify live responsiveness"
            >
              <RefreshCw className={`w-3 h-3 ${isProbing ? "animate-spin text-amber-500" : "text-stone-400"}`} />
              <span>{isProbing ? "Probing..." : "Ping Now"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Provider Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {renderProviderCard(
          bhashini,
          "Bhashini ULCA",
          <Globe className="w-3.5 h-3.5" />,
          "🇮🇳"
        )}

        {renderProviderCard(
          google,
          "Google Cloud TTS",
          <Cloud className="w-3.5 h-3.5" />,
          "☁️"
        )}
      </div>

      {/* Two-Way Failsafe Synchronized Status Banner */}
      <div
        className={`px-3 py-2 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10.5px] ${
          isLight
            ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
            : "bg-amber-500/10 border-amber-500/20 text-amber-300"
        }`}
      >
        <div className="flex items-center space-x-1.5 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
          <span>Two-Way Redundant Failsafe: Bhashini ⇄ Google Cloud Neural2 Link Active</span>
        </div>
        <span className="font-mono text-[9.5px] text-stone-500 sm:text-right">
          Automatic failover occurs if primary latency exceeds timeout or returns 5xx
        </span>
      </div>
    </div>
  );
};
