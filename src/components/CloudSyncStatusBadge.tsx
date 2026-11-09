import React, { useEffect, useState } from "react";
import { Cloud, CloudCheck, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { firestoreSyncService, type SyncStatus } from "../services/firestore-sync.service";
import { authService, type SeekerUser } from "../services/auth.service";

interface CloudSyncStatusBadgeProps {
  onManualSync?: () => void;
  compact?: boolean;
  theme?: string;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({
  onManualSync,
  compact = false,
  theme = "sandstone",
}) => {
  const [status, setStatus] = useState<SyncStatus>(() => firestoreSyncService.getStatus());
  const [currentUser, setCurrentUser] = useState<SeekerUser | null>(() => authService.getCurrentUser());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isClientLight, setIsClientLight] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const checkLight = () => {
        setIsClientLight(
          theme === "light" ||
          document.documentElement.classList.contains("light-mode") ||
          document.documentElement.classList.contains("parchment-dawn") ||
          document.documentElement.getAttribute("data-theme") === "light"
        );
      };
      checkLight();
      const observer = new MutationObserver(checkLight);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
      return () => observer.disconnect();
    }
  }, [theme]);

  const isLight = theme === "light" || isClientLight;

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
      return <RefreshCw className={`w-3.5 h-3.5 ${isLight ? "text-[#b8801f]" : "text-amber-400"} animate-spin`} />;
    }
    if (status.state === "error") {
      return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (status.state === "offline") {
      return <CloudOff className={`w-3.5 h-3.5 ${isLight ? "text-[#55526b]" : "text-stone-400"}`} />;
    }
    return <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />;
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
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
          isLight
            ? "bg-white border border-[#cfcbe0] text-[#1b1740] hover:text-[#100e2b] hover:border-[#d9a441] shadow-xs"
            : "bg-stone-900/90 border border-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:text-amber-200"
        }`}
      >
        {getStatusIcon()}
        <span>{status.state === "synced" ? "Synced" : getStatusLabel()}</span>
      </button>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl border shadow-xs flex-nowrap w-full transition-colors ${
        isLight
          ? "bg-white border-[#cfcbe0]"
          : "bg-stone-900/80 border-stone-800/90"
      }`}
    >
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            isLight
              ? "bg-[#efedf6] border-[#cfcbe0]"
              : "bg-stone-950/80 border-stone-800"
          }`}
        >
          {getStatusIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span
              className={`text-xs font-semibold whitespace-nowrap ${
                isLight ? "text-[#1b1740]" : "text-stone-200"
              }`}
            >
              {getStatusLabel()}
            </span>
            <span
              className={`text-[10px] font-mono truncate min-w-0 ${
                isLight ? "text-[#55526b]" : "text-stone-500"
              }`}
            >
              ({currentUser ? currentUser.email : "Local Sādhaka"})
            </span>
          </div>
          <p
            className={`text-[11px] truncate ${
              isLight ? "text-[#55526b]" : "text-stone-400"
            }`}
          >
            Last synced:{" "}
            <span
              className={`font-mono font-medium ${
                isLight ? "text-[#b8801f]" : "text-stone-300"
              }`}
            >
              {formatLastSync(status.lastSyncedAt)}
            </span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSyncClick}
        disabled={isManualSyncing || status.state === "syncing"}
        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 active:scale-95 ${
          isLight
            ? "bg-[#fbf0d6] hover:bg-[#f0cf8a] border-[#f0cf8a] text-[#b8801f] hover:text-[#100e2b]"
            : "bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 hover:text-amber-300 border-stone-700/60"
        }`}
      >
        <RefreshCw
          className={`w-3 h-3 flex-shrink-0 ${
            isManualSyncing
              ? `animate-spin ${isLight ? "text-[#b8801f]" : "text-amber-400"}`
              : ""
          }`}
        />
        <span className="whitespace-nowrap">
          <span className="hidden xs:inline">Sync </span>Now
        </span>
      </button>
    </div>
  );
};
