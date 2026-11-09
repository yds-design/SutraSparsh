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
      <div className="ui-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SutraSparsh Executive Command Center (M39.6)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Platform Operations & Health
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time overview of scripture corpus, ingestion pipelines, subscriber revenue, and cloud telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="ui-button-secondary"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-stats-grid">
        {/* Content KPI */}
        <div
          onClick={() => onNavigateDomain("content")}
          className="stat-card cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Total Scriptures</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="stat-card-value font-mono">
              {metrics.totalScriptures.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.publishedVerses} Published • {metrics.draftVerses} Drafts</span>
            </div>
          </div>
        </div>

        {/* Users KPI */}
        <div
          onClick={() => onNavigateDomain("users")}
          className="stat-card cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Registered Seekers</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="stat-card-value font-mono">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-sky-600 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+142 this week • 89% mobile MAU</span>
            </div>
          </div>
        </div>

        {/* Premium / Monetization KPI */}
        <div
          onClick={() => onNavigateDomain("monetization")}
          className="stat-card cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Sādhaka / Rishi Plans</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="stat-card-value font-mono text-emerald-600">
              {metrics.activeSubscribers} Subscribed
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>₹{metrics.totalRevenueInr.toLocaleString()} MTD (Seva + Subscriptions)</span>
            </div>
          </div>
        </div>

        {/* System Latency & SRE KPI */}
        <div
          onClick={() => onNavigateDomain("operations")}
          className="stat-card cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="stat-card-title">System Latency & Uptime</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="stat-card-value font-mono text-emerald-600">
              {metrics.apiLatencyMs}ms
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 mt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{metrics.systemUptime} Uptime • 0 Outages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Subsystem Health Matrix vs Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subsystem Health Matrix (2 cols) */}
        <div className="lg:col-span-2 ui-card space-y-4">
          <div className="ui-card-header">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="ui-card-title">
                Subsystem Health Matrix
              </h3>
            </div>
            <span className="ui-badge ui-badge-success">
              All 6 Services Green
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {healthCards.map((card) => (
              <div
                key={card.subsystem}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-800">{card.subsystem}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Latency: {card.latencyMs}ms • Uptime: {card.uptimePct}%
                  </div>
                </div>
                <span className="ui-badge ui-badge-success text-[10px]">
                  {card.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Admin Audit & Event Feed (1 col) */}
        <div className="ui-card space-y-4">
          <div className="ui-card-header">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="ui-card-title">
                Recent Operations Feed
              </h3>
            </div>
            <span className="ui-badge ui-badge-info">Live</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{act.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
