import React, { useState } from "react";
import {
  Shield,
  UserCheck,
  ChevronDown,
  Activity,
  Bell,
  Search,
  Key,
  LogOut,
  ExternalLink,
  Lock,
} from "lucide-react";
import { adminAuthService } from "../../services/admin-auth.service";
import type { AdminRole } from "../../types/admin";

interface AdminHeaderProps {
  onToggleAuditDrawer: () => void;
  onOpenQuickSearch: () => void;
  onSwitchToUserApp?: () => void;
  onRoleChanged: () => void;
}

const ROLES_LIST: { role: AdminRole; label: string; desc: string }[] = [
  { role: "SUPER_ADMIN", label: "Super Admin", desc: "Unrestricted platform & security access" },
  { role: "CONTENT_ADMIN", label: "Content Admin", desc: "Corpus editing, approvals & publishing" },
  { role: "IMPORT_ADMIN", label: "Import Admin", desc: "Data ingestion, collectors & reconciliation" },
  { role: "OPERATIONS_ADMIN", label: "Operations Admin", desc: "SRE, telemetry, threats & backups" },
  { role: "MONETIZATION_ADMIN", label: "Monetization Admin", desc: "Subscriptions, billing & 80G seva" },
  { role: "SUPPORT_ADMIN", label: "Support Admin", desc: "User assistance, scholarships & accounts" },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleAuditDrawer,
  onOpenQuickSearch,
  onSwitchToUserApp,
  onRoleChanged,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentUser = adminAuthService.getCurrentUser();

  const handleSelectRole = (role: AdminRole) => {
    adminAuthService.switchAdminRole(role);
    setRoleMenuOpen(false);
    onRoleChanged();
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-950 border-b border-stone-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
      {/* Left: Brand Identity & Environment Marker */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold font-sanskrit text-sm">
            ॐ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-sacred text-base font-bold text-amber-100 tracking-wider">
                SutraSparsh
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Admin Console
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono hidden sm:block">
              admin.sutrasparsh.com • Platform Operations Gateway
            </p>
          </div>
        </div>

        {/* Environment Badge */}
        <div className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PRODUCTION-READY (M38–M46)</span>
        </div>
      </div>

      {/* Right Controls: Role Persona Switcher, Audit Trail Trigger, User App Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Search Button */}
        <button
          onClick={onOpenQuickSearch}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs hover:border-stone-700 transition-colors"
          title="Quick Search Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Command Palette</span>
          <kbd className="text-[9px] bg-stone-950 px-1.5 py-0.5 rounded text-stone-500 font-mono">⌘K</kbd>
        </button>

        {/* RBAC Role Persona Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 text-stone-200 text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-200 hidden sm:inline">{currentUser.role.replace("_", " ")}</span>
            <span className="sm:hidden text-[11px] font-bold text-amber-300">{currentUser.role.split("_")[0]}</span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-1.5 border-b border-stone-800/80 mb-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  RBAC Persona Simulation (M38.5)
                </span>
              </div>
              {ROLES_LIST.map((item) => {
                const isSelected = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => handleSelectRole(item.role)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold"
                        : "text-stone-300 hover:bg-stone-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-stone-500 font-normal">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit Log Drawer Trigger */}
        <button
          onClick={onToggleAuditDrawer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-amber-300 text-xs transition-colors"
          title="Open Audit Trails & Activity Stream"
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline text-[11px]">Audit</span>
        </button>

        {/* Switch to Consumer Web App */}
        {onSwitchToUserApp && (
          <button
            onClick={onSwitchToUserApp}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-all"
            title="Switch back to SutraSparsh User Experience"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">sutrasparsh.com</span>
            <span className="sm:hidden">App</span>
          </button>
        )}
      </div>
    </header>
  );
};
