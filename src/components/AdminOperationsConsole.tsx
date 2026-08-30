import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  Activity,
  Server,
  Terminal,
  FileText,
  RefreshCw,
  PlusCircle,
  Edit3,
  Trash2,
  Play,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Radio,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Volume2,
  HardDrive,
  Lock,
  Zap,
  TrendingUp,
} from "lucide-react";
import type {
  ContentItem,
  ImportJob,
  ImportStats,
  AppLogEntry,
  SystemMetrics,
  AuditLogEntry,
  DetailedHealthStatus,
} from "../types";
import { ProductionHardeningPanel } from "./ProductionHardeningPanel";
import { MonetizationAdminConsole } from "./MonetizationAdminConsole";

const DEFAULT_ADMIN_KEY = "sutrasparsh-admin-secret";

interface AdminOperationsConsoleProps {
  onContentChanged?: () => void;
}

export const AdminOperationsConsole: React.FC<AdminOperationsConsoleProps> = ({ onContentChanged }) => {
  // Admin Authentication State
  const [adminKey, setAdminKey] = useState<string>(() => {
    try {
      return localStorage.getItem("sutrasparsh_admin_key") || DEFAULT_ADMIN_KEY;
    } catch {
      return DEFAULT_ADMIN_KEY;
    }
  });
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<"publisher" | "pipeline" | "telemetry" | "audit" | "hardening" | "monetization">("publisher");

  // Telemetry & Health States
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<DetailedHealthStatus | null>(null);
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [logLevelFilter, setLogLevelFilter] = useState<string>("ALL");
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("ALL");
  const [logSearch, setLogSearch] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Pipeline States
  const [importStats, setImportStats] = useState<ImportStats>({ total: 0, completed: 0, failed: 0 });
  const [importHistory, setImportHistory] = useState<ImportJob[]>([]);
  const [triggeringImport, setTriggeringImport] = useState<boolean>(false);
  const [recoveringJobId, setRecoveringJobId] = useState<string | null>(null);
  const [importSource, setImportSource] = useState<"json" | "manual">("json");
  const [pipelineFeedback, setPipelineFeedback] = useState<string | null>(null);

  // Content Publisher Studio States
  const [publishedVerses, setPublishedVerses] = useState<ContentItem[]>([]);
  const [editingVerse, setEditingVerse] = useState<ContentItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [publisherFeedback, setPublisherFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Publisher Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    body: "",
    transliteration: "",
    meaning: "",
    commentary: "",
    audioUrl: "",
    language: "sa",
    source: "publisher-studio",
    author: "Bhagavad Gita",
    category: "Karma Yoga",
    tags: "yoga, wisdom, scripture",
  });

  // Verify Admin Key
  const verifyKey = async (keyToVerify: string) => {
    setAuthChecking(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": keyToVerify,
        },
        body: JSON.stringify({ adminKey: keyToVerify }),
      });

      if (res.ok) {
        setIsAuthorized(true);
        localStorage.setItem("sutrasparsh_admin_key", keyToVerify);
        loadAllData(keyToVerify);
      } else {
        setIsAuthorized(false);
        setAuthError("Unauthorized: Key is invalid.");
      }
    } catch (e) {
      setIsAuthorized(false);
      setAuthError("Could not connect to server authorization endpoint.");
    } finally {
      setAuthChecking(false);
    }
  };

  // Initial Check
  useEffect(() => {
    if (adminKey) {
      verifyKey(adminKey);
    }
  }, []);

  const getHeaders = (key = adminKey) => ({
    "Content-Type": "application/json",
    "x-admin-key": key,
  });

  // Fetch all administrative & operational data
  const loadAllData = async (key = adminKey) => {
    try {
      // 1. Detailed Health
      const healthRes = await fetch("/api/health/detailed");
      if (healthRes.ok) {
        const hJson = await healthRes.json();
        setHealth(hJson.data);
      }

      // 2. Telemetry Metrics
      const metricsRes = await fetch("/api/admin/metrics", { headers: getHeaders(key) });
      if (metricsRes.ok) {
        const mJson = await metricsRes.json();
        setMetrics(mJson.data);
      }

      // 3. Application Logs
      const logsRes = await fetch(`/api/admin/logs?limit=150`, { headers: getHeaders(key) });
      if (logsRes.ok) {
        const lJson = await logsRes.json();
        setLogs(lJson.data || []);
      }

      // 4. Audit Logs
      const auditRes = await fetch(`/api/admin/audit-logs?limit=50`, { headers: getHeaders(key) });
      if (auditRes.ok) {
        const aJson = await auditRes.json();
        setAuditLogs(aJson.data || []);
      }

      // 5. Importer Statistics & History
      const statsRes = await fetch("/api/import/statistics");
      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setImportStats(sJson.data);
      }

      const histRes = await fetch("/api/import/history?limit=20");
      if (histRes.ok) {
        const hiJson = await histRes.json();
        setImportHistory(hiJson.data || []);
      }

      // 6. Content list for Publisher
      const contentRes = await fetch("/api/content?limit=100");
      if (contentRes.ok) {
        const cJson = await contentRes.json();
        setPublishedVerses(cJson.data || []);
      }
    } catch (err) {
      console.warn("Failed to load admin data:", err);
    }
  };

  // Trigger Import Pipeline (M15.3)
  const handleTriggerImport = async () => {
    setTriggeringImport(true);
    setPipelineFeedback(null);
    try {
      const res = await fetch("/api/admin/import/trigger", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ source: importSource }),
      });

      const json = await res.json();
      if (res.ok) {
        setPipelineFeedback(`Successfully ingested ${json.data?.succeeded || 0} sacred records.`);
        await loadAllData();
        if (onContentChanged) onContentChanged();
      } else {
        setPipelineFeedback(`Pipeline Error: ${json.error?.message || "Trigger failed."}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPipelineFeedback(`Failed to reach pipeline trigger: ${msg}`);
    } finally {
      setTriggeringImport(false);
    }
  };

  // Recover Failed Import Job (M15.4 / M15.5)
  const handleRecoverJob = async (jobId: string) => {
    setRecoveringJobId(jobId);
    try {
      const res = await fetch(`/api/import/${jobId}/recover`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        await loadAllData();
        if (onContentChanged) onContentChanged();
      }
    } catch (e) {
      console.warn("Failed to recover job:", e);
    } finally {
      setRecoveringJobId(null);
    }
  };

  // Export Canonical Corpus (M15.6)
  const handleExportCorpus = async () => {
    try {
      const res = await fetch("/api/admin/export/corpus", { headers: getHeaders() });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sutrasparsh-corpus-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        await loadAllData();
      }
    } catch (e) {
      console.error("Corpus export failed:", e);
    }
  };

  // Save Verse (Create / Edit) (M15.2)
  const handleSaveVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setPublisherFeedback(null);

    const payload = {
      id: formData.id.trim() || undefined,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || undefined,
      body: formData.body.trim(),
      transliteration: formData.transliteration.trim() || undefined,
      meaning: formData.meaning.trim() || undefined,
      commentary: formData.commentary.trim() || undefined,
      audioUrl: formData.audioUrl.trim() || undefined,
      metadata: {
        language: formData.language,
        source: formData.source,
        author: formData.author,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    };

    try {
      let res;
      if (editingVerse) {
        res = await fetch(`/api/admin/content/${editingVerse.id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/content", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (res.ok) {
        setPublisherFeedback({
          type: "success",
          message: editingVerse
            ? "Scripture verse updated successfully!"
            : "New sacred verse published to canonical corpus!",
        });
        setIsCreatingNew(false);
        setEditingVerse(null);
        resetForm();
        await loadAllData();
        if (onContentChanged) onContentChanged();
      } else {
        setPublisherFeedback({
          type: "error",
          message: json.error?.message || "Failed to save scripture.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublisherFeedback({
        type: "error",
        message: `Error: ${msg}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Verse (M15.2)
  const handleDeleteVerse = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete scripture "${id}" from the canonical store?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        await loadAllData();
        if (onContentChanged) onContentChanged();
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const startEdit = (item: ContentItem) => {
    setEditingVerse(item);
    setIsCreatingNew(false);
    setFormData({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || "",
      body: item.body,
      transliteration: item.transliteration || "",
      meaning: item.meaning || "",
      commentary: item.commentary || "",
      audioUrl: item.audioUrl || "",
      language: item.metadata?.language || "sa",
      source: item.metadata?.source || "publisher",
      author: item.metadata?.author || "Bhagavad Gita",
      category: item.metadata?.category || "Karma Yoga",
      tags: (item.metadata?.tags || []).join(", "),
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      subtitle: "",
      body: "",
      transliteration: "",
      meaning: "",
      commentary: "",
      audioUrl: "",
      language: "sa",
      source: "publisher-studio",
      author: "Bhagavad Gita",
      category: "Karma Yoga",
      tags: "yoga, wisdom, scripture",
    });
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    if (logLevelFilter !== "ALL" && log.level !== logLevelFilter) return false;
    if (logCategoryFilter !== "ALL" && log.category !== logCategoryFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.path?.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header & Auth Status */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Phase 10: Administration & Operations</span>
            </div>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
              Operations & Publisher Console
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              Canonical scripture publisher studio, batch ingestion pipeline controls, operational observability telemetry, and immutable audit logs.
            </p>
          </div>

          {/* Auth Status & Quick Key Bar (M15.1) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
            <div className="flex items-center space-x-2 px-2">
              <Key className="w-4 h-4 text-amber-400" />
              <input
                type="password"
                placeholder="Admin API Key..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="bg-transparent text-xs text-amber-200 placeholder:text-stone-600 focus:outline-none w-36 font-mono"
              />
            </div>

            <button
              onClick={() => verifyKey(adminKey)}
              disabled={authChecking}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center space-x-1.5 ${
                isAuthorized
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              }`}
            >
              {isAuthorized ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>{authChecking ? "Verifying..." : "Authorize"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => loadAllData()}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-200 transition-colors"
              title="Refresh all metrics and logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800/80">
          <button
            onClick={() => setAdminTab("publisher")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "publisher"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scripture Publisher Studio (M15.2)</span>
          </button>

          <button
            onClick={() => setAdminTab("pipeline")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "pipeline"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ingestion Pipeline & Recovery (M15.3–M15.5)</span>
          </button>

          <button
            onClick={() => setAdminTab("telemetry")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "telemetry"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Observability & Latency Telemetry (M16)</span>
          </button>

          <button
            onClick={() => setAdminTab("audit")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "audit"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Audit Logs & Corpus Archival (M15.6)</span>
          </button>

          <button
            onClick={() => setAdminTab("hardening")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "hardening"
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardening, Threats & E2E Matrix (Phase 11 / M19)</span>
          </button>

          <button
            onClick={() => setAdminTab("monetization")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              adminTab === "monetization"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-stone-950/60 text-stone-400 border border-stone-800/60 hover:text-stone-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Monetization, Billing & Seva (Phases 16–21)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCRIPTURE PUBLISHER STUDIO (M15.2) */}
      {adminTab === "publisher" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif-sacred text-xl font-bold text-amber-100">
                Canonical Scripture Studio
              </h3>
              <p className="text-xs text-stone-400">
                Author new verses, attach Devanagari Sanskrit mantras, transliterations, commentary, and audios.
              </p>
            </div>

            <button
              onClick={() => {
                setIsCreatingNew(true);
                setEditingVerse(null);
                resetForm();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-medium self-start sm:self-auto transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Author New Scripture</span>
            </button>
          </div>

          {publisherFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                publisherFeedback.type === "success"
                  ? "bg-emerald-950/50 border border-emerald-800 text-emerald-200"
                  : "bg-rose-950/50 border border-rose-800 text-rose-200"
              }`}
            >
              {publisherFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{publisherFeedback.message}</span>
            </div>
          )}

          {/* Publisher Authoring Form (Create or Edit) */}
          {(isCreatingNew || editingVerse) && (
            <form
              onSubmit={handleSaveVerse}
              className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center space-x-2 text-amber-300 font-serif-sacred font-semibold text-base">
                  <Edit3 className="w-4 h-4" />
                  <span>{editingVerse ? `Edit Scripture (${editingVerse.id})` : "Publish New Scripture to Canonical Corpus"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingVerse(null);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Scripture Title / Reference *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhagavad Gita 2.47 or Isha Upanishad 1"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Theme / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Law of Selfless Action"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                {/* Author / Tradition */}
                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Tradition / Source
                  </label>
                  <select
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  >
                    <option value="Bhagavad Gita">Bhagavad Gita</option>
                    <option value="Patanjali">Patanjali (Yoga Sutras)</option>
                    <option value="Upanishads">Upanishads</option>
                    <option value="Vedas">Vedas</option>
                    <option value="Adi Shankara">Adi Shankara</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Spiritual Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  >
                    <option value="Karma Yoga">Karma Yoga</option>
                    <option value="Raja Yoga">Raja Yoga</option>
                    <option value="Mind & Meditation">Mind & Meditation</option>
                    <option value="Jnana / Vedanta">Jnana / Vedanta</option>
                    <option value="Vedic Chants">Vedic Chants</option>
                  </select>
                </div>
              </div>

              {/* Sanskrit Body (Devanagari) */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  Original Sacred Verse (Devanagari Sanskrit) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm font-serif-devanagari text-amber-200 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              {/* Transliteration */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  IAST Transliteration
                </label>
                <textarea
                  rows={2}
                  placeholder="karmaṇy-evādhikāras te mā phaleṣu kadācana..."
                  value={formData.transliteration}
                  onChange={(e) => setFormData({ ...formData, transliteration: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs italic text-stone-300 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              {/* Meaning */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  English Translation / Meaning
                </label>
                <textarea
                  rows={3}
                  placeholder="You have a right only to perform your duties, but you are never entitled to the fruits..."
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              {/* Commentary */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  Philosophical Commentary & Practical Guidance
                </label>
                <textarea
                  rows={3}
                  placeholder="Lord Krishna explains the nature of selfless work and detachment..."
                  value={formData.commentary}
                  onChange={(e) => setFormData({ ...formData, commentary: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-300 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              {/* Audio URL & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Chant Audio URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 font-medium mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="karma, duty, peace, yoga"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-500/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingVerse(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-bold transition-colors"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingVerse ? "Save Changes" : "Publish to Corpus"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Current Published Scripture List */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-400">
                Canonical Verses Repository ({publishedVerses.length} total)
              </span>
            </div>

            <div className="divide-y divide-stone-800/80 max-h-[600px] overflow-y-auto">
              {publishedVerses.map((item) => (
                <div
                  key={item.id}
                  className="p-5 hover:bg-stone-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {item.metadata?.category || "General"}
                      </span>
                      <span className="text-xs font-serif-sacred font-bold text-amber-200">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-stone-400">
                          • {item.subtitle}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-serif-devanagari text-amber-100/90 line-clamp-1">
                      {item.body}
                    </p>

                    <p className="text-xs text-stone-400 line-clamp-1">
                      {item.meaning}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-amber-200 hover:border-amber-500/40 transition-colors text-xs flex items-center space-x-1"
                      title="Edit scripture"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteVerse(item.id)}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-rose-400 hover:bg-rose-950/40 transition-colors text-xs flex items-center space-x-1"
                      title="Delete scripture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INGESTION PIPELINE & RECOVERY (M15.3 - M15.5) */}
      {adminTab === "pipeline" && (
        <div className="space-y-6">
          {/* Pipeline Trigger Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100">
                  Batch Ingestion Pipeline Controls (M15.3)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Execute schema normalizers, canonical validators, and atomic batch syncs to Firestore.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value as "json" | "manual")}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="json">Source: JSON Static Dataset</option>
                  <option value="manual">Source: Manual Ingestion</option>
                </select>

                <button
                  onClick={handleTriggerImport}
                  disabled={triggeringImport}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors text-xs"
                >
                  <Play className={`w-3.5 h-3.5 ${triggeringImport ? "animate-spin" : ""}`} />
                  <span>{triggeringImport ? "Ingesting..." : "Trigger Ingestion Pipeline"}</span>
                </button>
              </div>
            </div>

            {pipelineFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{pipelineFeedback}</span>
              </div>
            )}
          </div>

          {/* Ingestion Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Total Jobs Ingested</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-200 font-serif-sacred">
                {importStats.total}
              </div>
              <p className="text-[11px] text-stone-500">Atomic 20-verse batches</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Successfully Ingested</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300 font-serif-sacred">
                {importStats.completed}
              </div>
              <p className="text-[11px] text-stone-500">Schema validated & normalized</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Failed Jobs</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-300 font-serif-sacred">
                {importStats.failed}
              </div>
              <p className="text-[11px] text-stone-500">Recoverable via state engine</p>
            </div>
          </div>

          {/* Job History & Recovery Table (M15.4 / M15.5) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-sm font-serif-sacred font-bold text-amber-200">
                Pipeline Execution Audit Trail & Recovery Matrix
              </h4>
              <span className="text-xs text-stone-500">Auto-synced</span>
            </div>

            <div className="divide-y divide-stone-800/80 overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/60 text-stone-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Job ID</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Processed</th>
                    <th className="px-5 py-3">Started</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {importHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-500">
                        No previous ingestion runs recorded. Click "Trigger Ingestion Pipeline" to run.
                      </td>
                    </tr>
                  ) : (
                    importHistory.map((job) => (
                      <tr key={job.jobId} className="hover:bg-stone-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-amber-200">
                          {job.jobId}
                        </td>
                        <td className="px-5 py-3.5 uppercase font-semibold text-[11px] text-stone-400">
                          {job.source}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              job.status === "completed"
                                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                                : job.status === "failed"
                                ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
                                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                            }`}
                          >
                            <span>{job.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-emerald-400 font-medium">{job.succeeded || 0}</span>
                          <span className="text-stone-600"> / </span>
                          <span className="text-stone-300">{job.total || 0}</span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-400 text-[11px]">
                          {new Date(job.startedAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {job.status === "failed" && (
                            <button
                              onClick={() => handleRecoverJob(job.jobId)}
                              disabled={recoveringJobId === job.jobId}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 text-[11px] font-medium transition-colors inline-flex items-center space-x-1"
                            >
                              <RotateCcw className={`w-3 h-3 ${recoveringJobId === job.jobId ? "animate-spin" : ""}`} />
                              <span>Recover Job</span>
                            </button>
                          )}
                          {job.status === "completed" && (
                            <span className="text-emerald-500/80 text-[11px]">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OBSERVABILITY & LATENCY TELEMETRY (M16) */}
      {adminTab === "telemetry" && (
        <div className="space-y-6">
          {/* Subsystem Health Cards (M16.5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>API Server Engine</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-300 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Port {health?.subsystems?.apiServer?.port || 3000}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Uptime: {metrics?.uptimeSeconds ? `${Math.floor(metrics.uptimeSeconds / 60)}m ${metrics.uptimeSeconds % 60}s` : "Online"}
              </p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Average API Latency</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-200 font-serif-sacred">
                {metrics?.averageLatencyMs || 0} ms
              </div>
              <p className="text-[11px] text-stone-500">p50 / p95 response tracker</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Memory Footprint (Heap)</span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-sky-200 font-serif-sacred">
                {metrics?.memoryUsageMb?.heapUsed || 0} MB
              </div>
              <p className="text-[11px] text-stone-500">
                Total: {metrics?.memoryUsageMb?.heapTotal || 0} MB
              </p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Recent Error Rate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-2xl font-bold font-serif-sacred ${metrics?.recentErrorCount ? "text-rose-300" : "text-emerald-300"}`}>
                {metrics?.recentErrorCount || 0}
              </div>
              <p className="text-[11px] text-stone-500">Errors in last 5 minutes</p>
            </div>
          </div>

          {/* Latency Breakdown by Route (M16.4) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-sm font-serif-sacred font-bold text-amber-200">
                Endpoint Performance Matrix & p95 Latency Profiler (M16.4)
              </h4>
              <span className="text-xs text-stone-500">Real-time HTTP Profiler</span>
            </div>

            <div className="divide-y divide-stone-800/80 overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/60 text-stone-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Endpoint Route</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Requests</th>
                    <th className="px-5 py-3">Avg Latency</th>
                    <th className="px-5 py-3">p95 Latency</th>
                    <th className="px-5 py-3">Min / Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-mono text-[11px]">
                  {!metrics?.endpointLatencies || Object.keys(metrics.endpointLatencies).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-stone-500">
                        Gathering HTTP performance profiles...
                      </td>
                    </tr>
                  ) : (
                    Object.values(metrics.endpointLatencies).map((item) => (
                      <tr key={`${item.method}-${item.path}`} className="hover:bg-stone-800/30">
                        <td className="px-5 py-3 text-stone-200">{item.path}</td>
                        <td className="px-5 py-3 font-semibold text-amber-300">{item.method}</td>
                        <td className="px-5 py-3 text-stone-300">{item.count}</td>
                        <td className="px-5 py-3 text-emerald-400">{item.avgMs} ms</td>
                        <td className="px-5 py-3 text-amber-400">{item.p95Ms} ms</td>
                        <td className="px-5 py-3 text-stone-400">
                          {Math.round(item.minMs)}ms / {Math.round(item.maxMs)}ms
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Application Log Stream (M16.1) */}
          <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div className="flex items-center space-x-2 text-amber-300 font-serif-sacred font-semibold text-sm">
                <Terminal className="w-4 h-4" />
                <span>Live Application Log Stream (M16.1)</span>
              </div>

              {/* Log Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs">
                  <Search className="w-3.5 h-3.5 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="bg-transparent text-stone-200 placeholder:text-stone-600 focus:outline-none w-28 text-xs"
                  />
                </div>

                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="ALL">Level: ALL</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="DEBUG">DEBUG</option>
                </select>

                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="ALL">Category: ALL</option>
                  <option value="HTTP">HTTP</option>
                  <option value="IMPORTER">IMPORTER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SYSTEM">SYSTEM</option>
                </select>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="font-mono text-xs max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
              {filteredLogs.length === 0 ? (
                <div className="text-stone-600 text-center py-6">No matching logs found.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-900"
                  >
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-[10px] text-stone-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.level === "ERROR"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : log.level === "WARN"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-stone-800 text-stone-300"
                        }`}
                      >
                        {log.level}
                      </span>

                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-800 text-stone-400">
                        {log.category}
                      </span>

                      <span className="text-stone-200 break-all">{log.message}</span>
                    </div>

                    {log.durationMs !== undefined && (
                      <span className="text-[10px] text-stone-500 self-end sm:self-auto shrink-0 font-mono">
                        {log.durationMs}ms
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & CORPUS ARCHIVAL (M15.6) */}
      {adminTab === "audit" && (
        <div className="space-y-6">
          {/* Export Corpus Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100">
                  Canonical Corpus Archival & JSON Export (M15.6)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Generate sanitized, verified full-text corpus JSON bundles for backup, disaster recovery, and offline distribution.
                </p>
              </div>

              <button
                onClick={handleExportCorpus}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Canonical Corpus JSON</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table (M15.6) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-sm font-serif-sacred font-bold text-amber-200">
                Immutable Administrative Activity Audit Trail
              </h4>
              <span className="text-xs text-stone-500">Security & Integrity Monitored</span>
            </div>

            <div className="divide-y divide-stone-800/80 overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/60 text-stone-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Target Reference</th>
                    <th className="px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-stone-500">
                        No administrative operations logged yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/30">
                        <td className="px-5 py-3.5 text-stone-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-300 font-sans">{log.actor}</td>
                        <td className="px-5 py-3.5 text-amber-200">{log.targetId || "-"}</td>
                        <td className="px-5 py-3.5 text-stone-400 font-sans max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTION HARDENING, SECURITY THREATS & E2E MATRIX (M17, M18, M19) */}
      {adminTab === "hardening" && (
        <ProductionHardeningPanel adminKey={adminKey} />
      )}

      {/* TAB 6: MONETIZATION, BILLING & SEVA ANALYTICS (PHASES 16–21) */}
      {adminTab === "monetization" && (
        <MonetizationAdminConsole />
      )}
    </div>
  );
};
