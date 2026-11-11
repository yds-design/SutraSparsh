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

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "SuperAdmin",
          classes: "bg-purple-100 text-purple-900 border-purple-300 shadow-xs font-bold",
          dot: "bg-purple-600",
        };
      case "CONTENT_ADMIN":
        return {
          label: "Editor",
          classes: "bg-blue-100 text-blue-900 border-blue-300 shadow-xs font-bold",
          dot: "bg-blue-600",
        };
      case "OPERATIONS_ADMIN":
        return {
          label: "OpsAdmin",
          classes: "bg-teal-100 text-teal-900 border-teal-300 shadow-xs font-bold",
          dot: "bg-teal-600",
        };
      case "MONETIZATION_ADMIN":
        return {
          label: "MonetizationAdmin",
          classes: "bg-amber-100 text-amber-950 border-amber-300 shadow-xs font-bold",
          dot: "bg-amber-600",
        };
      default:
        return {
          label: "Viewer",
          classes: "bg-slate-100 text-slate-800 border-slate-300 shadow-xs font-bold",
          dot: "bg-slate-500",
        };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  const handleSelectRole = (role: AdminRole) => {
    adminAuthService.switchAdminRole(role);
    setRoleMenuOpen(false);
    onRoleChanged();
  };

  return (
    <header className="admin-header">
      {/* Left: Environment Marker & Fast Overview */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900 text-sm tracking-wide">
            Platform Gateway
          </span>
          <span className="text-slate-400 font-mono text-xs">•</span>
          <span className="ui-badge ui-badge-success text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 inline-block animate-pulse" />
            PRODUCTION-READY (M38–M46)
          </span>
        </div>
      </div>

      {/* Right Controls: User Name & Role Badge, Role Persona Switcher, Audit Trail Trigger, User App Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* User Identity & Current AdminRole Badge */}
        <div className="flex items-center space-x-2 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">
            {currentUser.name}
          </span>
          <span
            className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs border ${roleBadge.classes}`}
            title={`Current Admin Role: ${currentUser.role}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`} />
            <span>{roleBadge.label}</span>
          </span>
        </div>

        {/* Quick Search Button */}
        <button
          type="button"
          onClick={onOpenQuickSearch}
          className="ui-button-secondary py-1.5 px-3 text-xs"
          title="Quick Search Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs hidden md:inline">Command Palette</span>
          <kbd className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">⌘K</kbd>
        </button>

        {/* RBAC Role Persona Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="ui-button-secondary py-1.5 px-2.5 text-xs flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800 hidden sm:inline">Switch Role</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  RBAC Persona Simulation (M38.5)
                </span>
              </div>
              {ROLES_LIST.map((item) => {
                const isSelected = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRole(item.role)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit Log Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleAuditDrawer}
          className="ui-button-secondary py-1.5 px-2.5 text-xs flex items-center space-x-1.5"
          title="Open Audit Trails & Activity Stream"
        >
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline text-xs">Audit</span>
        </button>

        {/* Switch to Consumer Web App */}
        {onSwitchToUserApp && (
          <button
            type="button"
            onClick={onSwitchToUserApp}
            className="ui-button py-1.5 px-3 text-xs flex items-center space-x-1.5 shadow-xs"
            title="Switch back to SutraSparsh User Experience"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">sutrasparsh.com</span>
            <span className="sm:hidden font-semibold">App</span>
          </button>
        )}
      </div>
    </header>
  );
};
