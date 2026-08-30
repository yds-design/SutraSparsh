import React, { useState } from "react";
import {
  Settings,
  Shield,
  Key,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { PlatformFeatureFlag } from "../../types/admin";
import { adminAuthService } from "../../services/admin-auth.service";

const INITIAL_FLAGS: PlatformFeatureFlag[] = [
  {
    id: "flag-sanskrit-tts",
    name: "Native Speech Synthesis (TTS Safety Engine)",
    description: "Enables fallback client-side Sanskrit chant pronunciation engine for all users.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["FREE", "SADHAKA", "RISHI"],
  },
  {
    id: "flag-offline-master-chants",
    name: "Offline Master Chanting Audio Cache (IndexedDB)",
    description: "Allows Sādhaka and Rishi subscribers to store full audio tracks offline.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["SADHAKA", "RISHI"],
  },
  {
    id: "flag-80g-instant-receipts",
    name: "Instant 80G Tax Exemption Digital PDF Receipts",
    description: "Automatically generates and cryptographically signs Vedic donation receipts.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["FREE", "SADHAKA", "RISHI"],
  },
  {
    id: "flag-advanced-etymology-lens",
    name: "Paninian Sanskrit Root Etymology & Dhatu Visualizer",
    description: "Deep morphological breakdown of sacred compound words for researchers.",
    enabled: true,
    environment: "ALL",
    targetTiers: ["RISHI"],
  },
];

export const SettingsView: React.FC = () => {
  const [flags, setFlags] = useState<PlatformFeatureFlag[]>(INITIAL_FLAGS);
  const [adminKey, setAdminKey] = useState(adminAuthService.getAdminKey());
  const [notification, setNotification] = useState<string | null>(null);

  const canEdit = adminAuthService.hasPermission("settings", "edit");

  const handleToggleFlag = (id: string) => {
    if (!canEdit) return;
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
    const target = flags.find((f) => f.id === id);
    adminAuthService.logAudit(
      "settings",
      "TOGGLE_FEATURE_FLAG",
      `Toggled feature flag '${id}' to ${!target?.enabled}`,
      { flagId: id, newState: !target?.enabled }
    );
    setNotification(`Feature flag '${target?.name}' updated.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    adminAuthService.setAdminKey(adminKey);
    adminAuthService.logAudit("settings", "ROTATE_ADMIN_KEY", "Rotated local operator Admin Key credentials");
    setNotification("Admin Security Key updated for current session.");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Configuration & Security (M45)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Settings & Feature Flags
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Configure system-wide feature flags, security policies, secret keys, and deployment parameters.
          </p>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Feature Flags */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
              Global Platform Feature Flags
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">Live Evaluation</span>
        </div>

        <div className="divide-y divide-stone-800/60">
          {flags.map((flag) => (
            <div key={flag.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-stone-200">{flag.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
                    {flag.environment}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">{flag.description}</p>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-[10px] text-stone-500 font-mono">Tiers:</span>
                  {flag.targetTiers.map((t) => (
                    <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.id)}
                disabled={!canEdit}
                className={`p-2 rounded-xl transition-all ${
                  flag.enabled
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-stone-600 hover:text-stone-400"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                title={flag.enabled ? "Disable Flag" : "Enable Flag"}
              >
                {flag.enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-stone-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Admin Credentials */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 shadow space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-800/80 pb-3">
          <Key className="w-4 h-4 text-amber-400" />
          <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
            Admin API Security Key (X-Admin-Key)
          </h3>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3 max-w-lg">
          <div>
            <label className="text-[11px] font-mono text-stone-400 block mb-1">
              Active Security Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-500/60"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Update Active Session Key
          </button>
        </form>
      </div>
    </div>
  );
};
