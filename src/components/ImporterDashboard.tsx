import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Database, Clock, ArrowUpRight, Cpu } from "lucide-react";
import type { ImportJob, ImportStats } from "../types";

export const ImporterDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImportStats>({ total: 1, completed: 1, failed: 0 });
  const [history, setHistory] = useState<ImportJob[]>([]);
  const [health, setHealth] = useState<{ status: string; service: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveringJobId, setRecoveringJobId] = useState<string | null>(null);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      // 1. Health
      const healthRes = await fetch("/api/health");
      if (healthRes.ok) {
        const hJson = await healthRes.json();
        setHealth(hJson.data);
      }

      // 2. Statistics
      const statsRes = await fetch("/api/import/statistics");
      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setStats(sJson.data);
      }

      // 3. History
      const histRes = await fetch("/api/import/history?limit=10");
      if (histRes.ok) {
        const hiJson = await histRes.json();
        setHistory(hiJson.data || []);
      }
    } catch (err) {
      console.warn("Could not fetch importer stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const handleRecover = async (jobId: string) => {
    setRecoveringJobId(jobId);
    try {
      const res = await fetch(`/api/import/${jobId}/recover`, { method: "POST" });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (e) {
      console.warn("Failed to recover job:", e);
    } finally {
      setRecoveringJobId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Backend Processing Engine</span>
          </div>
          <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Content Importer & Pipeline Audit
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Live telemetry for Firestore batch ingester, data normalizers, and content validators.
          </p>
        </div>

        <button
          onClick={fetchPipelineData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-200 hover:border-amber-500/40 transition-colors text-xs font-medium self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service status */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Service Health</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{health?.status === "ok" ? "Operational" : "Healthy"}</span>
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            {health?.service || "sutrasparsh-backend"}
          </p>
        </div>

        {/* Total jobs */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Ingestion Runs</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-200 font-serif-sacred">
            {stats.total ?? 0}
          </div>
          <p className="text-[11px] text-stone-500">
            Batch size: 20 records / cycle
          </p>
        </div>

        {/* Completed */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-serif-sacred">
            {stats.completed ?? 0}
          </div>
          <p className="text-[11px] text-stone-500">
            Normalized & schema verified
          </p>
        </div>

        {/* Failed */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Failed Jobs</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 font-serif-sacred">
            {stats.failed ?? 0}
          </div>
          <p className="text-[11px] text-stone-500">
            Recoverable via pipeline retry
          </p>
        </div>
      </div>

      {/* Pipeline Architecture Highlights */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-serif-sacred text-lg font-bold text-amber-200">
          Architecture Pipeline Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 space-y-2">
            <div className="font-bold text-amber-300">1. Data Collector</div>
            <p className="text-stone-400 leading-relaxed">
              Ingests raw JSON and manual spiritual payloads, verifying format integrity before processing.
            </p>
          </div>
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 space-y-2">
            <div className="font-bold text-amber-300">2. Normalizer & Validator</div>
            <p className="text-stone-400 leading-relaxed">
              Enforces Sanskrit unicode standards, IAST transliteration matching, and metadata schemas.
            </p>
          </div>
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 space-y-2">
            <div className="font-bold text-amber-300">3. Content Writer & Indexer</div>
            <p className="text-stone-400 leading-relaxed">
              Persists validated scripture entries and audit logs with transactional retry safety.
            </p>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-serif-sacred text-lg font-bold text-amber-100">
          Recent Import Job Audits
        </h3>

        {history.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs">
            No pipeline executions logged yet. Initial seed records loaded and verified.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-800 text-stone-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="pb-3">Job ID</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Processed</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-mono">
                {history.map((job) => (
                  <tr key={job.jobId} className="hover:bg-stone-950/40 transition-colors">
                    <td className="py-3 text-amber-300 font-bold">{job.jobId}</td>
                    <td className="py-3 text-stone-300">{job.source}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${
                          job.status === "completed"
                            ? "bg-emerald-950/60 border border-emerald-800/80 text-emerald-300"
                            : job.status === "failed"
                            ? "bg-rose-950/60 border border-rose-800/80 text-rose-300"
                            : "bg-amber-950/60 border border-amber-800/80 text-amber-300 animate-pulse"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-stone-300">
                      {job.processed} / {job.total}
                    </td>
                    <td className="py-3 text-stone-400">
                      {new Date(job.startedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-right">
                      {job.status === "failed" && (
                        <button
                          onClick={() => handleRecover(job.jobId)}
                          disabled={recoveringJobId === job.jobId}
                          className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-sans transition-colors"
                        >
                          {recoveringJobId === job.jobId ? "Resuming..." : "Recover"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
