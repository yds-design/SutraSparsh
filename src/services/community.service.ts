/**
 * SutraSparsh Community Service (Satsang Mandali)
 * Implements BRD & FRD for In-App Community Board
 * Handles:
 * - Posts, comments, nested replies
 * - Reactions (Helpful, Bhakti, Namaste, Jnana)
 * - Moderation console, reporting, auto-flagging, user blocking
 * - Profile and role badges (Vidvān, Sādhaka, Moderator, etc.)
 * - In-app notification center
 * - Satsang Maryada Guidelines acceptance & tracking
 * - Analytics events
 */

import { authService, type SeekerUser } from "./auth.service";

export type CommunityRole = "seeker" | "contributor" | "expert" | "moderator" | "admin";
export type CommunityBadge = "Sādhaka" | "Abhyāsi" | "Vidvān (Expert)" | "Moderator" | "Sevā Guide";

export type CommunityCategory =
  | "all"
  | "gita"
  | "yoga_sutras"
  | "upanishads"
  | "sadhana_meditation"
  | "sanskrit_chanting"
  | "reflections_qa";

export interface CategoryInfo {
  id: CommunityCategory;
  name: string;
  sanskrit: string;
  description: string;
  icon: string;
}

export const COMMUNITY_CATEGORIES: CategoryInfo[] = [
  {
    id: "all",
    name: "All Satsang",
    sanskrit: "सर्व विचार",
    description: "Every sacred inquiry, reflection, and realization across the tradition.",
    icon: "Sparkles",
  },
  {
    id: "gita",
    name: "Bhagavad Gītā",
    sanskrit: "भगवद्गीता",
    description: "Karma Yoga, Bhakti, Jnana, and practical wisdom for daily life.",
    icon: "Sun",
  },
  {
    id: "yoga_sutras",
    name: "Patañjali Yoga Sūtras",
    sanskrit: "योगसूत्र",
    description: "Ashtanga yoga, mental stillness (Citta Vṛtti), and inner contemplation.",
    icon: "Compass",
  },
  {
    id: "upanishads",
    name: "Upaniṣads",
    sanskrit: "उपनिषद्",
    description: "Non-dual Vedānta, Brahman, Ātman, and timeless dialogues of Rishis.",
    icon: "BookOpen",
  },
  {
    id: "sadhana_meditation",
    name: "Sādhana & Meditation",
    sanskrit: "साधना व ध्यान",
    description: "Brahma Muhūrta routines, breathwork, Japa meditation experiences.",
    icon: "Flame",
  },
  {
    id: "sanskrit_chanting",
    name: "Sanskrit & Chanting",
    sanskrit: "संस्कृत व मन्त्र",
    description: "Grammar, Sandhi, metric cadence (Chhandas), 432Hz vibrations.",
    icon: "Volume2",
  },
  {
    id: "reflections_qa",
    name: "Seeker Q&A",
    sanskrit: "जिज्ञासा व समाधान",
    description: "Respectful inquiry on ethical dilemmas, spiritual practice questions.",
    icon: "HelpCircle",
  },
];

export interface CommunityUser {
  id: string;
  appUserId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  role: CommunityRole;
  badge: CommunityBadge;
  status: "active" | "muted" | "suspended" | "banned";
  isAnonymous: boolean;
  postCount: number;
  reputation: number;
  createdAt: string;
  mutedUntil?: string;
}

export interface ScriptureRef {
  scriptureId: string; // e.g. 'gita', 'yoga-sutras'
  verseRef: string; // e.g. 'BG 2.47'
  sanskritSnippet?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: CommunityRole;
  authorBadge: CommunityBadge;
  isAnonymous: boolean;
  category: CommunityCategory;
  title: string;
  body: string;
  tags: string[];
  scriptureRef?: ScriptureRef;
  likesCount: number;
  reactions: {
    helpful: number;
    bhakti: number;
    namaste: number;
    jnana: number;
  };
  userReactions: Record<string, string[]>; // reactionType -> array of userIds
  userLikes?: string[]; // userIds who liked the post
  commentsCount: number;
  sharesCount: number;
  isPinned: boolean;
  isOfficial: boolean;
  status: "published" | "hidden" | "deleted";
  reportCount: number;
  createdAt: string;
  editedAt?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string; // for nested replies
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: CommunityRole;
  authorBadge: CommunityBadge;
  body: string;
  likesCount: number;
  userLikes: string[];
  isHelpfulAnswer: boolean;
  status: "published" | "hidden" | "deleted";
  createdAt: string;
  editedAt?: string;
}

export interface ThreadedComment extends CommunityComment {
  replies: CommunityComment[];
}

export interface CommunityReport {
  id: string;
  targetType: "post" | "comment" | "user";
  targetId: string;
  targetSummary: string;
  reporterId: string;
  reason: "spam" | "harassment" | "disrespect" | "misinformation" | "inappropriate" | "other";
  note?: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  resolution?: string;
}

