import React, { useEffect, useState } from "react";
import { Cloud, CloudCheck, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { firestoreSyncService, type SyncStatus } from "../services/firestore-sync.service";
import { authService, type SeekerUser } from "../services/auth.service";

interface CloudSyncStatusBadgeProps {
  onManualSync?: () => void;
  compact?: boolean;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({
  onManualSync,
  compact = false,
}) => {
  const [status, setStatus] = useState<SyncStatus>(() => firestoreSyncService.getStatus());
  const [currentUser, setCurrentUser] = useState<SeekerUser | null>(() => authService.getCurrentUser());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    const unsubStatus = firestoreSyncService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubStatus();
      unsubAuth();
    };
  }, []);

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    try {
      if (onManualSync) {
        await onManualSync();
      } else if (currentUser) {
        // Fallback to service status update
        setTimeout(() => {
          setIsManualSyncing(false);
        }, 600);
      }
    } finally {
      setTimeout(() => setIsManualSyncing(false), 800);
    }
  };

  const getStatusIcon = () => {
    if (isManualSyncing || status.state === "syncing") {
      return <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
    }
    if (status.state === "error") {
      return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (status.state === "offline") {
      return <CloudOff className="w-3.5 h-3.5 text-stone-500" />;
    }
    return <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getStatusLabel = () => {
    if (isManualSyncing || status.state === "syncing") {
      return "Syncing to Cloud...";
    }
    if (status.state === "error") {
      return "Cloud Sync Warning";
    }
    if (status.state === "offline") {
      return "Local Sanctuary Mode";
    }
    return "Multi-Device Cloud Synced";
  };

  const formatLastSync = (isoString: string | null) => {
    if (!isoString) return "Just now";
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 15) return "Just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleSyncClick}
        title={`${getStatusLabel()} • Click to sync now`}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-900/90 border border-stone-800/80 text-[11px] font-mono text-stone-300 hover:border-amber-500/40 hover:text-amber-200 transition-all cursor-pointer"
      >
        {getStatusIcon()}
        <span>{status.state === "synced" ? "Synced" : getStatusLabel()}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 shadow-sm flex-nowrap w-full">
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-center flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="text-xs font-semibold text-stone-200 whitespace-nowrap">{getStatusLabel()}</span>
            <span className="text-[10px] text-stone-500 font-mono truncate min-w-0">
              ({currentUser ? currentUser.email : "Local Sādhaka"})
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">
            Last synced: <span className="text-stone-300 font-mono">{formatLastSync(status.lastSyncedAt)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSyncClick}
        disabled={isManualSyncing || status.state === "syncing"}
        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 active:scale-95 text-stone-200 hover:text-amber-300 text-xs font-medium border border-stone-700/60 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
      >
        <RefreshCw className={`w-3 h-3 flex-shrink-0 ${isManualSyncing ? "animate-spin text-amber-400" : ""}`} />
        <span className="whitespace-nowrap"><span className="hidden xs:inline">Sync </span>Now</span>
      </button>
    </div>
  );
};
