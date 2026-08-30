import React, { useState } from "react";
import {
  Sliders,
  ShieldCheck,
  Activity,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  HardDrive,
} from "lucide-react";
import { ProductionHardeningPanel } from "../../components/ProductionHardeningPanel";
import { adminAuthService } from "../../services/admin-auth.service";

export const OperationsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"hardening" | "logs" | "telemetry">("hardening");
  const adminKey = adminAuthService.getAdminKey();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>DevOps, SRE & Security Operations (M44)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Operations & Threat Matrix Console
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Execute automated E2E release gate smoke suites, inspect rate limiting buffers, and review real-time security postures.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab("hardening")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === "hardening"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950 text-stone-400 border border-stone-800"
            }`}
          >
            Hardening & E2E Tests
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === "logs"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950 text-stone-400 border border-stone-800"
            }`}
          >
            Live Logs
          </button>
        </div>
      </div>

      {activeSubTab === "hardening" && (
        <ProductionHardeningPanel adminKey={adminKey} />
      )}

      {activeSubTab === "logs" && (
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">Structured System Telemetry Stream (JSON)</span>
            </div>
            <span className="text-[10px] text-emerald-400">Streaming Live (100% Buffered)</span>
          </div>

          <div className="space-y-1.5 text-stone-300 max-h-96 overflow-y-auto">
            <p className="text-emerald-400">[2026-08-30T11:42:01.102Z] INFO [ApiGateway]: GET /api/content/daily 200 OK (14ms)</p>
            <p className="text-stone-400">[2026-08-30T11:42:04.450Z] INFO [SearchEngine]: Inverted index query 'karma' returned 4 results (1.2ms)</p>
            <p className="text-sky-400">[2026-08-30T11:42:08.891Z] INFO [BillingService]: Webhook received from provider=razorpay event=payment.captured</p>
            <p className="text-emerald-400">[2026-08-30T11:42:09.112Z] INFO [DonationsService]: Issued 80G tax receipt 'REC-VEDA-8819' for amount=5100</p>
            <p className="text-stone-400">[2026-08-30T11:42:15.004Z] INFO [RateLimiter]: Sliding window evaluated 12 requests, 0 throttled</p>
          </div>
        </div>
      )}
    </div>
  );
};
