import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Crown,
  Shield,
  Award,
  Clock,
  MoreVertical,
  CheckCircle2,
  Lock,
  UserCheck,
  Mail,
  Zap,
} from "lucide-react";
import type { UserManagementRecord } from "../../types/admin";
import { adminAuthService } from "../../services/admin-auth.service";

const SEED_USERS: UserManagementRecord[] = [
  {
    id: "usr-101",
    displayName: "Anand Vardhan",
    email: "anand.v@gmail.com",
    tier: "RISHI",
    subscriptionStatus: "ACTIVE",
    joinedDate: "2026-06-12",
    lastActive: "10 mins ago",
    totalChantsCompleted: 142,
    isScholarship: false,
    notes: "Patron subscriber. Active daily meditator.",
  },
  {
    id: "usr-102",
    displayName: "Prof. Raghavan Shastri",
    email: "raghavan.shastri@bhu.ac.in",
    tier: "RISHI",
    subscriptionStatus: "ACTIVE",
    joinedDate: "2026-07-01",
    lastActive: "1 hour ago",
    totalChantsCompleted: 490,
    isScholarship: true,
    notes: "Complimentary Sanskrit Department scholarship grant.",
  },
  {
    id: "usr-103",
    displayName: "Kavita Nair",
    email: "kavita.nair@outlook.com",
    tier: "SADHAKA",
    subscriptionStatus: "ACTIVE",
    joinedDate: "2026-08-15",
    lastActive: "Yesterday",
    totalChantsCompleted: 38,
    isScholarship: false,
  },
  {
    id: "usr-104",
    displayName: "Devendra Patel",
    email: "dev.patel@gmail.com",
    tier: "FREE",
    subscriptionStatus: "NONE",
    joinedDate: "2026-08-20",
    lastActive: "3 days ago",
    totalChantsCompleted: 12,
    isScholarship: false,
  },
];

export const UsersView: React.FC = () => {
  const [usersList, setUsersList] = useState<UserManagementRecord[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const canEdit = adminAuthService.hasPermission("users", "edit");

  const handleGrantScholarship = (userId: string) => {
    if (!canEdit) return;
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              tier: "RISHI",
              subscriptionStatus: "ACTIVE",
              isScholarship: true,
              notes: "Complimentary Scholar Pass granted by Admin",
            }
          : u
      )
    );
    adminAuthService.logAudit("users", "GRANT_SCHOLARSHIP", `Granted Rishi scholarship to user ${userId}`, {
      userId,
    });
    setNotification(`Complimentary Rishi tier scholarship granted to user.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpgradeToSadhaka = (userId: string) => {
    if (!canEdit) return;
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              tier: "SADHAKA",
              subscriptionStatus: "ACTIVE",
            }
          : u
      )
    );
    adminAuthService.logAudit("users", "UPGRADE_USER_TIER", `Upgraded user ${userId} to Sādhaka`, {
      userId,
    });
    setNotification(`User upgraded to Sādhaka tier.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "ALL" || u.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="ui-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="ui-badge ui-badge-info mb-1">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span>User Accounts & Entitlements (M42)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Seeker Directory & Access Controls
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage student scholarships, subscriber tiers, support inquiries, and access credentials.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              Total Seekers: <strong className="text-blue-600">4,821</strong>
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="ui-alert ui-alert-info">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="ui-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">Tier:</span>
            {["ALL", "FREE", "SADHAKA", "RISHI"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tierFilter === tier
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="ui-table-container">
        <div className="divide-y divide-slate-100">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold font-mono text-sm shrink-0">
                  {u.displayName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{u.displayName}</span>
                    {u.isScholarship && (
                      <span className="ui-badge ui-badge-info">
                        <Award className="w-3 h-3 mr-1" />
                        <span>Scholar Pass</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        u.tier === "RISHI"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : u.tier === "SADHAKA"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {u.tier}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{u.email}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Joined: {u.joinedDate} • Active: {u.lastActive} • Chants: {u.totalChantsCompleted}
                  </p>
                  {u.notes && <p className="text-[11px] text-blue-700/80 italic">{u.notes}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {canEdit && u.tier === "FREE" && (
                  <button
                    onClick={() => handleUpgradeToSadhaka(u.id)}
                    className="ui-button-secondary py-1 px-3 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    <span>Grant Sādhaka</span>
                  </button>
                )}

                {canEdit && !u.isScholarship && (
                  <button
                    onClick={() => handleGrantScholarship(u.id)}
                    className="ui-button py-1 px-3 text-xs"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    <span>Grant Scholar Pass</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
