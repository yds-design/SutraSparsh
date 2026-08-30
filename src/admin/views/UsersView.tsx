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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts & Entitlements (M42)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Seeker Directory & Access Controls
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Manage student scholarships, subscriber tiers, support inquiries, and access credentials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-stone-400 bg-stone-950 border border-stone-800 px-3 py-2 rounded-xl">
            Total Seekers: <strong className="text-amber-300">4,821</strong>
          </span>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-5 shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-400 font-medium">Tier:</span>
            {["ALL", "FREE", "SADHAKA", "RISHI"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tierFilter === tier
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                    : "bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="divide-y divide-stone-800/60">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-900/80 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-300 font-bold font-mono text-sm shrink-0">
                  {u.displayName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-stone-200">{u.displayName}</span>
                    {u.isScholarship && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Scholar Pass</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        u.tier === "RISHI"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : u.tier === "SADHAKA"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                          : "bg-stone-950 text-stone-400 border-stone-800"
                      }`}
                    >
                      {u.tier}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400">{u.email}</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Joined: {u.joinedDate} • Active: {u.lastActive} • Chants: {u.totalChantsCompleted}
                  </p>
                  {u.notes && <p className="text-[11px] text-amber-300/80 italic">{u.notes}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {canEdit && u.tier === "FREE" && (
                  <button
                    onClick={() => handleUpgradeToSadhaka(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-sky-950/40 text-sky-300 border border-sky-800/60 hover:bg-sky-900/40 text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Grant Sādhaka</span>
                  </button>
                )}

                {canEdit && !u.isScholarship && (
                  <button
                    onClick={() => handleGrantScholarship(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
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