export interface CommunityNotification {
  id: string;
  userId: string;
  type: "comment" | "reply" | "reaction" | "mention" | "badge" | "moderator_notice";
  title: string;
  message: string;
  targetPostId?: string;
  read: boolean;
  createdAt: string;
}

export interface ModerationAuditLog {
  id: string;
  moderatorId: string;
  action:
    | "remove_post"
    | "hide_post"
    | "warn_user"
    | "mute_user"
    | "ban_user"
    | "dismiss_report"
    | "pin_post"
    | "unpin_post";
  targetType: string;
  targetId: string;
  reasonCode: string;
  note: string;
  timestamp: string;
}

export interface CommunityAnalyticsSummary {
  dau: number;
  mau: number;
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
  resolvedReports: number;
  supportDeflectionRate: string;
}

const STORAGE_KEYS = {
  POSTS: "sutrasparsh_community_posts_v1",
  COMMENTS: "sutrasparsh_community_comments_v1",
  REPORTS: "sutrasparsh_community_reports_v1",
  NOTIFICATIONS: "sutrasparsh_community_notifications_v1",
  BOOKMARKS: "sutrasparsh_community_bookmarks_v1",
  BLOCKED: "sutrasparsh_community_blocked_users_v1",
  GUIDELINES: "sutrasparsh_community_guidelines_accepted_v1",
  AUDIT_LOGS: "sutrasparsh_community_audit_logs_v1",
  CURRENT_USER_PROFILE: "sutrasparsh_community_profile_v1",
};

// Profanity / Toxicity / Spam Filter keywords
const BLOCKED_TERMS = [
  "crypto",
  "casino",
  "telegram.me",
  "bit.ly",
  "whatsapp group",
  "make money",
  "get rich",
  "free followers",
];

const CRISIS_TERMS = ["suicide", "end my life", "kill myself", "self-harm", "want to die"];

function safeGetStorage(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

export function normalizeDiacritics(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ā]/g, "a")
    .replace(/[ī]/g, "i")
    .replace(/[ū]/g, "u")
    .replace(/[ṛ]/g, "r")
    .replace(/[ṣś]/g, "s")
    .replace(/[ñṅṇ]/g, "n")
    .replace(/[ṭ]/g, "t")
    .replace(/[ḍ]/g, "d");
}

