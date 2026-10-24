import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  CheckCircle2,
  Trash2,
  CornerDownRight,
  Send,
  Flag,
  Sparkles,
  BookOpen,
  Pin,
  Heart,
  Lightbulb,
  ThumbsUp,
} from "lucide-react";
import { ModalPortal } from "../ModalPortal";
import {
  communityService,
  type CommunityPost,
  type CommunityComment,
} from "../../services/community.service";

interface PostDetailModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: (targetType: "post" | "comment", targetId: string) => void;
  isLight?: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenReport,
  isLight = false,
}) => {
  const [commentText, setCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!isOpen || !post) return null;

  const comments = communityService.getComments(post.id);
  const isBookmarked = communityService.isBookmarked(post.id);
  const currentProfile = communityService.getCurrentProfile();

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    communityService.addComment(post.id, commentText);
    setCommentText("");
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;
    communityService.addComment(post.id, replyText, parentId);
    setReplyText("");
    setReplyingToCommentId(null);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?tab=community&post=${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-detail-title"
      >
        <div
          className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-500/15">
            <div className="flex items-center space-x-3">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-stone-100">{post.authorName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    {post.authorBadge}
                  </span>
                  {post.isPinned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center space-x-1">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {post.editedAt && " • (edited)"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full border transition-all ${
                  copiedLink
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : isLight
                    ? "border-stone-300 hover:bg-stone-200 text-stone-600"
                    : "border-stone-800 hover:bg-stone-900 text-stone-400"
                }`}
                title={copiedLink ? "Link copied to clipboard!" : "Share post"}
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => communityService.toggleBookmark(post.id)}
                className={`p-2 rounded-full border transition-all ${
                  isBookmarked
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : isLight
                    ? "border-stone-300 hover:bg-stone-200 text-stone-600"
                    : "border-stone-800 hover:bg-stone-900 text-stone-400"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Save post"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current text-amber-400" : ""}`} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-2 rounded-full transition-colors ${
                    isLight ? "hover:bg-stone-200 text-stone-600" : "hover:bg-stone-800 text-stone-400"
                  }`}
                  aria-label="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 w-44 rounded-2xl bg-stone-900 border border-stone-800 p-1.5 shadow-2xl z-30 space-y-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenReport("post", post.id);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-300 hover:bg-rose-950/40 flex items-center space-x-2"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report Post</span>
                    </button>
                    {post.authorId !== currentProfile.id && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          communityService.blockUser(post.authorId);
                          onClose();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-400 hover:bg-stone-800 flex items-center space-x-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Block User</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  isLight ? "hover:bg-stone-200 text-stone-600" : "hover:bg-stone-800 text-stone-400"
                }`}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Post Title */}
            <div>
              <h1 id="post-detail-title" className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-100 leading-snug">
                {post.title}
              </h1>
            </div>

            {/* Scripture Reference Quote Box */}
            {post.scriptureRef && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Canonical Wisdom Reference • {post.scriptureRef.verseRef}</span>
                </div>
                {post.scriptureRef.sanskritSnippet && (
                  <p className="font-sanskrit text-sm text-amber-200/90 leading-relaxed font-semibold">
                    "{post.scriptureRef.sanskritSnippet}"
                  </p>
                )}
              </div>
            )}

            {/* Post Body */}
            <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${isLight ? "text-stone-800" : "text-stone-200"}`}>
              {post.body}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {post.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Reactions Picker Bar (FR-ENG-01) */}
            <div className="pt-4 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                {/* 1. Helpful */}
                <button
                  onClick={() => communityService.toggleReaction(post.id, "helpful")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                    post.userReactions?.helpful?.includes(currentProfile.id)
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40"
                      : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-500/40"
                  }`}
                  title="Mark as Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Helpful</span>
                  <span className="font-mono text-[11px] text-amber-400">{post.reactions?.helpful || 0}</span>
                </button>

                {/* 2. Bhakti / Devotion */}
                <button
                  onClick={() => communityService.toggleReaction(post.id, "bhakti")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                    post.userReactions?.bhakti?.includes(currentProfile.id)
                      ? "bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/40"
                      : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-rose-500/40"
                  }`}
                  title="Bhakti / Heartfelt"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                  <span>Bhakti</span>
                  <span className="font-mono text-[11px] text-rose-400">{post.reactions?.bhakti || 0}</span>
                </button>

                {/* 3. Pranāma / Namaste */}
                <button
                  onClick={() => communityService.toggleReaction(post.id, "namaste")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                    post.userReactions?.namaste?.includes(currentProfile.id)
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40"
                      : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-emerald-500/40"
                  }`}
                  title="Pranāma / Respectful Greeting"
                >
                  <span className="text-sm">🙏</span>
                  <span>Pranāma</span>
                  <span className="font-mono text-[11px] text-emerald-400">{post.reactions?.namaste || 0}</span>
                </button>

                {/* 4. Jnāna / Insight */}
                <button
                  onClick={() => communityService.toggleReaction(post.id, "jnana")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                    post.userReactions?.jnana?.includes(currentProfile.id)
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400/40"
                      : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-sky-500/40"
                  }`}
                  title="Jnāna / Philosophical Insight"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                  <span>Jnāna</span>
                  <span className="font-mono text-[11px] text-sky-400">{post.reactions?.jnana || 0}</span>
                </button>
              </div>

              <div className="text-xs text-stone-400 font-mono">
                {comments.length} {comments.length === 1 ? "reflection" : "reflections"}
              </div>
            </div>

            {/* Comments Thread Section */}
            <div className="space-y-4 pt-4 border-t border-stone-800/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Satsang Reflections & Dialogues ({comments.length})</span>
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                  placeholder="Contribute your contemplation or question on this reflection..."
                  className={`w-full px-4 py-2.5 rounded-2xl border text-xs leading-relaxed transition-all focus:outline-hidden resize-none ${
                    isLight
                      ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                      : "bg-stone-900 border-stone-800 focus:border-amber-400 text-stone-100"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 font-mono">{commentText.length}/1000</span>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Reflection</span>
                  </button>
                </div>
              </form>

              {/* Comments List with nested replies (FR-ENG-02) */}
              <div className="space-y-3 pt-2">
                {rootComments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-500 font-serif-sacred">
                    No reflections yet. Be the first to share your contemplation! 🙏
                  </div>
                ) : (
                  rootComments.map((c) => {
                    const replies = getReplies(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                          c.isHelpfulAnswer
                            ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20"
                            : isLight
                            ? "bg-white/80 border-stone-200"
                            : "bg-stone-900/50 border-stone-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={c.authorAvatar}
                              alt={c.authorName}
                              className="w-7 h-7 rounded-full object-cover border border-amber-500/30"
                            />
                            <div>
                              <span className="text-xs font-bold text-stone-200">{c.authorName}</span>
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold font-mono">
                                {c.authorBadge}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {c.isHelpfulAnswer && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Helpful Answer</span>
                              </span>
                            )}
                            {(post.authorId === currentProfile.id || currentProfile.role === "admin") && (
                              <button
                                onClick={() => communityService.markCommentHelpful(c.id)}
                                className="text-[10px] text-stone-400 hover:text-emerald-400 p-1"
                                title="Toggle Helpful Answer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(c.authorId === currentProfile.id || currentProfile.role === "admin") && (
                              <button
                                onClick={() => communityService.deleteComment(c.id)}
                                className="text-[10px] text-stone-500 hover:text-rose-400 p-1"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-stone-800" : "text-stone-300"}`}>
                          {c.body}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id)}
                            className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Inline Reply Composer */}
                        {replyingToCommentId === c.id && (
                          <div className="pl-4 pt-2 border-l-2 border-amber-500/30 space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${c.authorName}...`}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs focus:outline-hidden"
                            />
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setReplyingToCommentId(null)}
                                className="px-3 py-1 rounded-lg text-[11px] text-stone-400 hover:text-stone-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddReply(c.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-[11px]"
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies (Level 2) */}
                        {replies.length > 0 && (
                          <div className="pl-4 pt-2 space-y-2 border-l-2 border-amber-500/20">
                            {replies.map((r) => (
                              <div
                                key={r.id}
                                className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <img
                                      src={r.authorAvatar}
                                      alt={r.authorName}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span className="text-xs font-bold text-stone-200">{r.authorName}</span>
                                    <span className="text-[8.5px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">
                                      {r.authorBadge}
                                    </span>
                                  </div>
                                  {(r.authorId === currentProfile.id || currentProfile.role === "admin") && (
                                    <button
                                      onClick={() => communityService.deleteComment(r.id)}
                                      className="text-stone-500 hover:text-rose-400 p-0.5"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-stone-300">{r.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
