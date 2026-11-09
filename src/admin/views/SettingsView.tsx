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
  Zap,
  Heart,
  AlertTriangle,
} from "lucide-react";
import type { PlatformFeatureFlag } from "../../types/admin";
import { adminAuthService } from "../../services/admin-auth.service";
import { featureFlagsService, useFeatureFlags } from "../../services/feature-flags.service";

export const SettingsView: React.FC = () => {
  const {
    flags,
    isSadhakaEnabled,
    isGurudakshinaEnabled,
    setFlag,
    resetToPhase1Defaults,
    activatePhase2Monetization,
  } = useFeatureFlags();
  const [adminKey, setAdminKey] = useState(adminAuthService.getAdminKey());
  const [notification, setNotification] = useState<string | null>(null);

  const canEdit = adminAuthService.hasPermission("settings", "edit");

  const handleToggleFlag = (id: string) => {
    if (!canEdit) return;
    const target = flags.find((f) => f.id === id);
    if (!target) return;
    const nextState = !target.enabled;
    setFlag(id, nextState);
    setNotification(`Feature '${target.name}' is now ${nextState ? "ENABLED" : "DISABLED"}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handlePhase2BulkToggle = (activate: boolean) => {
    if (!canEdit) return;
    if (activate) {
      activatePhase2Monetization();
      setNotification("Phase 2 Monetization & Memberships ACTIVATED across all devices.");
    } else {
      resetToPhase1Defaults();
      setNotification("Sādhaka Access and Gurudakshina LOCKED to Phase 1 (Disabled on all devices).");
    }
    setTimeout(() => setNotification(null), 4000);
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
      <div className="ui-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="ui-badge ui-badge-info mb-1">
              <Settings className="w-3.5 h-3.5 mr-1" />
              <span>Platform Configuration & Security (Phase 1 & Phase 2 Gate)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Settings & Feature Flags
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Configure system-wide feature flags, Phase 2 release gates, secret keys, and client device access controls.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="ui-alert ui-alert-info">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* PHASE 2 ACTIVATION CONTROLS (Sādhaka Access & Gurudakshina) */}
      <div className="ui-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-mono text-xs uppercase font-bold tracking-wider">
                Phase 2 Monetization & Entitlements Gate
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  !isSadhakaEnabled && !isGurudakshinaEnabled
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {!isSadhakaEnabled && !isGurudakshinaEnabled
                  ? "Phase 1 Lockdown Active (Disabled on all devices)"
                  : "Phase 2 Active"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Sādhaka Access & Gurudakshina Activation
            </h2>
            <p className="text-slate-500 text-xs max-w-2xl leading-relaxed">
              Per Phase 1 governance, Sādhaka Access and Gurudakshina portals are disabled across all client devices by default. Authorized administrators can activate either or both features below when launching Phase 2.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePhase2BulkToggle(false)}
              disabled={!canEdit}
              className="ui-button-secondary py-1.5 px-3 text-xs"
              title="Disable both Sādhaka and Gurudakshina across all devices"
            >
              Lock to Phase 1 (Disable Both)
            </button>
            <button
              type="button"
              onClick={() => handlePhase2BulkToggle(true)}
              disabled={!canEdit}
              className="ui-button py-1.5 px-3 text-xs"
              title="Activate both for Phase 2"
            >
              Activate Phase 2 Both
            </button>
          </div>
        </div>

        {/* 2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Card 1: Sādhaka Access */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isSadhakaEnabled
                ? "bg-amber-950/20 border-amber-500/50 shadow-md"
                : "bg-stone-950/60 border-stone-800/80 opacity-90"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-stone-100">
                    Sādhaka Sacred Membership
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Controls visibility of Sādhaka header button, quick access portal 8, membership upgrade cards in More view, and pricing modal triggers across all devices.
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-stone-500">Live Status:</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSadhakaEnabled
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-stone-900 text-stone-400 border border-stone-800"
                    }`}
                  >
                    {isSadhakaEnabled ? "ENABLED (Phase 2 Active)" : "DISABLED (Phase 1 Default)"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag("flag-sadhaka-access")}
                disabled={!canEdit}
                className={`p-1.5 rounded-xl transition-all ${
                  isSadhakaEnabled
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-stone-600 hover:text-stone-400"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={isSadhakaEnabled ? "Click to Disable Sādhaka Access" : "Click to Activate Sādhaka Access"}
              >
                {isSadhakaEnabled ? (
                  <ToggleRight className="w-9 h-9 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-stone-600" />
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Gurudakshina & Seva */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isGurudakshinaEnabled
                ? "bg-rose-950/20 border-rose-500/50 shadow-md"
                : "bg-stone-950/60 border-stone-800/80 opacity-90"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-stone-100">
                    Sacred Gurudakshina & Seva (80G)
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Controls visibility of Gurudakshina heart icon in header, quick access portal 7, Seva card in More view, and donation modal triggers across all devices.
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-stone-500">Live Status:</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isGurudakshinaEnabled
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-stone-900 text-stone-400 border border-stone-800"
                    }`}
                  >
                    {isGurudakshinaEnabled ? "ENABLED (Phase 2 Active)" : "DISABLED (Phase 1 Default)"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag("flag-gurudakshina")}
                disabled={!canEdit}
                className={`p-1.5 rounded-xl transition-all ${
                  isGurudakshinaEnabled
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-stone-600 hover:text-stone-400"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={isGurudakshinaEnabled ? "Click to Disable Gurudakshina" : "Click to Activate Gurudakshina"}
              >
                {isGurudakshinaEnabled ? (
                  <ToggleRight className="w-9 h-9 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-stone-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="ui-card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              All Platform Feature Flags
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Real-Time Evaluation Engine</span>
        </div>

        <div className="divide-y divide-slate-100">
          {flags.map((flag) => (
            <div key={flag.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">{flag.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {flag.environment}
                  </span>
                  {flag.id.includes("phase") || flag.id === "flag-sadhaka-access" || flag.id === "flag-gurudakshina" ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Phase 2
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500">{flag.description}</p>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">Tiers:</span>
                  {flag.targetTiers.map((t) => (
                    <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.id)}
                disabled={!canEdit}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  flag.enabled
                    ? "text-emerald-500 hover:text-emerald-600"
                    : "text-slate-300 hover:text-slate-500"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                title={flag.enabled ? "Disable Flag" : "Enable Flag"}
              >
                {flag.enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Admin Credentials */}
      <div className="ui-card">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          <Key className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Admin API Security Key (X-Admin-Key)
          </h3>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3 max-w-lg mt-3">
          <div>
            <label className="text-[11px] font-mono text-slate-600 block mb-1">
              Active Security Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="ui-input font-mono"
            />
          </div>
          <button
            type="submit"
            className="ui-button"
          >
            Update Active Session Key
          </button>
        </form>
      </div>
    </div>
  );
};