// Seed starter posts reflecting high quality Vedic discourse (BRD Section 13)
const SEED_POSTS: CommunityPost[] = [
  {
    id: "post-seed-01",
    authorId: "usr_meera_01",
    authorName: "Dr. Meera Nambiar",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    authorRole: "expert",
    authorBadge: "Vidvān (Expert)",
    isAnonymous: false,
    category: "gita",
    title: "Understanding 'Karmanyevādhikāraste' in Modern High-Pressure Workplaces",
    body: "In Gītā 2.47, Lord Krishna teaches: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन'. Many newcomers mistakenly interpret this as passivity or not caring about goals. In truth, it is the highest form of peak performance: when your mental energy is 100% focused on the craft of action rather than anxiety about future outcomes, performance improves exponentially. How do you apply Nishkāma Karma during deadline crunches?",
    tags: ["BhagavadGita", "KarmaYoga", "WorkplaceSadhana", "Mindfulness"],
    scriptureRef: {
      scriptureId: "gita",
      verseRef: "Gītā 2.47",
      sanskritSnippet: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    },
    likesCount: 42,
    reactions: {
      helpful: 24,
      bhakti: 12,
      namaste: 31,
      jnana: 28,
    },
    userReactions: {
      helpful: ["usr_seed_02", "usr_seed_03"],
      bhakti: ["usr_seed_04"],
      namaste: ["usr_seed_02", "usr_seed_05"],
      jnana: ["usr_seed_01", "usr_seed_03"],
    },
    commentsCount: 3,
    sharesCount: 14,
    isPinned: true,
    isOfficial: true,
    status: "published",
    reportCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: "post-seed-02",
    authorId: "usr_kabir_02",
    authorName: "Kabir Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    authorRole: "moderator",
    authorBadge: "Moderator",
    isAnonymous: false,
    category: "sadhana_meditation",
    title: "Brahma Muhūrta Awakening: Overcoming the 4:30 AM Inertia (Tamas)",
    body: "The transition from sleep to awareness between 4:00 AM and 5:30 AM is governed by pure Sattva. However, the physical body initially experiences heavy Tamas. A gentle Ayurvedic tip: keep a copper cup of warm water by your bedside, splash cold water over your eyes immediately upon rising, and chant 3 Omkars while sitting upright. What is your morning ritual to maintain your Sadhana streak?",
    tags: ["BrahmaMuhurta", "DailySadhana", "MeditationTips", "Ayurveda"],
    likesCount: 38,
    reactions: {
      helpful: 19,
      bhakti: 8,
      namaste: 25,
      jnana: 15,
    },
    userReactions: {
      helpful: ["usr_seed_01"],
      namaste: ["usr_seed_03"],
    },
    commentsCount: 2,
    sharesCount: 8,
    isPinned: false,
    isOfficial: false,
    status: "published",
    reportCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
  },
  {
    id: "post-seed-03",
    authorId: "usr_priya_03",
    authorName: "Priya V.",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorRole: "contributor",
    authorBadge: "Abhyāsi",
    isAnonymous: false,
    category: "yoga_sutras",
    title: "Yoga Sūtras 1.2: What Does 'Citta Vṛtti Nirodha' Mean in Practice?",
    body: "Patañjali defines Yoga as 'the cessation of the modifications of the mind-field'. As a beginner, I thought this meant forcing all thoughts to stop instantly, which only led to frustration. My teacher clarified that it means not identifying with the mental fluctuations—watching them arise and subside like waves without clinging. Does anyone have commentary recommendations on this sūtra?",
    tags: ["YogaSutras", "Patanjali", "Meditation", "Mindfulness"],
    scriptureRef: {
      scriptureId: "yoga-sutras",
      verseRef: "Yoga Sūtras 1.2",
      sanskritSnippet: "योगश्चित्तवृत्तिनिरोधः ॥",
    },
    likesCount: 29,
    reactions: {
      helpful: 14,
      bhakti: 6,
      namaste: 20,
      jnana: 22,
    },
    userReactions: {
      helpful: ["usr_seed_02"],
      jnana: ["usr_seed_01"],
    },
    commentsCount: 4,
    sharesCount: 5,
    isPinned: false,
    isOfficial: false,
    status: "published",
    reportCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "post-seed-04",
    authorId: "usr_arun_04",
    authorName: "Arunachalam S.",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    authorRole: "seeker",
    authorBadge: "Sādhaka",
    isAnonymous: false,
    category: "sanskrit_chanting",
    title: "The Physics of 432Hz Sound in Vedic Chanting",
    body: "Listening to the SutraSparsh audio recitations tuned to 432Hz with the Tanpura drone has noticeably reduced my heart rate variability during evening japa. Has anyone else felt the acoustic resonance difference compared to standard 440Hz tuning?",
    tags: ["Sanskrit", "Chanting", "432Hz", "Tanpura", "SoundTherapy"],
    likesCount: 21,
    reactions: {
      helpful: 11,
      bhakti: 9,
      namaste: 16,
      jnana: 13,
    },
    userReactions: {},
    commentsCount: 1,
    sharesCount: 3,
    isPinned: false,
    isOfficial: false,
    status: "published",
    reportCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

const SEED_COMMENTS: CommunityComment[] = [
  {
    id: "cmt-seed-01",
    postId: "post-seed-01",
    authorId: "usr_priya_03",
    authorName: "Priya V.",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorRole: "contributor",
    authorBadge: "Abhyāsi",
    body: "This resonates deeply! Before starting any critical project, I take 2 minutes to repeat 'I offer this effort to the Supreme without anxiety for praise or blame.' It transforms stress into dedicated worship.",
    likesCount: 8,
    userLikes: ["usr_meera_01", "usr_seed_04"],
    isHelpfulAnswer: true,
    status: "published",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "cmt-seed-02",
    postId: "post-seed-01",
    parentId: "cmt-seed-01",
    authorId: "usr_meera_01",
    authorName: "Dr. Meera Nambiar",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    authorRole: "expert",
    authorBadge: "Vidvān (Expert)",
    body: "Beautifully articulated Priya. That is precisely the essence of 'Ishvara Pranidhana' interwoven into Karma Yoga.",
    likesCount: 5,
    userLikes: ["usr_priya_03"],
    isHelpfulAnswer: false,
    status: "published",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "cmt-seed-03",
    postId: "post-seed-03",
    authorId: "usr_meera_01",
    authorName: "Dr. Meera Nambiar",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    authorRole: "expert",
    authorBadge: "Vidvān (Expert)",
    body: "I strongly recommend Swami Prabhavananda's commentary 'Patanjali Yoga Sutras' as well as Vyasa's classic commentary. Vyasa points out that Nirodha is not destruction of mind, but steadying of the lake of awareness.",
    likesCount: 11,
    userLikes: ["usr_priya_03", "usr_kabir_02"],
    isHelpfulAnswer: true,
    status: "published",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

export class CommunityService {
  private static instance: CommunityService;
  private posts: CommunityPost[] = [];
  private comments: CommunityComment[] = [];
  private reports: CommunityReport[] = [];
  private notifications: CommunityNotification[] = [];
  private bookmarkedPostIds: Set<string> = new Set();
  private blockedUserIds: Set<string> = new Set();
  private auditLogs: ModerationAuditLog[] = [];
  private listeners: Set<() => void> = new Set();
  private currentUserProfile: CommunityUser | null = null;
  private lastPostTimestamp: number = 0;

  private constructor() {
    this.loadState();
  }

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  private loadState(): void {
    try {
      // 1. Posts
      const storedPosts = safeGetStorage(STORAGE_KEYS.POSTS);
      if (storedPosts) {
        this.posts = JSON.parse(storedPosts);
      } else {
        this.posts = [...SEED_POSTS];
        this.savePosts();
      }

      // 2. Comments
      const storedComments = safeGetStorage(STORAGE_KEYS.COMMENTS);
      if (storedComments) {
        this.comments = JSON.parse(storedComments);
      } else {
        this.comments = [...SEED_COMMENTS];
        this.saveComments();
      }

      // 3. Reports
      const storedReports = safeGetStorage(STORAGE_KEYS.REPORTS);
      if (storedReports) {
        this.reports = JSON.parse(storedReports);
      }

      // 4. Notifications
      const storedNotifs = safeGetStorage(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = [
          {
            id: "notif-01",
            userId: "current-user",
            type: "badge",
            title: "Welcome to Satsang Mandali! 🙏",
            message: "You have joined the SutraSparsh community board. Sādhaka badge active.",
            read: false,
            createdAt: new Date().toISOString(),
          },
        ];
        this.saveNotifications();
      }

      // 5. Bookmarks
      const storedBookmarks = safeGetStorage(STORAGE_KEYS.BOOKMARKS);
      if (storedBookmarks) {
        this.bookmarkedPostIds = new Set(JSON.parse(storedBookmarks));
      }

      // 6. Blocked Users
      const storedBlocked = safeGetStorage(STORAGE_KEYS.BLOCKED);
      if (storedBlocked) {
        this.blockedUserIds = new Set(JSON.parse(storedBlocked));
      }

      // 7. Audit Logs
      const storedAudit = safeGetStorage(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      }

      // 8. User Profile
      this.syncUserProfile();
    } catch (e) {
      console.warn("CommunityService load error, resetting to seed defaults", e);
      this.posts = [...SEED_POSTS];
      this.comments = [...SEED_COMMENTS];
    }
  }

  public syncUserProfile(): CommunityUser {
    const authUser = authService.getCurrentUser();
    const stored = safeGetStorage(STORAGE_KEYS.CURRENT_USER_PROFILE);
    let customBio = "Practicing daily Brahma Muhurta sadhana and contemplation.";
    let role: CommunityRole = "seeker";
    let badge: CommunityBadge = "Sādhaka";

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.bio) customBio = parsed.bio;
        if (parsed.role) role = parsed.role;
        if (parsed.badge) badge = parsed.badge;
      } catch {
        // ignore
      }
    }

    // Admin / Moderator check
    if (authUser?.email && (authUser.email.includes("admin") || authUser.email === "vishal.kr.gupta@gmail.com")) {
      role = "admin";
      badge = "Moderator";
    }

    const profile: CommunityUser = {
      id: authUser?.uid || "usr_guest_sadhaka",
      appUserId: authUser?.uid || "usr_guest_sadhaka",
      displayName: authUser?.displayName || "Sādhaka Seeker",
      avatarUrl:
        authUser?.photoURL ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: customBio,
      role,
      badge,
      status: "active",
      isAnonymous: false,
      postCount: this.posts.filter((p) => p.authorId === (authUser?.uid || "usr_guest_sadhaka")).length,
      reputation: 108,
      createdAt: authUser?.createdAt || new Date().toISOString(),
    };

    this.currentUserProfile = profile;
    return profile;
  }

  public getCurrentProfile(): CommunityUser {
    if (!this.currentUserProfile) {
      return this.syncUserProfile();
    }
    return this.currentUserProfile;
  }

  public updateProfile(updates: Partial<Pick<CommunityUser, "displayName" | "bio" | "avatarUrl" | "role" | "badge">>): CommunityUser {
    const current = this.getCurrentProfile();
    const updated: CommunityUser = {
      ...current,
      ...updates,
    };
    this.currentUserProfile = updated;
    safeSetStorage(STORAGE_KEYS.CURRENT_USER_PROFILE, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- Satsang Maryada Guidelines Consent (FR-NAV-02) ---
  public hasAcceptedGuidelines(): boolean {
    return safeGetStorage(STORAGE_KEYS.GUIDELINES) === "true";
  }

  public acceptGuidelines(): void {
    safeSetStorage(STORAGE_KEYS.GUIDELINES, "true");
    this.logEvent("guidelines_accepted", { timestamp: Date.now() });
    this.notify();
  }

  // --- Posts Feed (FR-FED) ---
  public getPosts(options?: {
    category?: CommunityCategory;
    sort?: "newest" | "popular" | "my_discussions" | "latest" | "top" | "bookmarked" | "mine";
    searchQuery?: string;
  }): CommunityPost[] {
    const current = this.getCurrentProfile();
    let result = this.posts.filter(
      (p) => p.status === "published" && !this.blockedUserIds.has(p.authorId)
    );

    // Filter by Category
    if (options?.category && options.category !== "all") {
      result = result.filter((p) => p.category === options.category);
    }

    // Filter by Search Query (with diacritic-insensitive normalization)
    if (options?.searchQuery?.trim()) {
      const q = normalizeDiacritics(options.searchQuery.trim());
      result = result.filter(
        (p) =>
          normalizeDiacritics(p.title).includes(q) ||
          normalizeDiacritics(p.body).includes(q) ||
          p.tags.some((t) => normalizeDiacritics(t).includes(q)) ||
          normalizeDiacritics(p.authorName).includes(q) ||
          (p.scriptureRef && normalizeDiacritics(p.scriptureRef.verseRef).includes(q))
      );
      this.logEvent("search_performed", { query: q });
    }

    // Filter / Sort by 3 Predicates:
    // a. 'bookmarked' (auxiliary saved list)
    if (options?.sort === "bookmarked") {
      result = result.filter((p) => this.bookmarkedPostIds.has(p.id));
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return result;
    }

    // b. 'my_discussions' / 'mine': Filter board to display only posts where current user is author
    if (options?.sort === "my_discussions" || options?.sort === "mine") {
      result = result.filter((p) => p.authorId === current.id);
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return result;
    }

    // c. 'popular' / 'top': Sort posts based on engagement metrics (combining likes and reply volume)
    if (options?.sort === "popular" || options?.sort === "top") {
      result.sort((a, b) => {
        const engA = (a.likesCount || 0) + (a.commentsCount || 0) * 2 + (a.sharesCount || 0);
        const engB = (b.likesCount || 0) + (b.commentsCount || 0) * 2 + (b.sharesCount || 0);
        if (engB !== engA) return engB - engA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return result;
    }

    // d. 'newest' / 'latest': Reverse chronological order based on creation timestamps
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }

  public getPostById(id: string): CommunityPost | undefined {
    return this.posts.find((p) => p.id === id);
  }

  // --- Create & Manage Posts (FR-PST) ---
  public createPost(data: {
    title: string;
    body: string;
    category: CommunityCategory;
    tags?: string[];
    scriptureRef?: ScriptureRef;
    isAnonymous?: boolean;
    skipRateLimit?: boolean;
  }): { success: boolean; error?: string; post?: CommunityPost; crisisDetected?: boolean } {
    const profile = this.getCurrentProfile();

    if (profile.status === "muted" || profile.status === "banned") {
      return { success: false, error: "Your account is currently restricted from posting in Satsang." };
    }

    if (!data.title?.trim() || data.title.length < 5) {
      return { success: false, error: "Please provide a meaningful title (min 5 characters)." };
    }

    if (!data.body?.trim() || data.body.length < 15) {
      return { success: false, error: "Please provide a contemplative reflection or question (min 15 characters)." };
    }

    if (data.body.length > 2000) {
      return { success: false, error: "Post exceeds the 2,000 character maximum limit." };
    }

    // Rate Limiting: 1 post per 30 seconds unless skipRateLimit (e.g. testing or admin)
    const now = Date.now();
    if (!data.skipRateLimit && now - this.lastPostTimestamp < 30 * 1000) {
      return { success: false, error: "Please pause and reflect a moment before posting again (rate limit: 30s)." };
    }

    // Check for crisis terms (FR-MOD-05)
    const lowerBody = (data.title + " " + data.body).toLowerCase();
    const hasCrisis = CRISIS_TERMS.some((term) => lowerBody.includes(term));

    // Content Blocklist / Profanity check
    const hasBlockedTerm = BLOCKED_TERMS.some((term) => lowerBody.includes(term));
    if (hasBlockedTerm) {
      return {
        success: false,
        error: "Your post contains prohibited promotional, financial or external link terms under Satsang Maryada.",
      };
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      authorId: profile.id,
      authorName: data.isAnonymous ? "Gupta Sādhaka (Anonymous)" : profile.displayName,
      authorAvatar: data.isAnonymous
        ? "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80"
        : profile.avatarUrl,
      authorRole: profile.role,
      authorBadge: profile.badge,
      isAnonymous: Boolean(data.isAnonymous),
      category: data.category || "reflections_qa",
      title: data.title.trim(),
      body: data.body.trim(),
      tags: data.tags || ["Satsang", "Sadhana"],
      scriptureRef: data.scriptureRef,
      likesCount: 1, // optimistic self-like
      reactions: {
        helpful: 1,
        bhakti: 0,
        namaste: 0,
        jnana: 0,
      },
      userReactions: {
        helpful: [profile.id],
      },
      commentsCount: 0,
      sharesCount: 0,
      isPinned: false,
      isOfficial: profile.role === "admin" || profile.role === "expert",
      status: "published",
      reportCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.posts.unshift(newPost);
    this.lastPostTimestamp = now;
    this.savePosts();
    this.logEvent("post_created", { postId: newPost.id, category: newPost.category });
    this.notify();

    return { success: true, post: newPost, crisisDetected: hasCrisis };
  }

  public editPost(postId: string, title: string, body: string): { success: boolean; error?: string } {
    const post = this.posts.find((p) => p.id === postId);
    const profile = this.getCurrentProfile();

    if (!post) return { success: false, error: "Post not found." };
    if (post.authorId !== profile.id && profile.role !== "admin" && profile.role !== "moderator") {
      return { success: false, error: "You can only edit your own posts." };
    }

    post.title = title.trim();
    post.body = body.trim();
    post.editedAt = new Date().toISOString();
    this.savePosts();
    this.notify();
    return { success: true };
  }

  public deletePost(postId: string): { success: boolean; error?: string } {
    const post = this.posts.find((p) => p.id === postId);
    const profile = this.getCurrentProfile();

    if (!post) return { success: false, error: "Post not found." };
    if (post.authorId !== profile.id && profile.role !== "admin" && profile.role !== "moderator") {
      return { success: false, error: "Permission denied." };
    }

    // Soft delete
    post.status = "deleted";
    this.savePosts();
    this.notify();
    return { success: true };
  }

  // --- Reactions (FR-ENG-01) ---
  public toggleReaction(postId: string, reactionType: "helpful" | "bhakti" | "namaste" | "jnana"): void {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;
    const profile = this.getCurrentProfile();
    const userId = profile.id;

    if (!post.userReactions) post.userReactions = {};
    if (!post.userReactions[reactionType]) post.userReactions[reactionType] = [];

    const userList = post.userReactions[reactionType];
    const index = userList.indexOf(userId);

    if (index >= 0) {
      // Remove reaction
      userList.splice(index, 1);
      post.reactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1);
    } else {
      // Add reaction
      userList.push(userId);
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;

      // Notify post author if not self
      if (post.authorId !== userId) {
        this.addNotification({
          userId: post.authorId,
          type: "reaction",
          title: "New Pranāma / Reaction 🙏",
          message: `${profile.displayName} reacted ${reactionType} to your post: "${post.title.substring(0, 40)}..."`,
          targetPostId: post.id,
        });
      }
    }

    // Recompute total likes count
    post.likesCount =
      (post.reactions.helpful || 0) +
      (post.reactions.bhakti || 0) +
      (post.reactions.namaste || 0) +
      (post.reactions.jnana || 0);

    this.savePosts();
    this.logEvent("reaction_added", { postId, reactionType });
    this.notify();
  }

  /**
   * Check if a specific post is liked by the current (or given) user.
   */
  public isPostLikedByUser(postId: string, userId?: string): boolean {
    const post = this.getPostById(postId);
    if (!post) return false;
    const currentUserId = userId || this.getCurrentProfile().id;
    if (post.userLikes && post.userLikes.includes(currentUserId)) return true;
    if (post.userReactions?.bhakti?.includes(currentUserId) || post.userReactions?.helpful?.includes(currentUserId)) {
      return true;
    }
    return false;
  }

  /**
   * Interactive Animated Like Micro-feature:
   * Toggles the user's like on a post, updates counts and notifications.
   */
  public toggleLike(postId: string): { success: boolean; isLiked: boolean; likesCount: number } {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return { success: false, isLiked: false, likesCount: 0 };
    const profile = this.getCurrentProfile();
    const userId = profile.id;

    if (!post.userLikes) {
      post.userLikes = [];
      if (post.userReactions?.bhakti) {
        post.userReactions.bhakti.forEach((uid) => {
          if (!post.userLikes!.includes(uid)) post.userLikes!.push(uid);
        });
      }
    }

    const idx = post.userLikes.indexOf(userId);
    let isLiked = false;

    if (idx >= 0) {
      // Unlike
      post.userLikes.splice(idx, 1);
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
      if (post.reactions?.bhakti && post.userReactions?.bhakti?.includes(userId)) {
        post.reactions.bhakti = Math.max(0, post.reactions.bhakti - 1);
        post.userReactions.bhakti = post.userReactions.bhakti.filter((id) => id !== userId);
      }
      isLiked = false;
    } else {
      // Like
      post.userLikes.push(userId);
      post.likesCount = (post.likesCount || 0) + 1;
      if (!post.reactions) post.reactions = { helpful: 0, bhakti: 0, namaste: 0, jnana: 0 };
      if (!post.userReactions) post.userReactions = {};
      if (!post.userReactions.bhakti) post.userReactions.bhakti = [];
      post.reactions.bhakti = (post.reactions.bhakti || 0) + 1;
      post.userReactions.bhakti.push(userId);
      isLiked = true;

      // Send notification to author if not self
      if (post.authorId !== userId) {
        this.addNotification({
          userId: post.authorId,
          type: "reaction",
          title: "New Heart & Blessing ❤️",
          message: `${profile.displayName} liked your reflection: "${post.title.substring(0, 35)}..."`,
          targetPostId: post.id,
        });
      }
    }

    this.savePosts();
    this.logEvent("post_like_toggled", { postId, isLiked, likesCount: post.likesCount });
    this.notify();
    return { success: true, isLiked, likesCount: post.likesCount };
  }

  // --- Comments & Nested Replies (FR-ENG-02) ---
  public getComments(postId: string): CommunityComment[] {
    return this.comments.filter((c) => c.postId === postId && c.status === "published");
  }

  /**
   * Threaded Comments with parentId relational mapping.
   * Returns root comments with their nested replies attached.
   */
  public getThreadedComments(postId: string): ThreadedComment[] {
    const allComments = this.getComments(postId);
    const rootComments = allComments.filter((c) => !c.parentId);
    return rootComments.map((root) => ({
      ...root,
      replies: allComments
        .filter((c) => c.parentId === root.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));
  }

  public addComment(postId: string, body: string, parentId?: string): { success: boolean; error?: string; comment?: CommunityComment } {
    const profile = this.getCurrentProfile();
    const post = this.posts.find((p) => p.id === postId);

    if (!post) return { success: false, error: "Post not found." };
    if (!body?.trim() || body.length < 3) {
      return { success: false, error: "Comment is too short." };
    }
    if (body.length > 1000) {
      return { success: false, error: "Comment exceeds the 1,000 character maximum limit." };
    }

    const newComment: CommunityComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      postId,
      parentId,
      authorId: profile.id,
      authorName: profile.displayName,
      authorAvatar: profile.avatarUrl,
      authorRole: profile.role,
      authorBadge: profile.badge,
      body: body.trim(),
      likesCount: 0,
      userLikes: [],
      isHelpfulAnswer: false,
      status: "published",
      createdAt: new Date().toISOString(),
    };

    this.comments.push(newComment);
    post.commentsCount = (post.commentsCount || 0) + 1;
    this.saveComments();
    this.savePosts();

    // Send notification
    if (parentId) {
      const parentComment = this.comments.find((c) => c.id === parentId);
      if (parentComment && parentComment.authorId !== profile.id) {
        this.addNotification({
          userId: parentComment.authorId,
          type: "reply",
          title: "New Reply in Satsang 💬",
          message: `${profile.displayName} replied to your comment on "${post.title.substring(0, 35)}..."`,
          targetPostId: postId,
        });
      }
    } else if (post.authorId !== profile.id) {
      this.addNotification({
        userId: post.authorId,
        type: "comment",
        title: "New Reflection on Your Post 💬",
        message: `${profile.displayName} commented on "${post.title.substring(0, 35)}..."`,
        targetPostId: postId,
      });
    }

    this.logEvent("comment_added", { postId, commentId: newComment.id });
    this.notify();
    return { success: true, comment: newComment };
  }

  public markCommentHelpful(commentId: string): void {
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return;
    const post = this.posts.find((p) => p.id === comment.postId);
    const profile = this.getCurrentProfile();

    // Only post author or moderator can mark best answer / helpful
    if (post?.authorId !== profile.id && profile.role !== "admin" && profile.role !== "moderator") return;

    comment.isHelpfulAnswer = !comment.isHelpfulAnswer;
    this.saveComments();
    this.notify();
  }

  public deleteComment(commentId: string): void {
    const comment = this.comments.find((c) => c.id === commentId);
    const profile = this.getCurrentProfile();
    if (!comment) return;

    if (comment.authorId !== profile.id && profile.role !== "admin" && profile.role !== "moderator") return;

    comment.status = "deleted";
    const post = this.posts.find((p) => p.id === comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
      this.savePosts();
    }
    this.saveComments();
    this.notify();
  }

  // --- Bookmarking (FR-ENG-05) ---
  public toggleBookmark(postId: string): boolean {
    if (this.bookmarkedPostIds.has(postId)) {
      this.bookmarkedPostIds.delete(postId);
    } else {
      this.bookmarkedPostIds.add(postId);
    }
    safeSetStorage(STORAGE_KEYS.BOOKMARKS, JSON.stringify(Array.from(this.bookmarkedPostIds)));
    this.notify();
    return this.bookmarkedPostIds.has(postId);
  }

  public isBookmarked(postId: string): boolean {
    return this.bookmarkedPostIds.has(postId);
  }

  // --- Safety, Reporting & User Blocking (FR-MOD) ---
  public reportContent(params: {
    targetType: "post" | "comment" | "user";
    targetId: string;
    reason: CommunityReport["reason"];
    note?: string;
  }): { success: boolean; message: string } {
    const profile = this.getCurrentProfile();
    const existing = this.reports.find(
      (r) => r.targetId === params.targetId && r.reporterId === profile.id && r.status === "pending"
    );

    if (existing) {
      return { success: false, message: "You have already reported this item. Our moderators are reviewing it." };
    }

    let summary = "Reported content";
    if (params.targetType === "post") {
      const p = this.posts.find((x) => x.id === params.targetId);
      if (p) {
        summary = `Post: "${p.title}" by ${p.authorName}`;
        p.reportCount = (p.reportCount || 0) + 1;

        // Auto-hide threshold (FR-MOD-03: auto-hide pending review after 3 reports)
        if (p.reportCount >= 3) {
          p.status = "hidden";
        }
        this.savePosts();
      }
    } else if (params.targetType === "comment") {
      const c = this.comments.find((x) => x.id === params.targetId);
      if (c) summary = `Comment: "${c.body.substring(0, 40)}" by ${c.authorName}`;
    }

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: params.targetType,
      targetId: params.targetId,
      targetSummary: summary,
      reporterId: profile.id,
      reason: params.reason,
      note: params.note,
      status: "pending",
      severity: params.reason === "harassment" || params.reason === "disrespect" ? "high" : "medium",
      createdAt: new Date().toISOString(),
    };

    this.reports.push(newReport);
    this.saveReports();
    this.logEvent("report_submitted", { reportId: newReport.id, reason: params.reason });
    this.notify();

    return {
      success: true,
      message: "Thank you for upholding Satsang Maryada. The report has been sent to our moderators.",
    };
  }

  public blockUser(userIdToBlock: string): void {
    this.blockedUserIds.add(userIdToBlock);
    safeSetStorage(STORAGE_KEYS.BLOCKED, JSON.stringify(Array.from(this.blockedUserIds)));
    this.logEvent("user_blocked", { blockedUserId: userIdToBlock });
    this.notify();
  }

  public unblockUser(userId: string): void {
    this.blockedUserIds.delete(userId);
    safeSetStorage(STORAGE_KEYS.BLOCKED, JSON.stringify(Array.from(this.blockedUserIds)));
    this.notify();
  }

  public isUserBlocked(userId: string): boolean {
    return this.blockedUserIds.has(userId);
  }

  // --- Moderator / Admin Console (FR-MOD-10..19, FR-ADM) ---
  public getReportsQueue(): CommunityReport[] {
    return [...this.reports].sort((a, b) => {
      // Sort by pending first, then by date
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public resolveReport(reportId: string, action: "dismiss" | "remove_post" | "warn" | "mute", resolutionNote: string): void {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return;
    const profile = this.getCurrentProfile();

    report.status = action === "dismiss" ? "dismissed" : "actioned";
    report.resolution = resolutionNote;

    if (action === "remove_post" && report.targetType === "post") {
      const post = this.posts.find((p) => p.id === report.targetId);
      if (post) post.status = "hidden";
      this.savePosts();
    }

    // Log immutable audit trail (FR-MOD-16)
    this.logAudit({
      moderatorId: profile.id,
      action: action === "dismiss" ? "dismiss_report" : action === "remove_post" ? "remove_post" : "warn_user",
      targetType: report.targetType,
      targetId: report.targetId,
      reasonCode: report.reason,
      note: resolutionNote,
    });

    this.saveReports();
    this.notify();
  }

  public togglePinPost(postId: string): void {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;
    const profile = this.getCurrentProfile();

    post.isPinned = !post.isPinned;
    this.logAudit({
      moderatorId: profile.id,
      action: post.isPinned ? "pin_post" : "unpin_post",
      targetType: "post",
      targetId: postId,
      reasonCode: "curation",
      note: post.isPinned ? "Pinned by moderator" : "Unpinned by moderator",
    });

    this.savePosts();
    this.notify();
  }

  public getAuditLogs(): ModerationAuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private logAudit(entry: Omit<ModerationAuditLog, "id" | "timestamp">): void {
    const log: ModerationAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs.slice(0, 100)));
    } catch {
      // ignore
    }
  }

  // --- Notifications (FR-NTF) ---
  public getNotifications(): CommunityNotification[] {
    return [...this.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markNotificationsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
    this.notify();
  }

  private addNotification(params: Omit<CommunityNotification, "id" | "read" | "createdAt">): void {
    const newNotif: CommunityNotification = {
      ...params,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.saveNotifications();
  }

  // --- Analytics & Metrics (FR-ANL, BR-07) ---
  public getAnalyticsSummary(): CommunityAnalyticsSummary {
    const totalReactions = this.posts.reduce(
      (acc, p) =>
        acc +
        (p.reactions.helpful || 0) +
        (p.reactions.bhakti || 0) +
        (p.reactions.namaste || 0) +
        (p.reactions.jnana || 0),
      0
    );

    return {
      dau: 420,
      mau: 1850,
      totalPosts: this.posts.filter((p) => p.status === "published").length,
      totalComments: this.comments.filter((c) => c.status === "published").length,
      totalReactions,
      resolvedReports: this.reports.filter((r) => r.status === "actioned" || r.status === "dismissed").length,
      supportDeflectionRate: "14.2%",
    };
  }

  private logEvent(eventName: string, data: Record<string, any>): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:community_event", {
          detail: { event: eventName, data, timestamp: Date.now() },
        })
      );
    }
  }

  // --- Persistence Helpers ---
  private savePosts(): void {
    safeSetStorage(STORAGE_KEYS.POSTS, JSON.stringify(this.posts));
  }

  private saveComments(): void {
    safeSetStorage(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
  }

  private saveReports(): void {
    safeSetStorage(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
  }

  private saveNotifications(): void {
    safeSetStorage(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const communityService = CommunityService.getInstance();
