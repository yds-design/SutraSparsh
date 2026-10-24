import React from "react";
import { Bell, CheckCheck, X, Sparkles, MessageCircle, Heart, ShieldAlert } from "lucide-react";
import { ModalPortal } from "../ModalPortal";
import { communityService, type CommunityNotification } from "../../services/community.service";

interface CommunityNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost?: (postId: string) => void;
  isLight?: boolean;
}

export const CommunityNotificationsModal: React.FC<CommunityNotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectPost,
  isLight = false,
}) => {
  if (!isOpen) return null;

  const notifications = communityService.getNotifications();
  const unreadCount = communityService.getUnreadNotificationCount();

  const handleMarkAllRead = () => {
    communityService.markNotificationsRead();
  };

  const getNotifIcon = (type: CommunityNotification["type"]) => {
    switch (type) {
      case "reaction":
        return Heart;
      case "comment":
      case "reply":
        return MessageCircle;
      case "badge":
        return Sparkles;
      case "moderator_notice":
        return ShieldAlert;
      default:
        return Bell;
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
      >
        <div
          className={`w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-500/15">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 id="notif-modal-title" className="text-base font-bold text-amber-200">
                  Satsang Notifications
                </h2>
                <span className="text-[11px] text-stone-400 font-mono">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All updates read"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/15 flex items-center space-x-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-200"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 font-serif-sacred">
                No notifications yet. When members react or reply to your reflections, they will appear here! 🙏
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = getNotifIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.targetPostId && onSelectPost) {
                        onSelectPost(n.targetPostId);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      !n.read
                        ? "bg-amber-500/10 border-amber-400/50"
                        : "bg-stone-900/60 border-stone-800/80 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-100 truncate">{n.title}</span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1.5" />}
                        </div>
                        <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
