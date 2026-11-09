import React, { useState, useEffect } from "react";
import type { AdminDomain, AdminRole } from "../types/admin";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { DashboardView } from "./views/DashboardView";
import { ContentView } from "./views/ContentView";
import { ServicesView } from "./views/ServicesView";
import { DataImportsView } from "./views/DataImportsView";
import { UsersView } from "./views/UsersView";
import { JourneyView } from "./views/JourneyView";
import { MonetizationView } from "./views/MonetizationView";
import { OperationsView } from "./views/OperationsView";
import { SettingsView } from "./views/SettingsView";
import { adminAuthService } from "../services/admin-auth.service";
import {
  Activity,
  X,
  Search,
  BookOpen,
  UserCheck,
  Database,
  Users,
  CreditCard,
  Sliders,
  Settings,
  ShieldCheck,
  Key,
} from "lucide-react";

interface SutraSparshAdminAppProps {
  onSwitchToUserApp?: () => void;
}

export const SutraSparshAdminApp: React.FC<SutraSparshAdminAppProps> = ({
  onSwitchToUserApp,
}) => {
  const [activeDomain, setActiveDomain] = useState<AdminDomain>("dashboard");
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [userRoleVersion, setUserRoleVersion] = useState(0);

  // Re-verify domain access when role changes
  const handleRoleChanged = () => {
    setUserRoleVersion((v) => v + 1);
    if (!adminAuthService.canAccessDomain(activeDomain)) {
      setActiveDomain("dashboard");
    }
  };

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsAuditDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const auditLogs = adminAuthService.getAuditTrail();

  const commands = [
    { label: "Go to Dashboard", domain: "dashboard" as AdminDomain, icon: ShieldCheck },
    { label: "Manage Sacred Corpus & Scriptures", domain: "content" as AdminDomain, icon: BookOpen },
    { label: "Manage Vedic Priests & Rituals", domain: "services" as AdminDomain, icon: UserCheck },
    { label: "Run Ingestion Collector Pipeline", domain: "imports" as AdminDomain, icon: Database },
    { label: "Seeker Directory & Scholarships", domain: "users" as AdminDomain, icon: Users },
    { label: "Journey Funnel & Content Intelligence", domain: "journey" as AdminDomain, icon: ShieldCheck },
    { label: "Monetization, Plans & 80G Seva Receipts", domain: "monetization" as AdminDomain, icon: CreditCard },
    { label: "DevOps, SRE Telemetry & QA Matrix", domain: "operations" as AdminDomain, icon: Sliders },
    { label: "Platform Settings & Feature Flags", domain: "settings" as AdminDomain, icon: Settings },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="admin-layout" data-theme="admin">
      {/* Domain Navigation Sidebar */}
      <AdminSidebar
        activeDomain={activeDomain}
        onSelectDomain={(dom) => setActiveDomain(dom)}
      />

      {/* Main Admin Console Body (Header + Dynamic Workspace) */}
      <div className="admin-main">
        {/* Admin Top Navigation Header */}
        <AdminHeader
          onToggleAuditDrawer={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
          onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
          onSwitchToUserApp={onSwitchToUserApp}
          onRoleChanged={handleRoleChanged}
        />

        {/* Dynamic Workspace Container */}
        <main className="admin-content">
          {activeDomain === "dashboard" && (
            <DashboardView onNavigateDomain={(dom) => setActiveDomain(dom)} />
          )}
          {activeDomain === "content" && <ContentView />}
          {activeDomain === "services" && <ServicesView />}
          {activeDomain === "imports" && <DataImportsView />}
          {activeDomain === "users" && <UsersView />}
          {activeDomain === "journey" && <JourneyView />}
          {activeDomain === "monetization" && <MonetizationView />}
          {activeDomain === "operations" && <OperationsView />}
          {activeDomain === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Audit Log Drawer (Slide-out) */}
      {isAuditDrawerOpen && (
        <div className="ui-overlay" onClick={() => setIsAuditDrawerOpen(false)}>
          <div
            className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col space-y-4 animate-slideLeft z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Activity className="w-4 h-4" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Cryptographic Audit Trail (M45.6)
                </h3>
              </div>
              <button
                onClick={() => setIsAuditDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Immutable log of all administrative actions, role persona shifts, and corpus modifications.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((entry) => (
                <div key={entry.id} className="pt-2 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {entry.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span>{entry.actorName}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{entry.actorRole}</span>
                  </div>
                  {Boolean(entry.details?.description) && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {String(entry.details?.description || "")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Command Palette (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div className="ui-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
          <div
            className="ui-modal max-w-lg w-full p-4 space-y-3 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or jump to workspace..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="ui-input pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.domain}
                    onClick={() => {
                      setActiveDomain(cmd.domain);
                      setIsCommandPaletteOpen(false);
                      setCommandQuery("");
                    }}
                    className="admin-nav-item"
                  >
                    <Icon className="w-4 h-4 text-blue-500" />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
