import React, { useState } from "react";
import {
  Compass,
  TrendingUp,
  Flame,
  BookOpen,
  Share2,
  Bookmark,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  BarChart3,
  Layers,
  Network,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { adminAuthService } from "../../services/admin-auth.service";

export const JourneyView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"funnel" | "content-performance" | "personalization">("funnel");
  const [notification, setNotification] = useState<string | null>(null);

  // Mock Funnel Data based on 70:30 strategy (Visitors -> First Value -> Habit -> Monetization -> Advocacy)
  const funnelStages = [
    { stage: "1. Discover & Arrive", count: "12,450", subtext: "Unique Visitors", conversion: "100%", color: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
    { stage: "2. First Value (Aha Moment)", count: "9,840", subtext: "Read Sanskrit + Meaning", conversion: "79.0%", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
    { stage: "3. Deepen & Reflect", count: "6,210", subtext: "Listened / Saved / Journaled", conversion: "63.1%", color: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
    { stage: "4. Return & Habit (7d+)", count: "3,750", subtext: "Active Sādhana Streaks", conversion: "60.4%", color: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
    { stage: "5. Personalization Activated", count: "2,480", subtext: "Continue Reading & History", conversion: "66.1%", color: "border-purple-500/40 bg-purple-500/10 text-purple-300" },
    { stage: "6. Monetization (Sādhaka / Seva)", count: "742", subtext: "Subscribers & Donors", conversion: "29.9%", color: "border-rose-500/40 bg-rose-500/10 text-rose-300" },
    { stage: "7. Organic Advocacy Loop", count: "418", subtext: "Wisdom Cards Shared", conversion: "56.3%", color: "border-teal-500/40 bg-teal-500/10 text-teal-300" },
  ];

  const topPerformingVerses = [
    { id: "gita-2-47", title: "Bhagavad Gita 2.47", sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन...", reads: 4890, bookmarks: 1240, shares: 380, avgTime: "2m 45s", tradition: "Gita" },
    { id: "yoga-sutra-1-2", title: "Patanjali Yoga Sutra 1.2", sanskrit: "योगश्चित्तवृत्तिनिरोधः", reads: 3720, bookmarks: 980, shares: 290, avgTime: "3m 10s", tradition: "Raja Yoga" },
    { id: "gita-6-5", title: "Bhagavad Gita 6.5", sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्...", reads: 2910, bookmarks: 760, shares: 210, avgTime: "2m 15s", tradition: "Gita" },
    { id: "katha-1-2-2", title: "Katha Upanishad 1.2.2", sanskrit: "श्रेयश्च प्रेयश्च मनुष्यमेतः...", reads: 1840, bookmarks: 430, shares: 140, avgTime: "3m 40s", tradition: "Upanishad" },
    { id: "isha-1", title: "Isha Upanishad 1", sanskrit: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्...", reads: 1650, bookmarks: 390, shares: 115, avgTime: "2m 50s", tradition: "Upanishad" },
  ];

  const underperformingVerses = [
    { id: "rig-10-129-1", title: "Nasadiya Sukta 10.129.1", issue: "Zero searches, high bounce rate", suggestion: "Add introductory philosophical context & guided audio." },
    { id: "gita-1-1", title: "Bhagavad Gita 1.1", issue: "Low bookmarking despite high views", suggestion: "Connect directly to the psychological dilemma of Arjuna." },
    { id: "mandukya-7", title: "Mandukya Upanishad 7", issue: "Missing word-by-word Sanskrit etymology", suggestion: "Add Devanagari dictionary breakdown for Turiya concept." },
  ];

  const knowledgeGraphTopics = [
    {
      topic: "Dharma (Right Action & Duty)",
      traditionCount: 4,
      connections: ["Bhagavad Gita 2.47", "Karma Yoga", "Nishkama Karma", "Mahabharata Context", "Selfless Service"],
      dailyWeight: 0.85,
    },
    {
      topic: "Chitta Vritti (Stillness & Mind Mastery)",
      traditionCount: 3,
      connections: ["Patanjali 1.2", "Raja Yoga", "Abhyasa & Vairagya", "Meditation Postures", "Pranayama"],
      dailyWeight: 0.90,
    },
    {
      topic: "Moksha & Atman (Self-Realization)",
      traditionCount: 5,
      connections: ["Katha Upanishad", "Isha Upanishad", "Jnana Yoga", "Non-duality (Advaita)", "Tat Tvam Asi"],
      dailyWeight: 0.75,
    },
    {
      topic: "Bhakti & Surrender (Sharanagati)",
      traditionCount: 3,
      connections: ["Bhagavad Gita 9.22", "Bhagavad Gita 18.66", "Devotional Chanting", "Grace (Kripa)"],
      dailyWeight: 0.70,
    },
  ];

  const handleUpdateTopicRule = (topic: string) => {
    adminAuthService.logAudit("journey", "UPDATE_KNOWLEDGE_RULE", `Updated recommendation weight for topic: ${topic}`);
    setNotification(`Knowledge Graph & Recommendation weights updated for "${topic}".`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>70% Spiritual UX / 30% Business Intelligence (M15.11 - M15.13)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Journey & Product Intelligence
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Monitor the canonical user journey: Discover → Arrive → Experience → Reflect → Habit → Personalization → Value Recognition → Advocacy.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveSubTab("funnel")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeSubTab === "funnel"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Journey Funnel
          </button>
          <button
            onClick={() => setActiveSubTab("content-performance")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeSubTab === "content-performance"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Content Performance
          </button>
          <button
            onClick={() => setActiveSubTab("personalization")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeSubTab === "personalization"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Knowledge & Rules
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sub-View 1: Journey Funnel Telemetry */}
      {activeSubTab === "funnel" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Principle Banner */}
          <div className="bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/30 p-6 rounded-3xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-serif-sacred font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The 70:30 Experience Principle</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Monetization appears naturally as a consequence of accumulated spiritual value and habit—never as an interruption to the arrival experience.
              Target KPI Hierarchy: <strong>Value → Habit → Retention → Monetization → Advocacy</strong>.
            </p>
          </div>

          {/* Funnel Flow Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {funnelStages.map((st, idx) => (
              <div
                key={st.stage}
                className={`p-5 rounded-3xl border ${st.color} space-y-3 relative overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80 mb-1">
                    <span>Stage {idx + 1}</span>
                    <span className="font-bold">{st.conversion} conversion</span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-100">{st.stage}</h4>
                  <p className="text-xs opacity-75 mt-0.5">{st.subtext}</p>
                </div>
                <div className="pt-3 border-t border-current/20 flex items-baseline justify-between">
                  <span className="font-mono text-xl font-bold text-stone-100">{st.count}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">Seekers</span>
                </div>
              </div>
            ))}
          </div>

          {/* Habit Formation Signals */}
          <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                  Active Habit Signals & Retention Indicators
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">Retention Health: 94.2%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <span className="text-stone-400 font-semibold block">7-Day Sādhana Streaks</span>
                <span className="font-mono text-2xl font-bold text-amber-300">1,890</span>
                <p className="text-stone-500 text-[11px]">Seekers returning daily for consecutive week</p>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <span className="text-stone-400 font-semibold block">Contemplation Notes Logged</span>
                <span className="font-mono text-2xl font-bold text-amber-300">4,620</span>
                <p className="text-stone-500 text-[11px]">Personal reflection entries saved to user journals</p>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <span className="text-stone-400 font-semibold block">Natural Upgrade Triggers</span>
                <span className="font-mono text-2xl font-bold text-emerald-300">32.4%</span>
                <p className="text-stone-500 text-[11px]">Monetization conversion after 14 days active practice</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: Content Performance */}
      {activeSubTab === "content-performance" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Performing Scriptures */}
          <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                  Most Engaged Scriptures & Shlokas (M15.12)
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">Live 30-Day Window</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-500 border-b border-stone-800/60 pb-2">
                    <th className="py-2.5 font-medium">Scripture / Ref</th>
                    <th className="py-2.5 font-medium">Devanagari Excerpt</th>
                    <th className="py-2.5 font-medium">Tradition</th>
                    <th className="py-2.5 font-medium text-right">Reads</th>
                    <th className="py-2.5 font-medium text-right">Saved</th>
                    <th className="py-2.5 font-medium text-right">Shared</th>
                    <th className="py-2.5 font-medium text-right">Avg Contemplation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/40 text-stone-300">
                  {topPerformingVerses.map((v) => (
                    <tr key={v.id} className="hover:bg-stone-900/80 transition-colors">
                      <td className="py-3 font-semibold text-amber-200">{v.title}</td>
                      <td className="py-3 font-sanskrit text-stone-300 max-w-xs truncate">{v.sanskrit}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                          {v.tradition}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono">{v.reads.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono text-amber-400">{v.bookmarks}</td>
                      <td className="py-3 text-right font-mono text-sky-400">{v.shares}</td>
                      <td className="py-3 text-right font-mono text-stone-400">{v.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Underperforming Verses Audit */}
          <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-800/80 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                Editorial Gap & Content Opportunity Audit
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {underperformingVerses.map((item) => (
                <div key={item.id} className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200">{item.title}</span>
                    <span className="text-[10px] font-mono text-amber-400/90">ATTENTION</span>
                  </div>
                  <p className="text-[11px] text-stone-400">{item.issue}</p>
                  <p className="text-[11px] text-emerald-400/90 italic pt-1 border-t border-stone-800/60">
                    💡 {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Personalization & Knowledge Graph Rules */}
      {activeSubTab === "personalization" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-purple-400" />
                <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                  Sacred Knowledge Graph & Recommendation Rules (M15.13)
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">Autonomous Graph</span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Admins configure the philosophical taxonomy and thematic clusters; the system uses these mappings to recommend verses dynamically based on user contemplation history.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeGraphTopics.map((kg) => (
                <div key={kg.topic} className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-sacred font-bold text-amber-100 text-sm">
                      {kg.topic}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {kg.traditionCount} Traditions
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {kg.connections.map((c) => (
                      <span key={c} className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-900 text-stone-300 border border-stone-800">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                    <span className="text-stone-500">Daily Rotation Weight: <strong>{kg.dailyWeight}</strong></span>
                    <button
                      onClick={() => handleUpdateTopicRule(kg.topic)}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Update Weight →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
