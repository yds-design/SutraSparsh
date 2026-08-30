import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  Users,
  Compass,
  CreditCard,
  Sliders,
  Settings,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { adminAuthService } from "../../services/admin-auth.service";
import type { AdminDomain } from "../../types/admin";

interface AdminSidebarProps {
  activeDomain: AdminDomain;
  onSelectDomain: (domain: AdminDomain) => void;
}

interface DomainNavItem {
  id: AdminDomain;
  label: string;
  sanskritBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badgeCount?: number;
}

const DOMAIN_NAV_ITEMS: DomainNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    sanskritBadge: "केन्द्र",
    icon: LayoutDashboard,
    description: "Executive Command Center & Health",
  },
  {
    id: "content",
    label: "Content",
    sanskritBadge: "ग्रन्थ",
    icon: BookOpen,
    description: "Sacred Corpus, Drafts & Validation",
  },
  {
    id: "imports",
    label: "Import & Data",
    sanskritBadge: "आगम",
    icon: Database,
    description: "Pipelines, Reconciliation & Backup",
  },
  {
    id: "users",
    label: "Users & Access",
    sanskritBadge: "साधक",
    icon: Users,
    description: "User Directory, Tiers & Support",
  },
  {
    id: "journey",
    label: "Journey & Intelligence",
    sanskritBadge: "यात्रा",
    icon: Compass,
    description: "70:30 Funnel, Content Matrix & Rules",
  },
  {
    id: "monetization",
    label: "Monetization & Seva",
    sanskritBadge: "सेवा",
    icon: CreditCard,
    description: "Plans, 80G Receipts & Revenue",
  },
  {
    id: "operations",
    label: "Operations & SRE",
    sanskritBadge: "प्रचालन",
    icon: Sliders,
    description: "Telemetry, Threat Matrix & E2E QA",
  },
  {
    id: "settings",
    label: "Settings",
    sanskritBadge: "व्यवस्था",
    icon: Settings,
    description: "Security Policies & Feature Flags",
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeDomain,
  onSelectDomain,
}) => {
  const currentUser = adminAuthService.getCurrentUser();

  return (
    <aside className="w-64 bg-stone-950 border-r border-stone-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      {/* Navigation Items */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-stone-500 flex items-center justify-between">
          <span>Admin Domains (M39.5)</span>
          <span className="text-amber-400/80 font-bold">7 Major Areas</span>
        </div>

        {DOMAIN_NAV_ITEMS.map((item) => {
          const hasAccess = adminAuthService.canAccessDomain(item.id);
          const isSelected = activeDomain === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (hasAccess) {
                  onSelectDomain(item.id);
                  adminAuthService.logAudit(
                    item.id,
                    "NAVIGATE_DOMAIN",
                    `Navigated to ${item.label} workspace`
                  );
                }
              }}
              disabled={!hasAccess}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                isSelected
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/40 shadow-inner font-semibold"
                  : hasAccess
                  ? "text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent"
                  : "text-stone-600 opacity-50 cursor-not-allowed border border-transparent"
              }`}
              title={
                !hasAccess
                  ? `Access restricted for role '${currentUser.role}'`
                  : item.description
              }
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isSelected
                      ? "text-amber-400"
                      : hasAccess
                      ? "text-stone-400 group-hover:text-amber-400"
                      : "text-stone-700"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span>{item.label}</span>
                    <span className="text-[9px] font-sanskrit text-amber-500/60">
                      {item.sanskritBadge}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-light truncate max-w-[130px]">
                    {item.description}
                  </p>
                </div>
              </div>

              <div>
                {!hasAccess ? (
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                ) : isSelected ? (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Operator Status Footer */}
      <div className="p-4 border-t border-stone-800/80 bg-stone-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold font-mono">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-stone-200 truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-amber-400/90 font-mono truncate">
              {currentUser.role}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>MFA: Verified</span>
          <span className="text-emerald-400">● Encrypted TLS</span>
        </div>
      </div>
    </aside>
  );
};
