import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
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
import { panditService } from "../../services/pandit.service";
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
    id: "services",
    label: "Priests & Services",
    sanskritBadge: "ऋत्विक्",
    icon: UserCheck,
    description: "Purohits, Rituals & Onboarding",
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
    <aside className="admin-sidebar shadow-xs">
      {/* Brand Header */}
      <div className="admin-brand flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs font-sanskrit">
            ॐ
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">SutraSparsh</span>
              <span className="ui-badge ui-badge-info text-[9px]">Admin</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Platform Gateway</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="admin-nav flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span>Admin Domains</span>
          <span className="text-blue-600 font-bold">M39.5</span>
        </div>

        {DOMAIN_NAV_ITEMS.map((item) => {
          const hasAccess = adminAuthService.canAccessDomain(item.id);
          const isSelected = activeDomain === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
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
              className={`admin-nav-item ${isSelected ? "active" : ""} ${
                !hasAccess ? "opacity-40 cursor-not-allowed" : ""
              }`}
              title={
                !hasAccess
                  ? `Access restricted for role '${currentUser.role}'`
                  : item.description
              }
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isSelected
                    ? "text-blue-600"
                    : hasAccess
                    ? "text-slate-500"
                    : "text-slate-300"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="truncate">{item.label}</span>
                  <span className="text-[9px] font-sanskrit text-slate-400">
                    {item.sanskritBadge}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {item.id === "services" && panditService.getPendingApplicationsCount() > 0 && (
                  <span className="ui-badge ui-badge-warning text-[10px]">
                    {panditService.getPendingApplicationsCount()}
                  </span>
                )}
                {!hasAccess ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                ) : isSelected ? (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Operator Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-blue-600 font-mono truncate font-medium">
              {currentUser.role}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="ui-badge ui-badge-success">MFA Verified</span>
          <span className="text-emerald-700 font-medium">● TLS Encrypted</span>
        </div>
      </div>
    </aside>
  );
};
