import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Search,
  Plus,
  Bell,
  ShieldCheck,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  Heart,
  Lightbulb,
  Pin,
  MoreVertical,
  Flag,
  BookOpen,
  Filter,
  RefreshCw,
  Sun,
  Compass,
  Flame,
  Volume2,
  HelpCircle,
  X,
  UserX,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Send,
  Sparkle,
} from "lucide-react";
import {
  communityService,
  COMMUNITY_CATEGORIES,
  type CommunityPost,
  type CommunityCategory,
  type ThreadedComment,
} from "../../services/community.service";
import { SatsangGuidelinesModal } from "./SatsangGuidelinesModal";
import { CreatePostModal } from "./CreatePostModal";
import { PostDetailModal } from "./PostDetailModal";
import { ReportModal } from "./ReportModal";
import { CommunityNotificationsModal } from "./CommunityNotificationsModal";
import { ModeratorConsoleModal } from "./ModeratorConsoleModal";
import { type AppTheme } from "../../types";

export type CommunitySortFilter = "newest" | "popular" | "my_discussions";

interface CommunityBoardViewProps {
  theme?: AppTheme;
  initialPostId?: string;
  onNavigateTab?: (tab: string) => void;
}

interface OptimisticLikeData {
  isLiked: boolean;
  count: number;
  isBouncing?: boolean;
}

