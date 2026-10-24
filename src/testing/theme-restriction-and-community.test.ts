/**
 * SutraSparsh Theme Restriction & Community Board Interactive Micro-features Test Suite
 * Validates:
 * 1. Theme Whitelist Policy (Parchment Dawn & Golden Hour exclusively)
 * 2. config.json Schema & Reading
 * 3. Secure Fallback Logic
 * 4. Admin Role Override Capability
 * 5. CommunityBoardView: Animated Like Button (Optimistic UI & Spring Transition)
 * 6. CommunityBoardView: Threaded Replies (parentId relational mapping, collapse/expand)
 * 7. CommunityBoardView: 3-Criteria Filtering & Sorting ('Newest', 'Popular', 'My Discussions')
 */

// Mock localStorage and window in Node test environment if undefined
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] || null,
  };
}

if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    location: {
      origin: "https://sutrasparsh.com",
      pathname: "/",
      search: "",
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  (globalThis as any).CustomEvent = class {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

import * as fs from "fs";
import { themeConfigService } from "../services/theme-config.service.js";
import { communityService } from "../services/community.service.js";
import { authService } from "../services/auth.service.js";

async function runThemeAndCommunityTests() {
  console.log("=== Theme Restriction & Community Micro-features Verification Suite ===\n");
  let passed = 0;
  let total = 0;

  function assert(desc: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
    }
  }

  // =========================================================================
  // SUITE 1: Theme Whitelist Policy & config.json Schema
  // =========================================================================
  console.log("[Test Suite 1: Theme Whitelist & config.json Integrity]");
  const configRaw = fs.readFileSync("./config.json", "utf-8");
  const config = JSON.parse(configRaw);

  assert("config.json exists and parses cleanly", Boolean(config && config.themeSettings));
  assert("Default theme in config.json is 'light' (Parchment Dawn)", config.themeSettings.defaultTheme === "light");
  assert("Fallback theme in config.json is 'light'", config.themeSettings.fallbackTheme === "light");
  assert("Permitted themes list has exactly 2 themes", config.themeSettings.permittedThemes.length === 2);

  const themeIds = config.themeSettings.permittedThemes.map((t: any) => t.id);
  assert("Permitted themes include 'light' (Parchment Dawn)", themeIds.includes("light"));
  assert("Permitted themes include 'golden-hour' (Golden Hour)", themeIds.includes("golden-hour"));
  assert("Permitted themes do NOT include 'sandstone'", !themeIds.includes("sandstone"));
  assert("Permitted themes do NOT include 'amethyst'", !themeIds.includes("amethyst"));
  assert("Permitted themes do NOT include 'festival'", !themeIds.includes("festival"));
  assert("Permitted themes do NOT include 'prism-pulse'", !themeIds.includes("prism-pulse"));

  // =========================================================================
  // SUITE 2: ThemeConfigService Whitelist Enforcement & Fallbacks
  // =========================================================================
  console.log("\n[Test Suite 2: ThemeConfigService & Fallback Logic]");
  const permittedIds = themeConfigService.getPermittedThemeIds();
  assert("Service returns permitted IDs matching config", permittedIds.length === 2 && permittedIds.includes("light") && permittedIds.includes("golden-hour"));

  assert("'light' is permitted", themeConfigService.isThemePermitted("light") === true);
  assert("'golden-hour' is permitted", themeConfigService.isThemePermitted("golden-hour") === true);
  assert("'sandstone' is rejected", themeConfigService.isThemePermitted("sandstone") === false);
  assert("'amethyst' is rejected", themeConfigService.isThemePermitted("amethyst") === false);
  assert("'festival' is rejected", themeConfigService.isThemePermitted("festival") === false);
  assert("'prism-pulse' is rejected", themeConfigService.isThemePermitted("prism-pulse") === false);
  assert("Invalid arbitrary string is rejected", themeConfigService.isThemePermitted("neon-matrix") === false);

  // Fallback verification
  assert("Fallback: 'sandstone' safely defaults to 'light'", themeConfigService.sanitizeTheme("sandstone") === "light");
  assert("Fallback: 'amethyst' safely defaults to 'light'", themeConfigService.sanitizeTheme("amethyst") === "light");
  assert("Fallback: 'festival' safely defaults to 'light'", themeConfigService.sanitizeTheme("festival") === "light");
  assert("Fallback: 'prism-pulse' safely defaults to 'light'", themeConfigService.sanitizeTheme("prism-pulse") === "light");
  assert("Fallback: null/undefined safely defaults to 'light'", themeConfigService.sanitizeTheme(null) === "light");
  assert("Valid theme 'golden-hour' remains 'golden-hour'", themeConfigService.sanitizeTheme("golden-hour") === "golden-hour");
  assert("Valid theme 'light' remains 'light'", themeConfigService.sanitizeTheme("light") === "light");

  // Cycle toggle logic
  assert("Cycle from 'light' gives 'golden-hour'", themeConfigService.getNextPermittedTheme("light") === "golden-hour");
  assert("Cycle from 'golden-hour' gives 'light'", themeConfigService.getNextPermittedTheme("golden-hour") === "light");

  // =========================================================================
  // SUITE 3: Admin Role Override Capability
  // =========================================================================
  console.log("\n[Test Suite 3: Admin Role Theme Override Capability]");
  const regularUser: any = {
    uid: "usr_seeker_regular",
    displayName: "Sadhaka Seeker",
    email: "seeker@example.com",
    role: "seeker",
  };

  const adminUser: any = {
    uid: "usr_admin_vishal",
    displayName: "Vishal Gupta",
    email: "vishal.kr.gupta@gmail.com",
    role: "admin",
  };

  // Attempt override as non-admin
  const nonAdminOverride = themeConfigService.adminOverrideTheme("golden-hour", regularUser);
  assert("Non-admin theme override is rejected", nonAdminOverride.success === false);

  // Attempt override as admin
  const adminOverride = themeConfigService.adminOverrideTheme("golden-hour", adminUser);
  assert("Admin role theme override succeeds", adminOverride.success === true && adminOverride.activeTheme === "golden-hour");
  assert("Active theme is updated to 'golden-hour'", themeConfigService.getActiveTheme() === "golden-hour");

  // Admin switch back to 'light'
  const adminSwitchBack = themeConfigService.adminOverrideTheme("light", adminUser);
  assert("Admin can switch back to 'light'", adminSwitchBack.success === true && adminSwitchBack.activeTheme === "light");
  assert("Active theme is updated to 'light'", themeConfigService.getActiveTheme() === "light");

  themeConfigService.clearAdminOverride();

  // =========================================================================
  // SUITE 4: CommunityBoardView - Animated Like Button (Optimistic Strategy)
  // =========================================================================
  console.log("\n[Test Suite 4: Animated Like Button & Optimistic Micro-feature]");
  const samplePosts = communityService.getPosts();
  assert("Sample posts exist for like test", samplePosts.length > 0);
  const targetPost = samplePosts[0];
  const initialLikes = targetPost.likesCount || 0;
  const initialLikedByUser = communityService.isPostLikedByUser(targetPost.id);

  // 1. Toggle like
  const likeResult1 = communityService.toggleLike(targetPost.id);
  assert("toggleLike returns success", likeResult1.success === true);
  assert("toggleLike returns toggled isLiked state", likeResult1.isLiked === !initialLikedByUser);
  assert(
    "likesCount is adjusted accurately",
    likeResult1.isLiked ? likeResult1.likesCount === initialLikes + 1 : likeResult1.likesCount === Math.max(0, initialLikes - 1)
  );

  // 2. Toggle like again (unlike)
  const likeResult2 = communityService.toggleLike(targetPost.id);
  assert("Second toggle reverts isLiked state", likeResult2.isLiked === initialLikedByUser);
  assert("Second toggle reverts likesCount", likeResult2.likesCount === initialLikes);

  // =========================================================================
  // SUITE 5: CommunityBoardView - Nested Reply Threading (parentId Relational Mapping)
  // =========================================================================
  console.log("\n[Test Suite 5: Nested Reply Threading & parentId Mapping]");
  const parentPostId = targetPost.id;

  // Add root comment
  const rootCommentRes = communityService.addComment(
    parentPostId,
    "This is a root contemplative inquiry on verse karma yoga."
  );
  assert("Root comment created without parentId", rootCommentRes.success === true && !rootCommentRes.comment?.parentId);
  const rootCommentId = rootCommentRes.comment!.id;

  // Add nested reply referencing parentId
  const nestedReplyRes = communityService.addComment(
    parentPostId,
    "Here is a thoughtful nested response explaining the principle.",
    rootCommentId
  );
  assert(
    "Nested reply created with parentId relational mapping",
    nestedReplyRes.success === true && nestedReplyRes.comment?.parentId === rootCommentId
  );
  const nestedReplyId = nestedReplyRes.comment!.id;

  // Query threaded comments
  const threaded = communityService.getThreadedComments(parentPostId);
  const targetRoot = threaded.find((c) => c.id === rootCommentId);
  assert("Threaded comments structure contains root comment", Boolean(targetRoot));
  assert("Threaded comment contains nested replies array", Array.isArray(targetRoot?.replies));
  assert(
    "Nested reply is correctly mapped under parent root comment",
    Boolean(targetRoot?.replies.some((r) => r.id === nestedReplyId))
  );

  // =========================================================================
  // SUITE 6: CommunityBoardView - Multi-Criteria Filtering & Sorting System
  // =========================================================================
  console.log("\n[Test Suite 6: Multi-Criteria Filter & Sort Toolbar]");
  // Test a. 'newest': reverse chronological order
  const newestFeed = communityService.getPosts({ sort: "newest" });
  assert("Newest sort returns posts", newestFeed.length > 0);
  let isChronological = true;
  for (let i = 1; i < newestFeed.length; i++) {
    // If neither is pinned, verify timestamps
    if (!newestFeed[i - 1].isPinned && !newestFeed[i].isPinned) {
      const prevTime = new Date(newestFeed[i - 1].createdAt).getTime();
      const currTime = new Date(newestFeed[i].createdAt).getTime();
      if (prevTime < currTime) {
        isChronological = false;
        break;
      }
    }
  }
  assert("Newest sort orders non-pinned posts in reverse chronological order", isChronological);

  // Test b. 'popular': sorted by engagement metrics
  const popularFeed = communityService.getPosts({ sort: "popular" });
  assert("Popular sort returns posts", popularFeed.length > 0);
  let isPopularOrdered = true;
  for (let i = 1; i < popularFeed.length; i++) {
    const engPrev = (popularFeed[i - 1].likesCount || 0) + (popularFeed[i - 1].commentsCount || 0) * 2;
    const engCurr = (popularFeed[i].likesCount || 0) + (popularFeed[i].commentsCount || 0) * 2;
    if (engPrev < engCurr) {
      isPopularOrdered = false;
      break;
    }
  }
  assert("Popular sort orders by engagement metrics (likes + replies)", isPopularOrdered);

  // Test c. 'my_discussions': filtered to current authenticated user
  const currentProfile = communityService.getCurrentProfile();
  // Create a post authored by current user
  const myPost = communityService.createPost({
    title: "My Personal Discussion on Chanting Gayatri Mantra",
    body: "Reflecting on daily morning chanting of Gayatri mantra. Has anyone noticed changes in concentration?",
    category: "sanskrit_chanting",
    skipRateLimit: true,
  });
  assert("Current user post created", myPost.success === true);

  const myDiscussionsFeed = communityService.getPosts({ sort: "my_discussions" });
  assert("My Discussions returns posts", myDiscussionsFeed.length > 0);
  assert(
    "My Discussions strictly filters to current user's authorId",
    myDiscussionsFeed.every((p) => p.authorId === currentProfile.id)
  );

  // =========================================================================
  // SUITE 7: Component Code Structure & UI Compliance Verification
  // =========================================================================
  console.log("\n[Test Suite 7: CommunityBoardView & App.tsx Component Auditing]");
  const commViewSrc = fs.readFileSync("./src/components/community/CommunityBoardView.tsx", "utf-8");
  const moreViewSrc = fs.readFileSync("./src/components/MoreView.tsx", "utf-8");
  const sadhakaSrc = fs.readFileSync("./src/components/SadhakaProfileModal.tsx", "utf-8");
  const adminSrc = fs.readFileSync("./src/components/AdminOperationsConsole.tsx", "utf-8");
  const appSrc = fs.readFileSync("./src/App.tsx", "utf-8");

  // Multi-criteria 3 criteria in CommunityBoardView
  assert("CommunityBoardView toolbar implements 'newest' criterion", commViewSrc.includes('sortOption === "newest"'));
  assert("CommunityBoardView toolbar implements 'popular' criterion", commViewSrc.includes('sortOption === "popular"'));
  assert("CommunityBoardView toolbar implements 'my_discussions' criterion", commViewSrc.includes('sortOption === "my_discussions"'));
  assert("CommunityBoardView persists active sort to localStorage", commViewSrc.includes("sutrasparsh_community_active_sort"));

  // Animated like button
  assert("CommunityBoardView implements animated like button", commViewSrc.includes("handleLikePost") && commViewSrc.includes("motion.button"));
  assert("CommunityBoardView implements optimistic like data structure", commViewSrc.includes("optimisticLikes") && commViewSrc.includes("isBouncing"));

  // Threaded replies
  assert("CommunityBoardView implements threaded replies toggle", commViewSrc.includes("toggleThreadExpanded") && commViewSrc.includes("getThreadedComments"));
  assert("CommunityBoardView implements inline threaded reply composer", commViewSrc.includes("handleSubmitInlineComment") && commViewSrc.includes("parentCommentId"));
  assert("CommunityBoardView renders nested replies with parentId indent", commViewSrc.includes("rootComment.replies") && commViewSrc.includes("border-l-2"));

  // Empty state handling
  assert("CommunityBoardView includes empty state handling for my_discussions", commViewSrc.includes("haven't posted any reflections"));
  assert("CommunityBoardView includes empty state handling for popular", commViewSrc.includes("No trending discussions"));

  // Theme Whitelist in UI
  assert("App.tsx initializes theme via themeConfigService", appSrc.includes("themeConfigService.getActiveTheme()"));
  assert("App.tsx toggles strictly between permitted themes", appSrc.includes("themeConfigService.getNextPermittedTheme(theme)"));
  assert("MoreView strictly presents Parchment Dawn & Golden Hour", moreViewSrc.includes("Parchment Dawn") && moreViewSrc.includes("Golden Hour") && !moreViewSrc.includes("onSelectTheme(\"sandstone\")"));
  assert("SadhakaProfileModal strictly presents Parchment Dawn & Golden Hour", sadhakaSrc.includes("Parchment Dawn") && sadhakaSrc.includes("Golden Hour") && !sadhakaSrc.includes("onSelectTheme(\"sandstone\")"));
  assert("AdminOperationsConsole includes Sacred Atmosphere & Whitelist Management", adminSrc.includes("Sacred Atmosphere & Whitelist Management") && adminSrc.includes("themeConfigService.adminOverrideTheme"));

  console.log(`\n=== Verification Complete: ${passed}/${total} assertions passed ===\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runThemeAndCommunityTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
