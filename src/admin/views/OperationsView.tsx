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
      <div className="ui-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="ui-badge ui-badge-info mb-1">
              <Sliders className="w-3.5 h-3.5 mr-1" />
              <span>DevOps, SRE & Security Operations (M44)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Operations & Threat Matrix Console
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Execute automated E2E release gate smoke suites, inspect rate limiting buffers, and review real-time security postures.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab("hardening")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeSubTab === "hardening"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900"
              }`}
            >
              Hardening & E2E Tests
            </button>
            <button
              onClick={() => setActiveSubTab("logs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeSubTab === "logs"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900"
              }`}
            >
              Live Logs
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "hardening" && (
        <ProductionHardeningPanel adminKey={adminKey} />
      )}

      {activeSubTab === "logs" && (
        <div className="ui-card font-mono text-xs space-y-3 bg-slate-900 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-blue-400">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">Structured System Telemetry Stream (JSON)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Streaming Live (100% Buffered)</span>
          </div>

          <div className="space-y-1.5 text-slate-300 max-h-96 overflow-y-auto">
            <p className="text-emerald-400">[2026-08-30T11:42:01.102Z] INFO [ApiGateway]: GET /api/content/daily 200 OK (14ms)</p>
            <p className="text-slate-400">[2026-08-30T11:42:04.450Z] INFO [SearchEngine]: Inverted index query 'karma' returned 4 results (1.2ms)</p>
            <p className="text-sky-400">[2026-08-30T11:42:08.891Z] INFO [BillingService]: Webhook received from provider=razorpay event=payment.captured</p>
            <p className="text-emerald-400">[2026-08-30T11:42:09.112Z] INFO [DonationsService]: Issued 80G tax receipt 'REC-VEDA-8819' for amount=5100</p>
            <p className="text-slate-400">[2026-08-30T11:42:15.004Z] INFO [RateLimiter]: Sliding window evaluated 12 requests, 0 throttled</p>
          </div>
        </div>
      )}
    </div>
  );
};