export const CommunityBoardView: React.FC<CommunityBoardViewProps> = ({
  theme = "light",
  initialPostId,
  onNavigateTab,
}) => {
  const isLight = theme === "light";
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>("all");

  // Multi-Criteria Filtering & Sorting System: Exactly 3 criteria ('newest' | 'popular' | 'my_discussions')
  const [sortOption, setSortOption] = useState<CommunitySortFilter>(() => {
    try {
      const stored = localStorage.getItem("sutrasparsh_community_active_sort");
      if (stored === "newest" || stored === "popular" || stored === "my_discussions") {
        return stored;
      }
    } catch {}
    return "newest";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Optimistic UI state for animated Like button
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, OptimisticLikeData>>({});

  // Threaded Reply state: Set of post IDs with expanded comments/replies
  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());
  // Active inline reply inputs for posts: mapping postId -> { parentCommentId?, authorName?, text }
  const [replyInputMap, setReplyInputMap] = useState<
    Record<string, { parentCommentId?: string; authorName?: string; text: string }>
  >({});
  // Set of comment IDs whose nested replies are collapsed
  const [collapsedCommentReplies, setCollapsedCommentReplies] = useState<Set<string>>(new Set());

  // Modals state
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isModConsoleOpen, setIsModConsoleOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Subscribe to community service changes
  useEffect(() => {
    const refresh = () => {
      const list = communityService.getPosts({
        category: selectedCategory,
        sort: sortOption,
        searchQuery,
      });
      setPosts(list);

      // Refresh selected post if open
      if (selectedPost) {
        const updated = communityService.getPostById(selectedPost.id);
        if (updated) setSelectedPost(updated);
      }
    };

    refresh();
    const unsub = communityService.subscribe(refresh);
    return unsub;
  }, [selectedCategory, sortOption, searchQuery]);

  // Handle deep-linked initial post
  useEffect(() => {
    if (initialPostId) {
      const p = communityService.getPostById(initialPostId);
      if (p) setSelectedPost(p);
    }
  }, [initialPostId]);

  // Check guidelines acceptance on initial visit
  useEffect(() => {
    if (!communityService.hasAcceptedGuidelines()) {
      setIsGuidelinesOpen(true);
    }
  }, []);

  const currentProfile = communityService.getCurrentProfile();
  const unreadNotifs = communityService.getUnreadNotificationCount();
  const isModOrAdmin = currentProfile.role === "admin" || currentProfile.role === "moderator";

  // Persistent Sort Filter Switcher
  const handleSortChange = (newSort: CommunitySortFilter) => {
    setSortOption(newSort);
    try {
      localStorage.setItem("sutrasparsh_community_active_sort", newSort);
    } catch {}
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    handleSortChange("newest");
    setActionNotice("Your reflection has been shared with the Satsang Mandali!");
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleShare = (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?tab=community&post=${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  // Helper to determine Like state (optimistic overlay on post data)
  const getPostLikeState = (post: CommunityPost): OptimisticLikeData => {
    const opt = optimisticLikes[post.id];
    if (opt !== undefined) {
      return opt;
    }
    const isLiked = communityService.isPostLikedByUser(post.id, currentProfile.id);
    return {
      isLiked,
      count: post.likesCount || 0,
      isBouncing: false,
    };
  };

  // Interactive Micro-feature: Animated Like Button with Optimistic UI Update & Spring Transition
  const handleLikePost = (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getPostLikeState(post);
    const nextLiked = !current.isLiked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // 1. Optimistic Update immediately applied to UI
    setOptimisticLikes((prev) => ({
      ...prev,
      [post.id]: { isLiked: nextLiked, count: nextCount, isBouncing: true },
    }));

    // Trigger spring animation bounce reset
    setTimeout(() => {
      setOptimisticLikes((prev) => {
        if (!prev[post.id]) return prev;
        return {
          ...prev,
          [post.id]: { ...prev[post.id], isBouncing: false },
        };
      });
    }, 450);

    // 2. Background service invocation with rollback guard
    try {
      const res = communityService.toggleLike(post.id);
      if (!res.success) {
        // Rollback
        setOptimisticLikes((prev) => ({
          ...prev,
          [post.id]: { isLiked: current.isLiked, count: current.count, isBouncing: false },
        }));
      }
    } catch {
      // Rollback on network/storage error
      setOptimisticLikes((prev) => ({
        ...prev,
        [post.id]: { isLiked: current.isLiked, count: current.count, isBouncing: false },
      }));
    }
  };

  // Threaded Comments: Toggle expand/collapse of comments directly under a main post
  const toggleThreadExpanded = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Threaded Comments: Toggle collapse of replies under a specific parent comment
  const toggleCollapseReplies = (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedCommentReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Set reply target for inline composer
  const handleInitiateReply = (postId: string, parentCommentId: string, authorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure thread is expanded
    setExpandedThreadIds((prev) => new Set(prev).add(postId));
    setReplyInputMap((prev) => ({
      ...prev,
      [postId]: {
        parentCommentId,
        authorName,
        text: prev[postId]?.text || "",
      },
    }));
  };

  // Submit comment or nested reply directly from post card
  const handleSubmitInlineComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const input = replyInputMap[postId];
    const text = input?.text?.trim();
    if (!text || text.length < 3) return;

    const parentId = input?.parentCommentId;
    const res = communityService.addComment(postId, text, parentId);

    if (res.success) {
      // Clear composer state for this post
      setReplyInputMap((prev) => ({
        ...prev,
        [postId]: { parentCommentId: undefined, authorName: undefined, text: "" },
      }));
      // Ensure thread is open and uncollapsed
      if (parentId) {
        setCollapsedCommentReplies((prev) => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
      setActionNotice(parentId ? "Reply submitted to conversation!" : "Reflection comment posted!");
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const getCategoryIcon = (catId: CommunityCategory) => {
    switch (catId) {
      case "gita":
        return Sun;
      case "yoga_sutras":
        return Compass;
      case "upanishads":
        return BookOpen;
      case "sadhana_meditation":
        return Flame;
      case "sanskrit_chanting":
        return Volume2;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl flex items-center space-x-2 animate-fadeIn">
          <Sparkle className="w-4 h-4 fill-stone-950" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. HERO SATSANG MANDALI BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Satsang Mandali • सत्संग मण्डली</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-sacred font-bold text-amber-100 tracking-tight">
              Community Wisdom & In-App Discussions
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Connect with fellow practitioners, ask philosophical questions, explore Gita commentaries, and share daily
              Brahma Muhurta experiences in a safe, authentic sanctuary.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (!communityService.hasAcceptedGuidelines()) {
                  setIsGuidelinesOpen(true);
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Share Reflection</span>
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 rounded-2xl border border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-300 transition-all cursor-pointer"
              title="Notifications"
              aria-label="Community Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[9.5px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="p-2.5 rounded-2xl border border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-amber-400 transition-all cursor-pointer"
              title="Satsang Maryādā Guidelines"
              aria-label="Community Guidelines"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {isModOrAdmin && (
              <button
                onClick={() => setIsModConsoleOpen(true)}
                className="px-3 py-2 rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Open Moderator Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Moderator Console</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEARCH & MULTI-CRITERIA FILTERING / SORTING TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-stone-950/60 p-2 sm:p-2.5 rounded-2xl border border-stone-800">
        {/* Instant Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections by topic, verse (e.g. Gita 2.47), or teacher..."
            className={`w-full pl-10 pr-9 py-2 rounded-xl border text-xs sm:text-sm transition-all focus:outline-hidden ${
              isLight
                ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                : "bg-stone-900/80 border-stone-800 focus:border-amber-400 text-stone-100"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Multi-Criteria Filter & Sort Toolbar: Exactly 3 Toggle Views ('Newest' | 'Popular' | 'My Discussions') */}
        <div
          role="tablist"
          aria-label="Community Feed Filter"
          className="flex items-center space-x-1 p-1 rounded-xl bg-stone-900 border border-stone-800/80 self-stretch md:self-auto overflow-x-auto shrink-0"
        >
          {/* Criterion a: Newest (नूतन) */}
          <button
            role="tab"
            aria-selected={sortOption === "newest"}
            onClick={() => handleSortChange("newest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              sortOption === "newest"
                ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <span>Newest</span>
            <span className="text-[10px] opacity-75 font-sanskrit">नूतन</span>
          </button>

          {/* Criterion b: Popular (लोकप्रिय) */}
          <button
            role="tab"
            aria-selected={sortOption === "popular"}
            onClick={() => handleSortChange("popular")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              sortOption === "popular"
                ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <span>Popular</span>
            <span className="text-[10px] opacity-75 font-sanskrit">लोकप्रिय</span>
          </button>

          {/* Criterion c: My Discussions (मम विचार) */}
          <button
            role="tab"
            aria-selected={sortOption === "my_discussions"}
            onClick={() => handleSortChange("my_discussions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              sortOption === "my_discussions"
                ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <span>My Discussions</span>
            <span className="text-[10px] opacity-75 font-sanskrit">मम विचार</span>
          </button>
        </div>
      </div>

      {/* 3. TOPIC CATEGORY PILLS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {COMMUNITY_CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-sm"
                  : isLight
                  ? "bg-white/80 border-stone-300 text-stone-700 hover:border-amber-400"
                  : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-sanskrit">{cat.sanskrit}</span>
            </button>
          );
        })}
      </div>

      {/* 4. POSTS FEED WITH THREADED REPLIES & ANIMATED LIKES */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          /* Tailored Empty-State Handling for Each of the 3 Criteria */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center rounded-3xl bg-stone-900/40 border border-stone-800 p-8 space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              {sortOption === "my_discussions" ? (
                <MessageCircle className="w-7 h-7" />
              ) : sortOption === "popular" ? (
                <Flame className="w-7 h-7" />
              ) : (
                <BookOpen className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-stone-200">
                {sortOption === "my_discussions"
                  ? "You haven't posted any reflections or questions yet"
                  : sortOption === "popular"
                  ? "No trending discussions in this space yet"
                  : "No recent reflections in this category"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                {sortOption === "my_discussions"
                  ? "Share a verse contemplation, ask a philosophy question on the Bhagavad Gita or Yoga Sutras, and engage with fellow seekers."
                  : sortOption === "popular"
                  ? "Be the first to share an inspiring realization or answer questions to spark a trending conversation!"
                  : "Connect with the community by sharing your daily sadhana insights or questions with fellow practitioners."}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {sortOption === "my_discussions" ? "Start Your First Discussion" : "Share First Reflection"}
                </span>
              </button>

              {sortOption !== "newest" && (
                <button
                  onClick={() => handleSortChange("newest")}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors"
                >
                  Browse Newest Feed
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          posts.map((post) => {
            const isBookmarked = communityService.isBookmarked(post.id);
            const isMenuOpen = activeMenuPostId === post.id;
            const likeState = getPostLikeState(post);
            const isThreadExpanded = expandedThreadIds.has(post.id);
            const threadedComments: ThreadedComment[] = isThreadExpanded
              ? communityService.getThreadedComments(post.id)
              : [];
            const activeReplyInput = replyInputMap[post.id] || { text: "" };

            return (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer relative group ${
                  post.isPinned
                    ? "bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-amber-950/20 border-amber-500/40 shadow-lg"
                    : isLight
                    ? "bg-white border-stone-200 hover:border-amber-300 hover:shadow-md"
                    : "bg-stone-900/50 border-stone-800/80 hover:border-amber-500/30 hover:bg-stone-900/80 shadow-sm"
                }`}
              >
                {/* Author row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                          {post.authorName}
                        </span>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold">
                          {post.authorBadge}
                        </span>
                        {post.isPinned && (
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center space-x-1">
                            <Pin className="w-2.5 h-2.5" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        {post.editedAt && " • (edited)"}
                      </span>
                    </div>
                  </div>

                  {/* Top Right Options */}
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleShare(post, e)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 transition-colors"
                      title={copiedPostId === post.id ? "Link copied!" : "Share"}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => communityService.toggleBookmark(post.id)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-amber-300 transition-colors"
                      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuPostId(isMenuOpen ? null : post.id)}
                        className="p-1.5 rounded-full text-stone-400 hover:text-stone-200"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-44 rounded-2xl bg-stone-900 border border-stone-800 p-1.5 shadow-2xl z-30 space-y-1">
                          <button
                            onClick={() => {
                              setActiveMenuPostId(null);
                              setReportTarget({ type: "post", id: post.id });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold text-rose-300 hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>

                          {post.authorId !== currentProfile.id && (
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                communityService.blockUser(post.authorId);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold text-stone-400 hover:bg-stone-800 flex items-center space-x-2 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Block User</span>
                            </button>
                          )}

                          {isModOrAdmin && (
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                communityService.togglePinPost(post.id);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold text-amber-300 hover:bg-amber-950/40 flex items-center space-x-2 cursor-pointer"
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span>{post.isPinned ? "Unpin Post" : "Pin Post"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-100 group-hover:text-amber-200 transition-colors mb-2">
                  {post.title}
                </h2>

                {/* Canonical Scripture Citation Quote Box (if present) */}
                {post.scriptureRef && (
                  <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-300 font-mono">{post.scriptureRef.verseRef}</span>
                      {post.scriptureRef.sanskritSnippet && (
                        <span className="text-xs font-sanskrit text-amber-200/80 hidden sm:inline truncate max-w-sm">
                          "{post.scriptureRef.sanskritSnippet}"
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Body snippet */}
                <p
                  className={`text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 ${
                    isLight ? "text-stone-700" : "text-stone-300"
                  }`}
                >
                  {post.body}
                </p>

                {/* Tags row */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* INTERACTIVE ACTION BAR: Animated Like Button & Threaded Reply Action */}
                <div
                  className="flex items-center justify-between pt-3 border-t border-amber-500/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-2">
                    {/* Animated 'Like' Button with spring bounce and optimistic update */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => handleLikePost(post, e)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        likeState.isLiked
                          ? "bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/40"
                          : isLight
                          ? "bg-stone-100/90 border-stone-300 text-stone-700 hover:border-rose-400 hover:text-rose-500"
                          : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-rose-500/40 hover:text-rose-300"
                      }`}
                      title={likeState.isLiked ? "Unlike reflection" : "Like reflection"}
                    >
                      <motion.div
                        animate={
                          likeState.isBouncing
                            ? { scale: [1, 1.45, 0.9, 1.15, 1], rotate: [0, -14, 14, -6, 0] }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            likeState.isLiked ? "fill-rose-500 text-rose-400" : ""
                          }`}
                        />
                      </motion.div>
                      <span>{likeState.count}</span>
                      <span className="text-[10.5px] hidden sm:inline">{likeState.isLiked ? "Liked" : "Like"}</span>
                    </motion.button>

                    {/* Quick Inline Reply Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleThreadExpanded(post.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isThreadExpanded
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-500/30"
                      }`}
                      title="View & Post Threaded Replies"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{post.commentsCount || 0} Replies</span>
                      {isThreadExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Open Full Dialog Detail */}
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="text-xs font-medium text-stone-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
                  >
                    <span>Full Discussion</span>
                    <CornerDownRight className="w-3 h-3" />
                  </button>
                </div>

                {/* THREADED COMMENTS & NESTED REPLIES COMPONENT (INLINE ON POST CARD) */}
                <AnimatePresence>
                  {isThreadExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 pt-4 border-t border-stone-800/80 space-y-4"
                    >
                      {/* Thread Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Threaded Discussion ({threadedComments.length} root reflections)</span>
                        </span>
                        <button
                          onClick={(e) => toggleThreadExpanded(post.id, e)}
                          className="text-[11px] text-stone-400 hover:text-stone-200 font-semibold"
                        >
                          Collapse thread
                        </button>
                      </div>

                      {/* Threaded Comments List */}
                      {threadedComments.length === 0 ? (
                        <div className="py-4 text-center rounded-2xl bg-stone-950/40 border border-stone-800/60 p-4">
                          <p className="text-xs text-stone-400">
                            No comments yet. Share the first thoughtful answer or realization below!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {threadedComments.map((rootComment) => {
                            const areRepliesCollapsed = collapsedCommentReplies.has(rootComment.id);
                            return (
                              <div
                                key={rootComment.id}
                                className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/70 space-y-2 text-xs"
                              >
                                {/* Root Comment Author */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={rootComment.authorAvatar}
                                      alt={rootComment.authorName}
                                      className="w-6 h-6 rounded-full object-cover border border-amber-500/20"
                                    />
                                    <span className="font-bold text-stone-200">{rootComment.authorName}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 font-mono">
                                      {rootComment.authorBadge}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-stone-500">
                                    {new Date(rootComment.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                <p className="text-stone-300 pl-8 leading-relaxed whitespace-pre-wrap">
                                  {rootComment.body}
                                </p>

                                {/* Comment Actions: Inline Reply Button & Nested Replies Toggle */}
                                <div className="flex items-center justify-between pl-8 pt-1 text-[11px] text-stone-400">
                                  <button
                                    onClick={(e) =>
                                      handleInitiateReply(post.id, rootComment.id, rootComment.authorName, e)
                                    }
                                    className="hover:text-amber-300 font-bold flex items-center space-x-1 cursor-pointer"
                                  >
                                    <CornerDownRight className="w-3 h-3" />
                                    <span>Reply</span>
                                  </button>

                                  {rootComment.replies && rootComment.replies.length > 0 && (
                                    <button
                                      onClick={(e) => toggleCollapseReplies(rootComment.id, e)}
                                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                                    >
                                      <span>
                                        {areRepliesCollapsed
                                          ? `View ${rootComment.replies.length} replies`
                                          : `Hide replies (${rootComment.replies.length})`}
                                      </span>
                                      {areRepliesCollapsed ? (
                                        <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ChevronUp className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* NESTED REPLIES TREE (parentId Relational Mapping) */}
                                {!areRepliesCollapsed &&
                                  rootComment.replies &&
                                  rootComment.replies.length > 0 && (
                                    <div className="border-l-2 border-amber-500/30 pl-4 ml-6 mt-2 space-y-2.5">
                                      {rootComment.replies.map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="p-2.5 rounded-xl bg-stone-900/70 border border-stone-800/80 space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <img
                                                src={reply.authorAvatar}
                                                alt={reply.authorName}
                                                className="w-5 h-5 rounded-full object-cover border border-amber-500/20"
                                              />
                                              <span className="font-bold text-stone-200">{reply.authorName}</span>
                                              <span className="text-[8.5px] px-1 rounded bg-stone-800 text-stone-400 font-mono">
                                                {reply.authorBadge}
                                              </span>
                                            </div>
                                            <span className="text-[9.5px] text-stone-500">
                                              {new Date(reply.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-stone-300 pl-7 leading-relaxed">{reply.body}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* INLINE COMPOSER (Add Comment or Nested Reply) */}
                      <form onSubmit={(e) => handleSubmitInlineComment(post.id, e)} className="space-y-2 pt-2">
                        {activeReplyInput.parentCommentId && (
                          <div className="flex items-center justify-between text-xs px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            <span className="flex items-center space-x-1.5">
                              <CornerDownRight className="w-3 h-3" />
                              <span>Replying to @{activeReplyInput.authorName}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyInputMap((prev) => ({
                                  ...prev,
                                  [post.id]: { parentCommentId: undefined, authorName: undefined, text: prev[post.id]?.text || "" },
                                }));
                              }}
                              className="text-stone-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={activeReplyInput.text}
                            onChange={(e) =>
                              setReplyInputMap((prev) => ({
                                ...prev,
                                [post.id]: {
                                  ...prev[post.id],
                                  text: e.target.value,
                                },
                              }))
                            }
                            placeholder={
                              activeReplyInput.parentCommentId
                                ? `Reply to ${activeReplyInput.authorName}...`
                                : "Share a thoughtful reflection or answer..."
                            }
                            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs transition-all focus:outline-hidden ${
                              isLight
                                ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                                : "bg-stone-950 border-stone-800 focus:border-amber-400 text-stone-100"
                            }`}
                          />
                          <button
                            type="submit"
                            disabled={!activeReplyInput.text?.trim()}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs shadow transition-transform active:scale-95 flex items-center space-x-1.5 shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{activeReplyInput.parentCommentId ? "Reply" : "Comment"}</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })
        )}
      </div>

      {/* MODALS */}
      <SatsangGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        onAccept={() => {
          communityService.acceptGuidelines();
          setIsGuidelinesOpen(false);
        }}
        isLight={isLight}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        isLight={isLight}
      />

      <PostDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        onOpenReport={(type, id) => setReportTarget({ type, id })}
        isLight={isLight}
      />

      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          isLight={isLight}
        />
      )}

      <CommunityNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectPost={(postId) => {
          const p = communityService.getPostById(postId);
          if (p) setSelectedPost(p);
        }}
        isLight={isLight}
      />

      <ModeratorConsoleModal
        isOpen={isModConsoleOpen}
        onClose={() => setIsModConsoleOpen(false)}
        isLight={isLight}
      />
    </div>
  );
};
