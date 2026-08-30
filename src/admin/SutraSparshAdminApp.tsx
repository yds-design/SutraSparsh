import React, { useState, useEffect } from "react";
import type { AdminDomain, AdminRole } from "../types/admin";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { DashboardView } from "./views/DashboardView";
import { ContentView } from "./views/ContentView";
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Admin Top Navigation Header */}
      <AdminHeader
        onToggleAuditDrawer={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
        onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
        onSwitchToUserApp={onSwitchToUserApp}
        onRoleChanged={handleRoleChanged}
      />

      {/* Main Admin Console Body (Sidebar + Domain Workspace) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Domain Navigation Sidebar */}
        <AdminSidebar
          activeDomain={activeDomain}
          onSelectDomain={(dom) => setActiveDomain(dom)}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {activeDomain === "dashboard" && (
            <DashboardView onNavigateDomain={(dom) => setActiveDomain(dom)} />
          )}
          {activeDomain === "content" && <ContentView />}
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
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAuditDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-stone-900 border-l border-stone-800 shadow-2xl p-6 flex flex-col space-y-4 animate-slideLeft z-50">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Activity className="w-4 h-4" />
                <h3 className="font-serif-sacred font-bold text-amber-100 text-sm">
                  Cryptographic Audit Trail (M45.6)
                </h3>
              </div>
              <button
                onClick={() => setIsAuditDrawerOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-stone-400">
              Immutable log of all administrative actions, role persona shifts, and corpus modifications.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 divide-y divide-stone-800/40">
              {auditLogs.map((entry) => (
                <div key={entry.id} className="pt-2 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300">
                      {entry.action}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-stone-400">
                    <span>{entry.actorName}</span>
                    <span>•</span>
                    <span className="text-amber-500/80 font-mono">{entry.actorRole}</span>
                  </div>
                  {Boolean(entry.details?.description) && (
                    <p className="text-[11px] text-stone-400 leading-snug">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-4 shadow-2xl space-y-3 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or jump to workspace..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
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
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-stone-800/80 flex items-center space-x-2.5 text-stone-300 hover:text-amber-200 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
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
