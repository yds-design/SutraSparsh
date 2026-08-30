import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Database,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { SystemHealthCard } from "../../types/admin";
import { adminApiClient } from "../../services/admin-api.client";

interface DashboardViewProps {
  onNavigateDomain: (domain: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateDomain }) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalScriptures: 1245,
    publishedVerses: 1210,
    draftVerses: 35,
    totalUsers: 4821,
    activeSubscribers: 183,
    totalRevenueInr: 84500,
    activeImports: 0,
    systemUptime: "99.98%",
    apiLatencyMs: 32,
  });

  const healthCards: SystemHealthCard[] = [
    { subsystem: "API Gateway", status: "HEALTHY", latencyMs: 24, uptimePct: 99.99, lastCheck: "Just now" },
    { subsystem: "Firestore Corpus", status: "HEALTHY", latencyMs: 38, uptimePct: 99.95, lastCheck: "Just now" },
    { subsystem: "Importer Pipeline", status: "HEALTHY", latencyMs: 45, uptimePct: 99.90, lastCheck: "2 mins ago" },
    { subsystem: "Search Engine", status: "HEALTHY", latencyMs: 18, uptimePct: 99.99, lastCheck: "Just now" },
    { subsystem: "Billing & Webhooks", status: "HEALTHY", latencyMs: 52, uptimePct: 100.0, lastCheck: "Just now" },
    { subsystem: "Storage & CDN", status: "HEALTHY", latencyMs: 15, uptimePct: 99.98, lastCheck: "5 mins ago" },
  ];

  const recentActivity = [
    { title: "Verse published", detail: "Bhagavad Gita 2.47 marked as verified canonical", time: "10 mins ago", type: "content" },
    { title: "80G Tax Receipt Issued", detail: "₹5,100 Gurudakshina from donor Rajesh K.", time: "24 mins ago", type: "monetization" },
    { title: "Ingestion Pipeline Completed", detail: "Patanjali Yoga Sutras Chapter 1 re-indexed with 0 errors", time: "1 hour ago", type: "import" },
    { title: "Automated Smoke Test Passed", detail: "E2E Master Suite (21 milestones) executed green", time: "3 hours ago", type: "ops" },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await adminApiClient.getMetrics();
      if (res.success && res.data) {
        setMetrics((prev) => ({
          ...prev,
          totalScriptures: res.data.totalScriptures || prev.totalScriptures,
          apiLatencyMs: res.data.avgLatencyMs || prev.apiLatencyMs,
        }));
      }
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SutraSparsh Executive Command Center (M39.6)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Platform Operations & Health
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Real-time overview of scripture corpus, ingestion pipelines, subscriber revenue, and cloud telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content KPI */}
        <div
          onClick={() => onNavigateDomain("content")}
          className="bg-stone-900/50 border border-stone-800 hover:border-amber-500/40 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Scriptures</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-100 font-mono">
              {metrics.totalScriptures.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{metrics.publishedVerses} Published • {metrics.draftVerses} Drafts</span>
            </div>
          </div>
        </div>

        {/* Users KPI */}
        <div
          onClick={() => onNavigateDomain("users")}
          className="bg-stone-900/50 border border-stone-800 hover:border-amber-500/40 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Registered Seekers</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-100 font-mono">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-sky-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+142 this week • 89% mobile MAU</span>
            </div>
          </div>
        </div>

        {/* Premium / Monetization KPI */}
        <div
          onClick={() => onNavigateDomain("monetization")}
          className="bg-stone-900/50 border border-stone-800 hover:border-amber-500/40 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Sādhaka / Rishi Plans</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {metrics.activeSubscribers} Subscribed
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-amber-400/90 mt-1">
              <Flame className="w-3 h-3" />
              <span>₹{metrics.totalRevenueInr.toLocaleString()} MTD (Seva + Subscriptions)</span>
            </div>
          </div>
        </div>

        {/* System Latency & SRE KPI */}
        <div
          onClick={() => onNavigateDomain("operations")}
          className="bg-stone-900/50 border border-stone-800 hover:border-amber-500/40 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">System Latency & Uptime</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics.apiLatencyMs}ms
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{metrics.systemUptime} Uptime • 0 Outages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Subsystem Health Matrix vs Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subsystem Health Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-serif-sacred font-bold text-amber-100 text-sm sm:text-base">
                Subsystem Health Matrix
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              All 6 Services Green
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {healthCards.map((card) => (
              <div
                key={card.subsystem}
                className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-stone-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-stone-200">{card.subsystem}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    Latency: {card.latencyMs}ms • Uptime: {card.uptimePct}%
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded-lg">
                  {card.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Admin Audit & Event Feed (1 col) */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                Recent Operations Feed
              </h3>
            </div>
            <span className="text-[10px] font-mono text-stone-500">Live</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-200">{act.title}</span>
                  <span className="text-[10px] font-mono text-stone-500">{act.time}</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
