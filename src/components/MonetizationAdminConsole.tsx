import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  Sparkles,
  ShieldCheck,
  Award,
  RefreshCw,
  Heart,
  Layers,
  Zap,
  Activity,
  Check,
} from "lucide-react";
import type {
  MonetizationAnalyticsSummary,
  ABExperimentConfig,
  DonationRecord,
  UserEntitlementsRecord,
} from "../types/monetization";

export function MonetizationAdminConsole() {
  const [summary, setSummary] = useState<MonetizationAnalyticsSummary | null>(null);
  const [experiments, setExperiments] = useState<ABExperimentConfig[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Override Form
  const [targetUserId, setTargetUserId] = useState("");
  const [overrideReason, setOverrideReason] = useState("Vedic Scholar Scholarship Grant");
  const [overrideDurationDays, setOverrideDurationDays] = useState(365);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/monetization/analytics");
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setExperiments(data.experiments || []);
        setRecentDonations(data.recentDonations || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleGrantOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;

    try {
      const res = await fetch("/api/billing/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          reason: overrideReason,
          durationDays: overrideDurationDays,
          adminName: "Chief_Trustee_Someshwar",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOverrideSuccessMsg(`Granted Patron access to ${targetUserId} for ${overrideDurationDays} days.`);
        setTargetUserId("");
      }
    } catch {
      alert("Override failed");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-stone-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/80 p-6 rounded-2xl border border-amber-500/20">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs uppercase font-bold tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Phases 16–21 • Financial Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-amber-200 mt-1">
            Monetization, Billing & Seva Analytics
          </h2>
          <p className="text-xs text-stone-400">
            Real-time MRR, ARR, conversion funnels, A/B experiments, and ethical financial stewardship.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards (M34.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2 font-mono">
            ₹{summary ? summary.mrrInr.toLocaleString() : "0"}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            ARR: ₹{summary ? summary.arrInr.toLocaleString() : "0"} / yr
          </div>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Active Sacred Subscribers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-200 mt-2 font-mono">
            {summary ? summary.activeSubscribers : "0"}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            ARPU: ₹{summary ? summary.arpuInr : "0"} • Churn: {summary ? summary.churnRatePercent : 0}%
          </div>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Conversion Rate</span>
            <Repeat className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-300 mt-2 font-mono">
            {summary ? summary.conversionRatePercent : "0"}%
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Visitor → Paid Sādhaka Conversion
          </div>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Gurudakshina / Seva</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-300 mt-2 font-mono">
            ₹{summary ? summary.totalDonationsInr.toLocaleString() : "0"}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            From {summary ? summary.donorsCount : 0} Devotees (80G Tax Deductible)
          </div>
        </div>
      </div>

      {/* Conversion Funnel & Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel (M34.2) */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Sacred Conversion Funnel (M34.2)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>1. Monthly Visitors</span>
                <span className="font-bold text-stone-200">{summary?.funnelMetrics.visitors}</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-stone-500 w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>2. Registered Seekers</span>
                <span className="font-bold text-stone-200">{summary?.funnelMetrics.registered} (67%)</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600/80 w-[67%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>3. Paywall / Premium Feature Views</span>
                <span className="font-bold text-stone-200">{summary?.funnelMetrics.paywallImpressions} (26%)</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[26%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>4. Checkout Initiated</span>
                <span className="font-bold text-stone-200">{summary?.funnelMetrics.checkoutInitiated} (9%)</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[9%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>5. Paid Subscriptions & Renewals</span>
                <span className="font-bold text-emerald-400">{summary?.funnelMetrics.checkoutCompleted} (6.5%)</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[6.5%]" />
              </div>
            </div>
          </div>
        </div>

        {/* A/B Pricing & Paywall Experiments (M35) */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Active A/B Pricing Experiments (M35)</span>
          </div>

          <div className="space-y-3 text-xs">
            {experiments.map((exp) => (
              <div key={exp.id} className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200">{exp.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                    {exp.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {exp.variants.map((v) => {
                    const convRate = v.impressions > 0 ? ((v.conversions / v.impressions) * 100).toFixed(1) : "0";
                    return (
                      <div key={v.id} className="p-2 bg-stone-900 rounded-lg border border-stone-800">
                        <div className="font-semibold text-stone-300">{v.name}</div>
                        <div className="text-stone-400 text-[10px]">{v.trafficWeightPercent}% traffic</div>
                        <div className="text-amber-300 font-bold mt-1">
                          {convRate}% Conv ({v.conversions}/{v.impressions})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Entitlement Overrides & Comp Accounts (M28.7) */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Scholarship & Admin Entitlement Overrides (M28.7)</span>
        </div>

        {overrideSuccessMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{overrideSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleGrantOverride} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Target User ID</label>
            <input
              type="text"
              placeholder="e.g. usr_scholar_99"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Grant Reason</label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Duration (Days)</label>
            <input
              type="number"
              value={overrideDurationDays}
              onChange={(e) => setOverrideDurationDays(Number(e.target.value))}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow hover:scale-105 transition-all"
            >
              Grant Patron Access
            </button>
          </div>
        </form>
      </div>

      {/* Recent Seva / Gurudakshina Ledger (M31.5) */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Recent Sacred Gurudakshina & Seva Contributions (M31.5)</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">80G Receipt</th>
                <th className="py-2 px-3">Donor</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Dedication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {recentDonations.map((d) => (
                <tr key={d.id} className="hover:bg-stone-950/40">
                  <td className="py-2.5 px-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-300">{d.receiptNumber}</td>
                  <td className="py-2.5 px-3">{d.isAnonymous ? "Anonymous Seeker" : d.donorName}</td>
                  <td className="py-2.5 px-3">{d.category.replace(/_/g, " ")}</td>
                  <td className="py-2.5 px-3 font-bold text-stone-100">₹{d.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-stone-400 italic">{d.dedicatedTo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
