import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  AlertTriangle,
  Check,
  Trash2,
  Clock,
  History,
  BarChart3,
  UserX,
  EyeOff,
} from "lucide-react";
import { ModalPortal } from "../ModalPortal";
import {
  communityService,
  type CommunityReport,
  type ModerationAuditLog,
} from "../../services/community.service";

interface ModeratorConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export const ModeratorConsoleModal: React.FC<ModeratorConsoleModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<"queue" | "audit" | "analytics">("queue");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const reportsQueue = communityService.getReportsQueue();
  const auditLogs = communityService.getAuditLogs();
  const analytics = communityService.getAnalyticsSummary();

  const handleAction = (
    reportId: string,
    action: "dismiss" | "remove_post" | "warn" | "mute"
  ) => {
    const note = resolutionNotes[reportId] || "Moderator reviewed and applied action";
    communityService.resolveReport(reportId, action, note);
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mod-console-title"
      >
        <div
          className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-amber-500/15">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                  Satsang Maryādā Governance
                </span>
                <h2 id="mod-console-title" className="text-lg sm:text-xl font-bold font-serif-sacred text-amber-200">
                  Moderator & Compliance Console
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center space-x-2 px-5 pt-3 border-b border-stone-800">
            <button
              onClick={() => setActiveTab("queue")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "queue"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reported Queue ({reportsQueue.filter((r) => r.status === "pending").length})</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "audit"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Immutable Audit Logs ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "analytics"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Health Analytics</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 1. REPORTED QUEUE */}
            {activeTab === "queue" && (
              <div className="space-y-3">
                {reportsQueue.length === 0 ? (
                  <div className="py-16 text-center text-xs text-stone-500 font-serif-sacred">
                    ✨ All clear! No pending reports in the Satsang moderation queue.
                  </div>
                ) : (
                  reportsQueue.map((rep) => (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        rep.status === "pending"
                          ? "bg-stone-900/90 border-amber-500/40"
                          : "bg-stone-900/40 border-stone-800 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                              rep.severity === "critical" || rep.severity === "high"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {rep.severity} Severity
                          </span>
                          <span className="text-xs font-bold text-stone-200 uppercase font-mono">
                            Reason: {rep.reason}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rep.status === "pending"
                                ? "bg-amber-500 text-stone-950"
                                : rep.status === "actioned"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-stone-800 text-stone-400"
                            }`}
                          >
                            {rep.status}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {new Date(rep.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300">
                        <div className="font-semibold text-amber-300 mb-1">{rep.targetSummary}</div>
                        {rep.note && (
                          <div className="text-stone-400 italic">"Reporter note: {rep.note}"</div>
                        )}
                        {rep.resolution && (
                          <div className="text-emerald-400 mt-1 font-mono text-[11px]">
                            Resolution: {rep.resolution}
                          </div>
                        )}
                      </div>

                      {rep.status === "pending" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Resolution reason/note..."
                            value={resolutionNotes[rep.id] || ""}
                            onChange={(e) =>
                              setResolutionNotes({ ...resolutionNotes, [rep.id]: e.target.value })
                            }
                            className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs flex-1"
                          />
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              onClick={() => handleAction(rep.id, "dismiss")}
                              className="px-3 py-1.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Dismiss report as valid content"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Dismiss</span>
                            </button>
                            <button
                              onClick={() => handleAction(rep.id, "remove_post")}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Hide/Remove post from feed"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Remove Content</span>
                            </button>
                            <button
                              onClick={() => handleAction(rep.id, "mute")}
                              className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/60 hover:bg-amber-900 text-amber-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Mute user for 7 days"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Mute 7d</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. IMMUTABLE AUDIT LOGS */}
            {activeTab === "audit" && (
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-500">
                    No moderation actions recorded yet. All administrative actions generate an immutable log.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-400 font-mono uppercase text-[10px]">
                            {log.action}
                          </span>
                          <span className="text-stone-300">Target: {log.targetType}/{log.targetId}</span>
                        </div>
                        <p className="text-stone-400 text-[11px]">{log.note}</p>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. HEALTH ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">Daily Active (DAU)</span>
                    <div className="text-xl font-bold font-mono text-amber-400">{analytics.dau}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">Monthly Active (MAU)</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">{analytics.mau}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">Total Reflections</span>
                    <div className="text-xl font-bold font-mono text-amber-300">{analytics.totalPosts}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">Support Deflection</span>
                    <div className="text-xl font-bold font-mono text-cyan-400">{analytics.supportDeflectionRate}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  <strong>BRD KPI Target Alignment:</strong> Community Tab Visit Rate ≥ 30% MAU; Contributor Rate ≥ 8%;
                  Safety SLA ≥ 95% resolved within 24 hours. Current reported ratio is &lt; 0.4% (well within &lt; 2% target).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
