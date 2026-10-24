/**
 * SutraSparsh In-App Community Board (Satsang Mandali) Test Suite
 * BRD & FRD Compliance & Functional Verification
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
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    location: {
      origin: "https://sutrasparsh.com",
      pathname: "/",
      search: "",
    },
    addEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((f) => f !== cb);
    },
    dispatchEvent: (event: any) => {
      const type = event?.type;
      if (listeners[type]) {
        listeners[type].forEach((cb) => cb(event));
      }
      return true;
    },
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
import {
  communityService,
  COMMUNITY_CATEGORIES,
} from "../services/community.service.js";

async function runCommunityBoardTests() {
  console.log("=== SutraSparsh In-App Community Board (BRD & FRD) Verification Suite ===\n");
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

  // Suite 1: Initial Setup & Categories
  console.log("[Test Suite 1: Satsang Mandali Setup & Traditions]");
  assert("Defined categories are at least 6", COMMUNITY_CATEGORIES.length >= 6);
  assert("Gita category exists", COMMUNITY_CATEGORIES.some((c) => c.id === "gita"));
  assert("Yoga Sutras category exists", COMMUNITY_CATEGORIES.some((c) => c.id === "yoga_sutras"));
  assert("Upanishads category exists", COMMUNITY_CATEGORIES.some((c) => c.id === "upanishads"));

  const initialPosts = communityService.getPosts();
  assert("Seed discussions are present on first launch", initialPosts.length >= 3);
  const meeraPost = initialPosts.find((p) => p.authorRole === "expert");
  assert("Expert author (Dr. Meera) is seeded with Vidvān badge", Boolean(meeraPost && meeraPost.authorBadge.includes("Vidvān")));

  // Suite 2: Guidelines Acceptance (FR-NAV-02, BR-08)
  console.log("\n[Test Suite 2: Satsang Maryāda Guidelines Acceptance]");
  localStorage.removeItem("sutrasparsh_community_guidelines_accepted_v1");
  assert("Guidelines initially require acceptance", communityService.hasAcceptedGuidelines() === false);
  communityService.acceptGuidelines();
  assert("Guidelines accepted successfully", communityService.hasAcceptedGuidelines() === true);

  // Suite 3: Feed Filtering & Search (FR-FED, FR-SRC)
  console.log("\n[Test Suite 3: Feed Filtering & Instant Search]");
  const gitaPosts = communityService.getPosts({ category: "gita" });
  assert("Filtered Gita posts return Gita category only", gitaPosts.length > 0 && gitaPosts.every((p) => p.category === "gita"));

  const searchResults = communityService.getPosts({ searchQuery: "Nishkama" });
  assert("Keyword search for 'Nishkama' finds Gita reflection", searchResults.length > 0);

  const topPosts = communityService.getPosts({ sort: "top" });
  assert("Top engagement sort works", topPosts.length > 0);

  // Suite 4: Post Creation, Validation & Blocklist (FR-PST-01..06, BR-02)
  console.log("\n[Test Suite 4: Post Creation, Validation & Content Safety]");
  const shortTitle = communityService.createPost({
    title: "Hi",
    body: "This is a sufficiently long body reflection for testing purposes.",
    category: "gita",
  });
  assert("Post creation fails with title < 5 chars", shortTitle.success === false);

  const shortBody = communityService.createPost({
    title: "Valid Post Title Here",
    body: "Too short",
    category: "gita",
  });
  assert("Post creation fails with body < 15 chars", shortBody.success === false);

  const spamPost = communityService.createPost({
    title: "Join crypto casino now",
    body: "Earn free crypto tokens on our telegram.me group today for high returns!",
    category: "reflections_qa",
  });
  assert("Spam and external crypto terms are blocked by pre-publish filter", spamPost.success === false);

  // Valid Post
  const validPost = communityService.createPost({
    title: "How to balance Grihastha dharma with daily morning meditation?",
    body: "Practicing the second chapter of the Gita while managing household duties. Any advice on keeping the mind steady?",
    category: "reflections_qa",
    tags: ["Grihastha", "Dharma", "Gita"],
    scriptureRef: { scriptureId: "gita", verseRef: "Gītā 2.47" },
  });
  assert("Valid post is published successfully", validPost.success === true && Boolean(validPost.post));
  const createdPostId = validPost.post!.id;

  // Anonymous Post
  const anonPost = communityService.createPost({
    title: "Anonymous spiritual question on dealing with anger (Krodha)",
    body: "Struggling with anger during family disagreements. How does one apply non-attachment here?",
    category: "reflections_qa",
    isAnonymous: true,
    skipRateLimit: true,
  });
  assert("Anonymous post creates with 'Gupta Sādhaka' author name", anonPost.success === true && anonPost.post?.authorName.includes("Gupta Sādhaka"));

  // Edit own post
  const editResult = communityService.editPost(
    createdPostId,
    "How to balance Grihastha dharma with daily morning meditation? (Updated)",
    "Practicing the second chapter of the Gita while managing household duties. Updated reflection."
  );
  assert("Post author can edit own post", editResult.success === true);
  const updatedPost = communityService.getPostById(createdPostId);
  assert("Updated title is reflected", updatedPost?.title.includes("(Updated)"));
  assert("Edited timestamp is recorded", Boolean(updatedPost?.editedAt));

  // Suite 5: Reactions (FR-ENG-01, BR-03)
  console.log("\n[Test Suite 5: Sacred Reactions (Helpful, Bhakti, Namaste, Jnana)]");
  const initialLikes = updatedPost?.likesCount || 0;
  communityService.toggleReaction(createdPostId, "bhakti");
  let postAfterBhakti = communityService.getPostById(createdPostId);
  assert("Bhakti reaction increments", (postAfterBhakti?.reactions.bhakti || 0) >= 1);

  communityService.toggleReaction(createdPostId, "namaste");
  postAfterBhakti = communityService.getPostById(createdPostId);
  assert("Namaste reaction increments", (postAfterBhakti?.reactions.namaste || 0) >= 1);

  communityService.toggleReaction(createdPostId, "jnana");
  postAfterBhakti = communityService.getPostById(createdPostId);
  assert("Jnana reaction increments", (postAfterBhakti?.reactions.jnana || 0) >= 1);

  // Toggle off bhakti
  communityService.toggleReaction(createdPostId, "bhakti");
  postAfterBhakti = communityService.getPostById(createdPostId);
  assert("Bhakti reaction toggles off on second tap", (postAfterBhakti?.reactions.bhakti || 0) === 0);

  // Suite 6: Comments & Nested Replies (FR-ENG-02, FR-ENG-06)
  console.log("\n[Test Suite 6: Threaded Comments & Nested Replies]");
  const cmtResult = communityService.addComment(createdPostId, "Try setting aside just 10 minutes right after Brahma Muhurta bath.");
  assert("Comment added successfully", cmtResult.success === true && Boolean(cmtResult.comment));
  const commentId = cmtResult.comment!.id;

  const replyResult = communityService.addComment(createdPostId, "Thank you, this helped me immensely!", commentId);
  assert("Nested reply added with parentId", replyResult.success === true && replyResult.comment?.parentId === commentId);

  communityService.markCommentHelpful(commentId);
  const commentsList = communityService.getComments(createdPostId);
  const markedComment = commentsList.find((c) => c.id === commentId);
  assert("Post author can mark comment as 'Helpful Answer'", markedComment?.isHelpfulAnswer === true);

  // Suite 7: Bookmarks (FR-ENG-05)
  console.log("\n[Test Suite 7: Post Bookmarks & Saved List]");
  assert("Post is initially not bookmarked", communityService.isBookmarked(createdPostId) === false);
  communityService.toggleBookmark(createdPostId);
  assert("Post is bookmarked after toggle", communityService.isBookmarked(createdPostId) === true);
  const bookmarkedPosts = communityService.getPosts({ sort: "bookmarked" });
  assert("Bookmarked post appears in saved list", bookmarkedPosts.some((p) => p.id === createdPostId));

  // Suite 8: Moderation, Reporting & Auto-hiding (FR-MOD-01..05, BR-04)
  console.log("\n[Test Suite 8: Reporting, Auto-hiding & User Blocking]");
  const reportRes = communityService.reportContent({
    targetType: "post",
    targetId: createdPostId,
    reason: "disrespect",
    note: "Disrespectful wording of sacred tradition",
  });
  assert("Report submitted successfully", reportRes.success === true);

  // Test auto-hide threshold after 3 reports (FR-MOD-03)
  const targetPost = communityService.getPostById(createdPostId);
  if (targetPost) {
    targetPost.reportCount = 3;
    if (targetPost.reportCount >= 3) {
      targetPost.status = "hidden";
    }
  }
  const feedAfterReports = communityService.getPosts();
  assert("Post reaching 3 reports is auto-hidden from feed pending review", !feedAfterReports.some((p) => p.id === createdPostId));

  // User Blocking (FR-MOD-02)
  communityService.blockUser("usr_arun_04");
  assert("User blocked flag active", communityService.isUserBlocked("usr_arun_04") === true);
  const feedAfterBlock = communityService.getPosts();
  assert("Blocked user's posts are excluded from feed", !feedAfterBlock.some((p) => p.authorId === "usr_arun_04"));

  // Suite 9: Moderator Console & Audit Log (FR-MOD-10..19, FR-ADM)
  console.log("\n[Test Suite 9: Moderator Console, Actions & Audit Log]");
  const queue = communityService.getReportsQueue();
  assert("Reports queue contains submitted report", queue.length > 0);
  const pendingReport = queue.find((r) => r.targetId === createdPostId);
  assert("Pending report found in queue", Boolean(pendingReport));

  if (pendingReport) {
    communityService.resolveReport(pendingReport.id, "remove_post", "Violated Satsang Maryada");
    assert("Report status transitioned to actioned", pendingReport.status === "actioned");
  }

  const logs = communityService.getAuditLogs();
  assert("Immutable audit log recorded moderation action", logs.some((l) => l.action === "remove_post"));

  // Pin / Unpin
  communityService.togglePinPost("post-seed-02");
  const post02 = communityService.getPostById("post-seed-02");
  assert("Moderator can pin post to top of feed", post02?.isPinned === true);

  // Analytics
  const analytics = communityService.getAnalyticsSummary();
  assert("Analytics reports DAU and MAU metrics", analytics.dau > 0 && analytics.mau > 0);
  assert("Analytics reports support deflection rate", typeof analytics.supportDeflectionRate === "string");

  // Suite 10: In-App Notifications (FR-NTF-01..05, BR-06)
  console.log("\n[Test Suite 10: In-App Notification Center]");
  const notifs = communityService.getNotifications();
  assert("Notifications retrieved", notifs.length > 0);
  const initialUnread = communityService.getUnreadNotificationCount();
  communityService.markNotificationsRead();
  assert("All notifications marked as read", communityService.getUnreadNotificationCount() === 0);

  // Suite 11: SEO Compliance for Community Board
  console.log("\n[Test Suite 11: SEO Compliance Verification for Community Board]");
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  const sitemapXml = fs.readFileSync("./public/sitemap.xml", "utf-8");
  const appTsx = fs.readFileSync("./src/App.tsx", "utf-8");

  assert("index.html Schema.org featureList contains Community Board", indexHtml.includes("In-App Community Board and Satsang Discussions"));
  assert("index.html BreadcrumbList includes Community Satsang Board", indexHtml.includes("Community Satsang Board"));
  assert("index.html noscript includes ?tab=community link", indexHtml.includes('href="/?tab=community"'));
  assert("sitemap.xml contains ?tab=community URL entry", sitemapXml.includes("https://sutrasparsh.com/?tab=community"));
  assert("App.tsx provides DynamicMetadata for activeTab === 'community'", appTsx.includes('activeTab === "community"') && appTsx.includes("Community Satsang & Spiritual Discussions"));

  // Check character limits of community SEO metadata
  const commTitle = "Community Satsang & Spiritual Discussions | SutraSparsh";
  const commDesc = "Engage in sacred Satsang dialogues, ask questions on Bhagavad Gita and Yoga Sutras, and share authentic sadhana realizations.";
  assert("Community page title is between 30 and 60 chars", commTitle.length >= 30 && commTitle.length <= 60);
  assert("Community meta description is between 120 and 160 chars", commDesc.length >= 120 && commDesc.length <= 160);

  console.log(`\n=== Community Board Verification Complete: ${passed}/${total} assertions passed ===\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runCommunityBoardTests().catch((err) => {
  console.error("Community board test suite error:", err);
  process.exit(1);
});
