import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Sparkles, BookOpen, Sun, Activity, Bookmark, Flame, RefreshCw, Smartphone, Crown, Heart, Zap, ShieldCheck, Compass, Play, ArrowRight, AlertCircle } from "lucide-react";
import type { ContentItem, ContentResponse, JournalEntry } from "./types";
import { Header, type NavTab } from "./components/Header";
import { VerseCard } from "./components/VerseCard";
import { VerseCardSkeletonGrid } from "./components/VerseCardSkeleton";
import { VerseModal } from "./components/VerseModal";
import { DailySutra } from "./components/DailySutra";
import { WisdomJournal } from "./components/WisdomJournal";
import { SutraSparshAdminApp } from "./admin/SutraSparshAdminApp";
import { DailyShlokaMobile } from "./components/DailyShlokaMobile";
import { MyJourneyView } from "./components/MyJourneyView";
import { SearchView } from "./components/SearchView";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { PricingModal } from "./components/PricingModal";
import { PaywallModal } from "./components/PaywallModal";
import { DonationModal } from "./components/DonationModal";
import { SubscriptionManagementPanel } from "./components/SubscriptionManagementPanel";
import { MoreView } from "./components/MoreView";
import { SadhakaProfileModal } from "./components/SadhakaProfileModal";
import { AuthModal } from "./components/AuthModal";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { StoreAssetsViewer } from "./components/StoreAssetsViewer";
import { DailyPromoPopup } from "./components/DailyPromoPopup";
import { AtmosphereCrossfadeBackdrop, ATMOSPHERE_CONFIGS } from "./components/AtmosphereCrossfadeBackdrop";
import { soundEngine } from "./utils/audio";
import type { SubscriptionPlanId } from "./types/monetization";
import type { AppTheme } from "./types";
import { themeConfigService, themeObserver } from "./services/theme-config.service";
import { useFeatureFlags } from "./services/feature-flags.service";
import { firestoreSyncService } from "./services/firestore-sync.service";
import { authService, type SeekerUser } from "./services/auth.service";
import { DynamicMetadata } from "./components/DynamicMetadata";
import { CommunityBoardView } from "./components/community/CommunityBoardView";
import { PanditServicesView } from "./components/services/PanditServicesView";
import { getDailyShlokaForDate } from "./data/scriptureCorpus";
import {
  WordExplorer,
  LookCloserModal,
  LookCloserBanner,
  useWordExplorer,
} from "./features/wordExplorer";

const TRADITIONS = ["All", "Bhagavad Gita", "Patanjali", "Upanishads", "Vedas"];
const INITIAL_VERSES: ContentItem[] = [
  {
    id: "gita-2-47",
    title: "Bhagavad Gita 2.47",
    subtitle: "The Law of Selfless Action (Nishkama Karma)",
    body: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stvakarmaṇi ||",
    meaning: "You have a right only to perform your prescribed duties, but you are never entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to inaction.",
    commentary: "Lord Krishna counsels Arjuna that true freedom and peace of mind arise from dedicating oneself wholeheartedly to righteous duty without anxiety or craving for outcomes.",
    metadata: {
      language: "sa",
      source: "Bhagavad Gita",
      author: "Bhagavad Gita",
      category: "Karma Yoga",
      chapter: 2,
      verse: 47,
      tags: ["Gita", "Yoga", "Karma", "Wisdom", "Duty"],
    },
  },
  {
    id: "gita-2-48",
    title: "Bhagavad Gita 2.48",
    subtitle: "Equanimity is Yoga (Samatvam Yoga Ucyate)",
    body: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    transliteration: "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya |\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate ||",
    meaning: "Perform your duty with an even mind, O Arjuna, abandoning all attachment to success or failure. Such equanimity of mind is called Yoga.",
    commentary: "Yoga is not merely physical posture; it is an unshakeable poise in the midst of life's dualities — joy and sorrow, triumph and defeat.",
    metadata: {
      language: "sa",
      source: "Bhagavad Gita",
      author: "Bhagavad Gita",
      category: "Karma Yoga",
      chapter: 2,
      verse: 48,
      tags: ["Gita", "Yoga", "Equanimity", "Peace"],
    },
  },
  {
    id: "yoga-sutra-1-1",
    title: "Yoga Sutra 1.1",
    subtitle: "The Auspicious Commencement",
    body: "अथ योगानुशासनम्॥",
    transliteration: "atha yogānuśāsanam ||",
    meaning: "Now, the sacred exposition and discipline of Yoga commences.",
    commentary: "Patanjali begins the monumental Yoga Sutras with the word 'Atha' (Now), signaling readiness for supreme inner transformation.",
    metadata: {
      language: "sa",
      source: "Patanjali Yoga Sutras",
      author: "Patanjali",
      category: "Raja Yoga",
      chapter: 1,
      verse: 1,
      tags: ["Patanjali", "Yoga", "Sutra", "Discipline"],
    },
  },
];

const CATEGORIES = ["All", "Karma Yoga", "Raja Yoga", "Mind & Meditation", "Jnana / Vedanta", "Vedic Chants"];

export default function App() {
  // App Mode Separation (Phase 22, M38-M46): 'user' (sutrasparsh.in) vs 'admin' (admin.sutrasparsh.in)
  const [appMode, setAppMode] = useState<"user" | "admin">(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      const host = window.location.hostname;
      if (
        search.get("mode") === "admin" ||
        search.get("view") === "admin" ||
        search.get("admin") === "true" ||
        path.startsWith("/admin") ||
        host.startsWith("admin.") ||
        host.includes("admin.sutrasparsh")
      ) {
        return "admin";
      }
    }
    return "user";
  });
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const tabParam = search.get("tab") as NavTab;
      if (
        tabParam &&
        ["today", "explore", "explorer", "search", "services", "community", "my-journey", "journal", "preferences", "membership"].includes(
          tabParam
        )
      ) {
        return tabParam === "explorer"
          ? "explore"
          : tabParam === "journal"
          ? "my-journey"
          : tabParam;
      }
    }
    return "today";
  });
  const [verses, setVerses] = useState<ContentItem[]>(INITIAL_VERSES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVerse, setSelectedVerse] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // SutraSparsh Word Explorer & Look Closer Discovery State
  const wordExplorer = useWordExplorer();
  const [isLookCloserOpen, setIsLookCloserOpen] = useState(false);

  // Profile Modal State (Restored for user profile & sacred streak tracking)
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Persistent Theme Atmosphere strictly restricted to 'light' (Parchment Dawn) & 'golden-hour' (Golden Hour)
  const [theme, setTheme] = useState<AppTheme>(() => themeConfigService.getActiveTheme());

  // Listen to global theme updates (including Admin override changes)
  useEffect(() => {
    const unsub = themeConfigService.subscribe((updatedTheme) => {
      setTheme(updatedTheme);
    });
    return unsub;
  }, []);

  // Atmospheric cross-fade animation state
  const [isThemeCrossfading, setIsThemeCrossfading] = useState(false);
  const crossfadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerThemeTransition = (newTheme: AppTheme) => {
    const sanitized = themeConfigService.sanitizeTheme(newTheme);
    if (sanitized === theme) return;
    setTheme(sanitized);
    themeConfigService.setActiveTheme(sanitized);
    setIsThemeCrossfading(true);

    // Harmonically tuned temple chime for sacred atmospheric feedback
    const cfg = ATMOSPHERE_CONFIGS[sanitized];
    if (cfg) {
      soundEngine.playTempleBell(cfg.pitch);
    }

    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
    }
    crossfadeTimerRef.current = setTimeout(() => {
      setIsThemeCrossfading(false);
    }, 750);
  };

  const handleToggleTheme = () => {
    // Whitelist policy: cycles exclusively between Parchment Dawn and Golden Hour
    const next = themeConfigService.getNextPermittedTheme(theme);
    triggerThemeTransition(next);
  };

  const handleSelectTheme = (newTheme: AppTheme) => {
    triggerThemeTransition(themeConfigService.sanitizeTheme(newTheme));
  };

  // Synchronize documentElement and body attributes and theme classes via unified ThemeObserver pattern
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    // Guarantees Parchment Dawn and Golden Hour classes are applied globally and instantly to document root
    themeObserver.applyTheme(theme, "manual");
  }, [theme]);

  // Daily Promo Popup ("First load of the day" across all devices)
  const [isDailyPromoOpen, setIsDailyPromoOpen] = useState(false);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastDate = localStorage.getItem("sutrasparsh_promo_last_date");
      if (lastDate !== todayStr) {
        // First load of the day: show promo popup
        const timer = setTimeout(() => {
          setIsDailyPromoOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Monetization Modals & State (Phases 16–21)
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState({ title: "", description: "" });

  // Auth, Privacy Policy & Store Assets Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  // Explore screen virtualization & lazy loading
  const [visibleVerseLimit, setVisibleVerseLimit] = useState(12);
  const loadMoreSentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Local storage & Cloud Sync for Bookmarks and Journal
  const [currentUser, setCurrentUser] = useState<SeekerUser | null>(() => authService.getCurrentUser());

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_bookmarks");
      return saved ? JSON.parse(saved) : ["gita-2-47", "yoga-sutra-1-2"];
    } catch {
      return ["gita-2-47", "yoga-sutra-1-2"];
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_journal");
      return saved ? JSON.parse(saved) : [
        {
          id: "journal-initial-1",
          verseId: "gita-2-47",
          verseTitle: "Bhagavad Gita 2.47",
          note: "Today I will focus on performing my work diligently with pure intent, letting go of obsessive worry about recognition or outcomes.",
          createdAt: new Date().toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });

  // Track auth user changes
  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Multi-device Cloud Sync (Firestore) listeners & reconciliation
  useEffect(() => {
    if (!currentUser || !authService.isFirebaseAuthenticated()) return;

    // 1. Reconcile on initial mount/login
    firestoreSyncService
      .reconcileData(currentUser.uid, bookmarks, journalEntries)
      .then((reconciled) => {
        setBookmarks(reconciled.bookmarks);
        setJournalEntries(reconciled.journals);
      })
      .catch((err) => {
        console.warn("Initial Firestore sync reconciliation note:", err);
      });

    // 2. Real-time Bookmarks listener
    const unsubBm = firestoreSyncService.subscribeBookmarks(
      currentUser.uid,
      (cloudBookmarks) => {
        if (cloudBookmarks && cloudBookmarks.length > 0) {
          setBookmarks((prev) => {
            const merged = Array.from(new Set([...cloudBookmarks, ...prev]));
            return merged;
          });
        }
      }
    );

    // 3. Real-time Journal Reflections listener
    const unsubJn = firestoreSyncService.subscribeJournals(
      currentUser.uid,
      (cloudJournals) => {
        if (cloudJournals && cloudJournals.length > 0) {
          setJournalEntries((prev) => {
            const map = new Map<string, JournalEntry>();
            cloudJournals.forEach((j) => map.set(j.id, j));
            prev.forEach((j) => {
              if (!map.has(j.id)) map.set(j.id, j);
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }
    );

    return () => {
      unsubBm();
      unsubJn();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_bookmarks", JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_journal", JSON.stringify(journalEntries));
    } catch (e) {}
  }, [journalEntries]);

  // Fetch content from backend API
  const fetchContent = async () => {
    setLoading(true);
    try {
      let url = "/api/content?limit=50";
      if (selectedCategory !== "All") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchTerm.trim()) {
        url += `&q=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await fetch(url);
      if (res.status === 429) {
        // Spiritual pace rate limit active: gracefully fallback to current/cached corpus
        console.warn("Spiritual pace rate limit active; using current scripture corpus.");
        setBackendOnline(true);
        return;
      }

      if (res.ok) {
        const json: ContentResponse = await res.json();
        setVerses(json.data || []);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      console.warn("Backend API fetch error:", err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 300ms debounce to prevent rapid keystrokes from spamming the backend
    const timer = setTimeout(() => {
      fetchContent();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm]);

  const toggleBookmark = React.useCallback((id: string, verseTitle?: string) => {
    setBookmarks((prev) => {
      const willBookmark = !prev.includes(id);
      // Sync to Firestore if authenticated with Firebase Auth
      if (currentUser && authService.isFirebaseAuthenticated()) {
        if (willBookmark) {
          firestoreSyncService.setBookmark(currentUser.uid, id, verseTitle || id).catch((err) => {
            console.warn("Could not sync bookmark to cloud:", err);
          });
        } else {
          firestoreSyncService.removeBookmark(currentUser.uid, id).catch((err) => {
            console.warn("Could not remove bookmark from cloud:", err);
          });
        }
      }
      return willBookmark ? [...prev, id] : prev.filter((item) => item !== id);
    });
  }, [currentUser]);

  const handleSaveJournalNote = (verseId: string, verseTitle: string, note: string) => {
    const newEntry: JournalEntry = {
      id: `note-${Date.now()}`,
      verseId,
      verseTitle,
      note,
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Sync to Firestore
    if (currentUser && authService.isFirebaseAuthenticated()) {
      firestoreSyncService.saveJournalEntry(currentUser.uid, newEntry).catch((err) => {
        console.warn("Could not sync reflection to cloud:", err);
      });
    }
  };

  const handleEditJournalEntry = (id: string, newNote: string) => {
    setJournalEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated: JournalEntry = {
            ...entry,
            note: newNote,
            updatedAt: new Date().toISOString(),
          };
          if (currentUser && authService.isFirebaseAuthenticated()) {
            firestoreSyncService.saveJournalEntry(currentUser.uid, updated).catch((err) => {
              console.warn("Could not update reflection in cloud:", err);
            });
          }
          return updated;
        }
        return entry;
      })
    );
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));

    // Remove from Firestore
    if (currentUser && authService.isFirebaseAuthenticated()) {
      firestoreSyncService.deleteJournalEntry(currentUser.uid, id).catch((err) => {
        console.warn("Could not delete reflection from cloud:", err);
      });
    }
  };

  const handleManualSync = async () => {
    if (currentUser && authService.isFirebaseAuthenticated()) {
      const reconciled = await firestoreSyncService.reconcileData(
        currentUser.uid,
        bookmarks,
        journalEntries
      );
      setBookmarks(reconciled.bookmarks);
      setJournalEntries(reconciled.journals);
      await firestoreSyncService.createCloudBackupSnapshot(
        currentUser.uid,
        reconciled.bookmarks,
        reconciled.journals
      );
    }
  };

  const handleOpenVerse = React.useCallback((verse: ContentItem) => {
    setSelectedVerse(verse);
    setIsModalOpen(true);
  }, []);

  const handleOpenJourneyFromCard = React.useCallback((item?: ContentItem) => {
    setActiveTab("my-journey");
  }, []);

  const triggerPaywall = (title: string, description: string) => {
    setPaywallFeature({ title, description });
    setIsPaywallOpen(true);
  };

  // Filter by tradition client side
  const filteredVerses = verses.filter((v) => {
    if (!v) return false;
    if (selectedTradition === "All") return true;
    const authorMatch = v.metadata?.author?.toLowerCase().includes(selectedTradition.toLowerCase()) ?? false;
    const titleMatch = v.title?.toLowerCase().includes(selectedTradition.toLowerCase()) ?? false;
    return authorMatch || titleMatch;
  });

  // Reset lazy load limit when filters change
  useEffect(() => {
    setVisibleVerseLimit(12);
  }, [selectedTradition, selectedCategory, searchTerm]);

  const displayedVerses = filteredVerses.slice(0, visibleVerseLimit);
  const hasMoreVerses = visibleVerseLimit < filteredVerses.length;

  const bookmarkedIdsSet = React.useMemo(() => new Set(bookmarks), [bookmarks]);

  // High-performance memoization for infinite scroll rendering
  const memoizedVerseCards = React.useMemo(() => {
    return displayedVerses.map((item) => (
      <VerseCard
        key={item.id}
        item={item}
        isBookmarked={bookmarkedIdsSet.has(item.id)}
        onToggleBookmark={toggleBookmark}
        onSelect={handleOpenVerse}
        onOpenJourney={() => setActiveTab("my-journey")}
        theme={theme}
      />
    ));
  }, [displayedVerses, bookmarkedIdsSet, toggleBookmark, handleOpenVerse, theme]);

  // IntersectionObserver for seamless infinite scrolling & lazy loading
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreVerses) {
          setVisibleVerseLimit((prev) => Math.min(prev + 12, filteredVerses.length));
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreVerses, filteredVerses.length]);

  const dailyVerse = verses.length > 0 ? verses[0] : null;

  // Device detection: Admin console functionality is strictly restricted to device: screen
  const [isScreenDevice, setIsScreenDevice] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const isDesktopWidth = window.innerWidth >= 1024;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isDesktopWidth && !isMobileUA;
  });

  useEffect(() => {
    const handleDeviceCheck = () => {
      const isDesktopWidth = window.innerWidth >= 1024;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsScreenDevice(isDesktopWidth && !isMobileUA);
    };
    window.addEventListener("resize", handleDeviceCheck);
    return () => window.removeEventListener("resize", handleDeviceCheck);
  }, []);

  const handleOpenAdminConsole = () => {
    if (!isScreenDevice) return;
    setAppMode("admin");
    if (typeof window !== "undefined" && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", "admin");
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleSwitchToUserApp = () => {
    setAppMode("user");
    if (typeof window !== "undefined" && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.delete("mode");
      url.searchParams.delete("view");
      url.searchParams.delete("admin");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Sync popstate for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const search = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      const host = window.location.hostname;
      if (
        search.get("mode") === "admin" ||
        search.get("view") === "admin" ||
        search.get("admin") === "true" ||
        path.startsWith("/admin") ||
        host.startsWith("admin.") ||
        host.includes("admin.sutrasparsh")
      ) {
        setAppMode("admin");
      } else {
        setAppMode("user");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync activeTab with URL query parameter for clean, shareable & indexable URLs
  useEffect(() => {
    if (typeof window !== "undefined" && appMode === "user") {
      const search = new URLSearchParams(window.location.search);
      try {
        if (activeTab === "today") {
          if (search.has("tab")) {
            search.delete("tab");
            const query = search.toString();
            const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
            window.history.replaceState(null, "", newUrl);
          }
        } else {
          if (search.get("tab") !== activeTab) {
            search.set("tab", activeTab);
            const newUrl = `${window.location.pathname}?${search.toString()}${window.location.hash}`;
            window.history.replaceState(null, "", newUrl);
          }
        }
      } catch (err) {
        // Silently handle iframes with restricted History API permissions
      }
    }
  }, [activeTab, appMode]);

  // Dynamic SEO Metadata for top-level non-today tabs
  const tabMetadata = React.useMemo(() => {
    if (activeTab === "explore" || activeTab === "explorer") {
      return {
        title: "Sacred Scriptures Library - Bhagavad Gita, Upanishads & Yoga Sutras | SutraSparsh",
        description: "Explore the comprehensive Sanskrit corpus: Bhagavad Gita, Patanjali Yoga Sutras, and principal Upanishads with English translations, transliterations, and commentary.",
        keywords: "Bhagavad Gita, Yoga Sutras, Upanishads, Sanskrit library, Vedic scriptures, sacred texts",
        canonicalUrl: "https://sutrasparsh.com/?tab=explore",
        ogType: "website" as const,
      };
    }
    if (activeTab === "search") {
      return {
        title: "Search Sanskrit Shlokas & Sacred Corpus | SutraSparsh",
        description: "Search across the entire Sanskrit corpus by Sanskrit keywords, English terms, and philosophical concepts. Discover relevant shlokas, meanings, and audio recitations.",
        keywords: "search shloka, Sanskrit search, Gita search, Yoga Sutras search, dharma, karma, moksha",
        canonicalUrl: searchTerm.trim() ? `https://sutrasparsh.com/?tab=search&q=${encodeURIComponent(searchTerm.trim())}` : "https://sutrasparsh.com/?tab=search",
        ogType: "website" as const,
      };
    }
    if (activeTab === "services") {
      return {
        title: "Vedic Purohit Directory & Ritual Services | SutraSparsh",
        description: "Directly connect with verified Vedic Panditjis for Pujas, Griha Pravesha, Homa, and Samskaras. 100% Zero Platform Fees, peer-endorsed priests.",
        keywords: "Vedic Pandit, Purohit directory, Griha Pravesh puja, Satyanarayan katha, Rudrabhishek, Vedic rituals, zero fee priests",
        canonicalUrl: "https://sutrasparsh.com/?tab=services",
        ogType: "website" as const,
      };
    }
    if (activeTab === "community") {
      return {
        title: "Community Satsang & Spiritual Discussions | SutraSparsh",
        description: "Engage in sacred Satsang dialogues, ask questions on Bhagavad Gita and Yoga Sutras, and share authentic sadhana realizations.",
        keywords: "satsang community, spiritual discussion, Gita forum, yoga sutras Q&A, Vedic community, sadhana board",
        canonicalUrl: "https://sutrasparsh.com/?tab=community",
        ogType: "website" as const,
      };
    }
    if (activeTab === "my-journey" || activeTab === "journal") {
      return {
        title: "My Sādhana Journey, Daily Study Goals & Streaks | SutraSparsh",
        description: "Track your 15-minute daily study goals, Brahma Muhurta sadhana streaks, reading milestones, and contemplative spiritual evolution.",
        keywords: "sadhana tracker, daily study goal, 15 minute study target, spiritual journey, meditation streak, Brahma Muhurta",
        canonicalUrl: "https://sutrasparsh.com/?tab=my-journey",
        ogType: "website" as const,
      };
    }
    if (activeTab === "preferences") {
      return {
        title: "Atmosphere & Audio Preferences | SutraSparsh",
        description: "Customize your temple sanctuary atmosphere, sound frequencies, font sizes, and theme preferences.",
        keywords: "temple preferences, audio settings, sanctuary theme, Sanskrit chanting options",
        canonicalUrl: "https://sutrasparsh.com/?tab=preferences",
        ogType: "website" as const,
      };
    }
    if (activeTab === "membership") {
      return {
        title: "Temple Seeker Patronage & Membership | SutraSparsh",
        description: "Support open Sanskrit heritage preservation and unlock advanced contemplative sadhana tools.",
        keywords: "SutraSparsh membership, patron support, Sanskrit preservation, Vedic wisdom donation",
        canonicalUrl: "https://sutrasparsh.com/?tab=membership",
        ogType: "website" as const,
      };
    }
    return null;
  }, [activeTab, searchTerm]);

  if (appMode === "admin") {
    if (!isScreenDevice) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500/40 selection:text-amber-100">
          <div className="max-w-md w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-8 space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>
            <h2 className="font-serif-sacred text-xl font-bold text-amber-200">
              Admin Console Screen-Only
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              The SutraSparsh Temple Admin Operations Console is enabled exclusively on <strong>device: screen</strong> (desktop workstations). Admin operations are disabled on mobile and handheld devices for operational security.
            </p>
            <button
              type="button"
              onClick={handleSwitchToUserApp}
              className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow cursor-pointer"
            >
              Return to Sacred Temple App
            </button>
          </div>
        </div>
      );
    }
    return (
      <>
        <DynamicMetadata
          title="Admin Operations Console | SutraSparsh"
          description="SutraSparsh Temple Operations, Sanskrit Corpus Management, and Analytics Console."
          robots="noindex, nofollow"
        />
        <SutraSparshAdminApp onSwitchToUserApp={handleSwitchToUserApp} />
      </>
    );
  }

  return (
    <div
      id="sutrasparsh-app-root"
      data-theme={theme}
      className={`min-h-dvh flex flex-col relative overflow-x-hidden ${
        isThemeCrossfading ? "theme-crossfade-active" : ""
      } ${
        theme === "light"
          ? "text-stone-900 selection:bg-amber-300 selection:text-stone-950 light-mode"
          : theme === "prism-pulse"
          ? "text-[#333333] selection:bg-[#936BFA] selection:text-white theme-prism-pulse"
          : theme === "festival"
          ? "text-stone-100 selection:bg-amber-500/40 selection:text-amber-100"
          : theme === "amethyst"
          ? "text-stone-100 selection:bg-amber-500/40 selection:text-amber-100"
          : theme === "golden-hour"
          ? "text-[#FFF4D8] selection:bg-[#C9822B] selection:text-[#FFF4D8] golden-hour-mode"
          : "text-stone-100 selection:bg-amber-500/40 selection:text-amber-100"
      }`}
    >
      {tabMetadata && (
        <DynamicMetadata
          title={tabMetadata.title}
          description={tabMetadata.description}
          keywords={tabMetadata.keywords}
          canonicalUrl={tabMetadata.canonicalUrl}
          ogType={tabMetadata.ogType}
        />
      )}
      {/* Ambient Dual-Layer Cross-Fade Backdrop */}
      <AtmosphereCrossfadeBackdrop theme={theme} />

      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={bookmarks.length}
        backendOnline={backendOnline}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenAdminConsole={isScreenDevice ? handleOpenAdminConsole : undefined}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLookCloser={() => setIsLookCloserOpen(true)}
        onOpenWordExplorer={() => wordExplorer.openWord("कर्मण्येवाधिकारस्ते")}
        onManualSync={handleManualSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 overflow-x-hidden">
        {/* Offline Corpus Warning Banner with Retry Connection Action */}
        {!backendOnline && (
          <div
            role="alert"
            id="backend-offline-banner"
            className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fadeIn transition-colors ${
              theme === "light"
                ? "bg-[#FFF4E5] border-[#E8C59A] text-[#261B12]"
                : "bg-amber-950/40 border-amber-500/40 text-amber-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  theme === "light"
                    ? "bg-[#FBEFD3] text-[#A64E04]"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif-sacred">
                  Sacred Corpus Offline • Sanctuary Cache Active
                </h4>
                <p
                  className={`text-xs ${
                    theme === "light" ? "text-[#6E5C4E]" : "text-stone-300"
                  }`}
                >
                  The scripture API engine is currently offline or unreachable. You are viewing cached verses.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-retry-backend-connection"
              onClick={fetchContent}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 flex-shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 ${
                theme === "light"
                  ? "bg-gradient-to-b from-[#E66020] to-[#D44E0E] text-white hover:brightness-105"
                  : "bg-amber-500 hover:bg-amber-400 text-stone-950"
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Reconnecting..." : "Retry Connection"}</span>
            </button>
          </div>
        )}

        {/* 1. TODAY: Daily Habit & First Value Aha Moment */}
        {(activeTab === "today" || activeTab === "daily-app" || activeTab === "daily") && (
          <div className="space-y-8 animate-fadeIn">
            <DailyShlokaMobile
              onOpenAdmin={() => setAppMode("admin")}
              theme={theme}
              onSelectTheme={handleSelectTheme}
              initialSubScreen="none"
              onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            />
          </div>
        )}

        {/* 2. EXPLORE: Tradition & Category Discovery */}
        {(activeTab === "explore" || activeTab === "explorer") && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero / Sacred Welcome Banner (FR-02 Point 2) */}
            <div
              className={`relative overflow-hidden rounded-[28px] p-6 sm:p-10 transition-all ${
                theme === "light"
                  ? "bg-white border border-[#cfcbe0] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] hover:shadow-[0_10px_30px_-12px_rgb(27_23_64_/_0.28)] hover:border-[#d9a441]"
                  : "bg-gradient-to-br from-[#231C18] via-[#352B23] to-[#4D382A] border border-amber-500/25 shadow-2xl"
              }`}
            >
              {theme !== "light" && (
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              )}
              
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className={`flex items-center space-x-2 text-[10.5px] font-extrabold tracking-widest uppercase ${
                  theme === "light" ? "text-[#b8801f]" : "text-amber-300"
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 ${theme === "light" ? "text-[#b8801f]" : "text-amber-400"}`} />
                  <span>Timeless Sanskrit Wisdom &amp; Philosophical Heritage</span>
                </div>
                <h1 className={`font-serif-sacred text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${
                  theme === "light" ? "text-[#1b1740]" : "text-[#FBE29D]"
                }`}>
                  Touch the Sacred Essence of Ancient Sutras
                </h1>
                <p className={`text-xs sm:text-sm leading-relaxed font-light ${
                  theme === "light" ? "text-[#55526b]" : "text-[#DAC5B0]"
                }`}>
                  Explore authentic verses from the Bhagavad Gita, Patanjali Yoga Sutras, and the Upanishads. Study transliterations, commentaries, and chant sacred mantras.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("search")}
                    className={`px-5 py-2.5 font-bold rounded-full text-xs shadow-md hover:scale-105 transition-all flex items-center space-x-2 cursor-pointer ${
                      theme === "light"
                        ? "bg-[#d9a441] hover:bg-[#c99435] text-[#100e2b]"
                        : "bg-gradient-to-b from-[#E66020] to-[#D44E0E] text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Sacred Corpus</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("my-journey")}
                    className={`px-5 py-2.5 font-bold rounded-full text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                      theme === "light"
                        ? "bg-[#1b1740] hover:bg-[#2b2560] text-[#f4f2ff] shadow-sm"
                        : "bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-[#DAC5B0]"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Sacred Sanctuary</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SutraSparsh Discovery: Look Closer Feature Banner (FR-02) */}
            <LookCloserBanner
              onOpenLookCloser={() => setIsLookCloserOpen(true)}
              onOpenExplorer={() => wordExplorer.openWord("कर्मण्येवाधिकारस्ते")}
              theme={theme}
            />

            {/* Filter Bar */}
            <div
              className={`space-y-4 rounded-[20px] p-6 transition-colors ${
                theme === "light"
                  ? "bg-white border border-[#cfcbe0] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] text-[#1d1b2e]"
                  : "bg-stone-900/60 border border-stone-800 shadow-lg text-stone-100"
              }`}
            >
              {/* Traditions / Authors Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold mr-2 flex items-center gap-1 ${
                    theme === "light" ? "text-[#1b1740]" : "text-stone-400"
                  }`}
                >
                  <Filter className={`w-3.5 h-3.5 ${theme === "light" ? "text-[#b8801f]" : "text-amber-400"}`} />
                  <span>Tradition:</span>
                </span>
                {TRADITIONS.map((tradition) => (
                  <button
                    key={tradition}
                    onClick={() => setSelectedTradition(tradition)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedTradition === tradition
                        ? theme === "light"
                          ? "bg-[#1b1740] text-[#f4f2ff] border border-[#1b1740] font-semibold shadow-xs"
                          : "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm font-semibold"
                        : theme === "light"
                        ? "bg-white text-[#1d1b2e] hover:border-[#d9a441] hover:bg-[#fbf0d6] border border-[#cfcbe0]"
                        : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                    }`}
                  >
                    {tradition}
                  </button>
                ))}
              </div>

              {/* Categories Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={`text-xs font-semibold mr-2 flex items-center gap-1 ${
                    theme === "light" ? "text-[#1b1740]" : "text-stone-400"
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${theme === "light" ? "text-[#b8801f]" : "text-amber-400"}`} />
                  <span>Path / Yoga:</span>
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? theme === "light"
                          ? "bg-[#1b1740] text-[#f4f2ff] border border-[#1b1740] font-semibold shadow-xs"
                          : "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm font-semibold"
                        : theme === "light"
                        ? "bg-white text-[#1d1b2e] hover:border-[#d9a441] hover:bg-[#fbf0d6] border border-[#cfcbe0]"
                        : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`font-serif-sacred text-xl font-bold flex items-center space-x-2 ${
                    theme === "light" ? "text-[#1b1740]" : "text-amber-100"
                  }`}
                >
                  <BookOpen className={`w-5 h-5 ${theme === "light" ? "text-[#b8801f]" : "text-amber-400"}`} />
                  <span>Sacred Scripture Verses</span>
                  <span
                    className={`text-xs font-sans font-normal ml-2 ${
                      theme === "light" ? "text-[#55526b]" : "text-stone-500"
                    }`}
                  >
                    ({filteredVerses.length} verses)
                  </span>
                </h3>

                <button
                  onClick={fetchContent}
                  title="Reload verses"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    theme === "light"
                      ? "text-[#55526b] hover:text-[#1b1740] hover:bg-[#efedf6]"
                      : "text-stone-500 hover:text-amber-300"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
                </button>
              </div>

              {loading ? (
                <VerseCardSkeletonGrid count={6} theme={theme} />
              ) : filteredVerses.length === 0 ? (
                <div
                  className={`text-center py-16 border rounded-[20px] p-8 space-y-4 shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] ${
                    theme === "light"
                      ? "bg-white border-[#cfcbe0] text-[#1d1b2e]"
                      : "bg-stone-900/30 border-stone-800/80"
                  }`}
                >
                  <BookOpen
                    className={`w-12 h-12 mx-auto ${
                      theme === "light" ? "text-[#b8801f]" : "text-stone-600"
                    }`}
                  />
                  <h4
                    className={`text-base font-bold font-serif-sacred ${
                      theme === "light" ? "text-[#1b1740]" : "text-stone-300"
                    }`}
                  >
                    {!backendOnline
                      ? "Scripture API Engine Offline"
                      : "No verses found for selected criteria"}
                  </h4>
                  <p
                    className={`text-xs max-w-sm mx-auto ${
                      theme === "light" ? "text-[#55526b]" : "text-stone-500"
                    }`}
                  >
                    {!backendOnline
                      ? "The connection to the scripture backend was interrupted. Tap below to reconnect."
                      : 'Try broadening your search query or choosing "All" in the filters above.'}
                  </p>
                  {!backendOnline && (
                    <button
                      type="button"
                      id="btn-retry-explore-empty"
                      onClick={fetchContent}
                      disabled={loading}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-xs hover:brightness-105 active:scale-95 transition-all inline-flex items-center space-x-2 cursor-pointer disabled:opacity-50 ${
                        theme === "light"
                          ? "bg-[#1b1740] hover:bg-[#100e2b] text-[#f4f2ff]"
                          : "bg-amber-500 hover:bg-amber-400 text-stone-950"
                      }`}
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                      />
                      <span>Retry Connection</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Contextual My Journey Personal Tracking Bridge Banner in Explore */}
                  <div
                    id="explore-my-journey-bridge"
                    className={`p-5 rounded-[20px] border flex items-center justify-between gap-3 shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] ${
                      theme === "light"
                        ? "bg-white border-[#cfcbe0] text-[#1d1b2e]"
                        : "bg-amber-950/20 border-amber-500/30 text-stone-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        theme === "light" ? "bg-[#fbf0d6] text-[#b8801f]" : "bg-amber-500/20 text-amber-400 rounded-xl"
                      }`}>
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-xs sm:text-sm font-bold font-serif-sacred leading-tight ${theme === "light" ? "text-[#1b1740]" : ""}`}>
                            Personal Study Sanctuary &amp; My Journey
                          </h4>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                            theme === "light" ? "bg-[#fbf0d6] text-[#b8801f] border-[#f0cf8a]/60" : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}>
                            {bookmarks.length} Saved Verses
                          </span>
                        </div>
                        <p className={`text-[11px] leading-normal mt-0.5 ${theme === "light" ? "text-[#55526b]" : "text-stone-300"}`}>
                          Track contemplative reading streaks, habit milestones, and personal reflections across the Sanskrit corpus.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-explore-open-journey"
                      onClick={() => setActiveTab("my-journey")}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                        theme === "light"
                          ? "bg-[#1b1740] hover:bg-[#100e2b] text-[#f4f2ff] active:scale-95"
                          : "bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95"
                      }`}
                      aria-label="Open My Journey personal sanctuary"
                    >
                      <span>Open My Journey</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memoizedVerseCards}
                  </div>

                  {/* Virtualized / Lazy Loading Sentinel & Pagination Controls */}
                  {hasMoreVerses && (
                    <div
                      ref={loadMoreSentinelRef}
                      className="pt-6 pb-2 flex flex-col items-center justify-center space-y-2.5"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleVerseLimit((prev) => Math.min(prev + 12, filteredVerses.length))
                        }
                        className="px-6 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all shadow cursor-pointer active:scale-95 flex items-center space-x-2"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          Load Next Verses ({filteredVerses.length - displayedVerses.length} remaining)
                        </span>
                      </button>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Showing {displayedVerses.length} of {filteredVerses.length} verses • Auto-loads on scroll
                      </span>
                    </div>
                  )}

                  {!hasMoreVerses && filteredVerses.length > 12 && (
                    <div className="py-6 text-center text-xs text-stone-500 font-mono border-t border-stone-800/60 mt-4">
                      ✨ सम्पूर्णम् • All {filteredVerses.length} sacred verses loaded in sanctuary
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SEARCH: Intent-Driven Discovery */}
        {activeTab === "search" && (
          <SearchView
            verses={verses}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTradition={selectedTradition}
            setSelectedTradition={setSelectedTradition}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onOpenVerseModal={handleOpenVerse}
            theme={theme}
          />
        )}

        {/* 3b. COMMUNITY: Satsang Mandali & Spiritual Discussions */}
        {activeTab === "community" && (
          <CommunityBoardView
            theme={theme}
            initialPostId={
              typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("post") || undefined
                : undefined
            }
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {/* 3c. SERVICES: Zero-Fee Vedic Pandit Directory & Direct WhatsApp Connect */}
        {activeTab === "services" && (
          <PanditServicesView
            theme={theme}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {/* 4. MY JOURNEY: Personal Sanctuary, Habits, Saved, Journal & Membership */}
        {(activeTab === "my-journey" || activeTab === "journal" || activeTab === "membership") && (
          <MyJourneyView
            verses={verses}
            bookmarks={bookmarks}
            journalEntries={journalEntries}
            onToggleBookmark={toggleBookmark}
            onSaveJournalNote={handleSaveJournalNote}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            onOpenVerseModal={handleOpenVerse}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenDonation={() => setIsDonationOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onManualSync={handleManualSync}
            theme={theme}
          />
        )}

        {/* 5. PREFERENCES & SACRED ATMOSPHERE (Accessible via More / Settings) */}
        {activeTab === "preferences" && (
          <div className="space-y-8 animate-fadeIn">
            <MoreView
              theme={theme}
              onSelectTheme={handleSelectTheme}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenPricing={() => setIsPricingOpen(true)}
              onOpenDonation={() => setIsDonationOpen(true)}
              onOpenAdminConsole={handleOpenAdminConsole}
              onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
              savedCount={bookmarks.length}
              journalCount={journalEntries.length}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile/tablet screens < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={bookmarks.length}
        theme={theme}
      />

      {/* Daily Promo Popup ("First load of the day" across all devices) */}
      <DailyPromoPopup
        isOpen={isDailyPromoOpen}
        onClose={() => setIsDailyPromoOpen(false)}
        onExploreToday={() => {
          setIsDailyPromoOpen(false);
          setActiveTab("daily-app");
        }}
        todayVerse={(() => {
          const currentDayShloka = getDailyShlokaForDate();
          return {
            devanagari: currentDayShloka.sanskrit.split("\n")[0] || currentDayShloka.title,
            translation: currentDayShloka.meaning,
            source: `${currentDayShloka.source} · ${currentDayShloka.chapterName} • प्रातः स्मरण`,
          };
        })()}
      />

      {/* Sādhaka Seeker Profile Modal */}
      <SadhakaProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        savedCount={bookmarks.length}
        journalCount={journalEntries.length}
        theme={theme}
        onSelectTheme={handleSelectTheme}
        onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Seeker User Sign In & Sign Off Modal (via Gmail / Firebase & Email ID) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        theme={theme}
        onOpenPrivacyPolicy={() => {
          setIsAuthOpen(false);
          setIsPrivacyOpen(true);
        }}
      />

      {/* Legal Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        theme={theme}
      />

      {/* Store Assets & App Icon Showcase Modal (1024x1024 Icon & Screenshots) */}
      <StoreAssetsViewer
        isOpen={isAssetsOpen}
        onClose={() => setIsAssetsOpen(false)}
        theme={theme}
      />

      {/* Verse Detail Reader Modal */}
      <VerseModal
        item={selectedVerse}
        isOpen={isModalOpen}
        isBookmarked={selectedVerse ? bookmarks.includes(selectedVerse.id) : false}
        onClose={() => setIsModalOpen(false)}
        onToggleBookmark={toggleBookmark}
        onSaveJournalNote={handleSaveJournalNote}
        onOpenWord={(surface) => wordExplorer.openWord(surface)}
        wordExplorer={wordExplorer}
        theme={theme}
      />

      {/* SutraSparsh Word Explorer Modal / Drawer */}
      <WordExplorer
        isOpen={wordExplorer.isOpen}
        word={wordExplorer.currentWord}
        selectedComponentId={wordExplorer.selectedComponentId}
        activeTab={wordExplorer.activeTab}
        isLoading={wordExplorer.isLoading}
        searchResults={wordExplorer.searchResults}
        onClose={wordExplorer.closeWord}
        onSelectComponent={wordExplorer.selectComponent}
        onSelectWord={wordExplorer.selectWord}
        onTabChange={wordExplorer.setActiveTab}
        onSearch={wordExplorer.search}
        theme={theme}
      />

      {/* SutraSparsh 'Look Closer' Interactive Discovery Experience */}
      <LookCloserModal
        isOpen={isLookCloserOpen}
        onClose={() => setIsLookCloserOpen(false)}
        verse={selectedVerse || undefined}
        theme={theme}
        onOpenWordExplorer={(word) => {
          setIsLookCloserOpen(false);
          wordExplorer.selectWord(word, selectedVerse || undefined);
        }}
      />

      {/* Global Monetization & Billing Modals (Phase 2 Features: Gated by Feature Flags) */}
      <PricingModal
        isOpen={isPricingOpen && isSadhakaEnabled}
        onClose={() => setIsPricingOpen(false)}
        onSuccessSubscription={() => {
          setActiveTab("my-journey");
        }}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen && isGurudakshinaEnabled}
        onClose={() => setIsDonationOpen(false)}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen && isSadhakaEnabled}
        onClose={() => setIsPaywallOpen(false)}
        onOpenPricing={() => {
          if (isSadhakaEnabled) setIsPricingOpen(true);
        }}
        featureTitle={paywallFeature.title}
        featureDescription={paywallFeature.description}
      />

      {/* Footer */}
      <footer
        className={`border-t py-8 mt-12 text-center text-xs space-y-3 transition-colors ${
          theme === "light"
            ? "border-[#E8DCC2] bg-[#FFFDF8] text-[#6E5C4E]"
            : "border-stone-900 bg-stone-950 text-stone-500"
        }`}
      >
        <div
          className={`flex items-center justify-center space-x-2 ${
            theme === "light" ? "text-[#261B12]" : "text-stone-400"
          }`}
        >
          <span
            className={`font-serif-sacred font-bold ${
              theme === "light" ? "text-[#A64E04]" : "text-amber-200"
            }`}
          >
            SutraSparsh
          </span>
          <span>•</span>
          <span className="font-sanskrit">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</span>
        </div>
        <p
          className={`text-[11px] max-w-lg mx-auto px-4 ${
            theme === "light" ? "text-[#4A3A2F]" : "text-stone-400"
          }`}
        >
          Dedicated to the preservation, exploration, and meditative study of sacred spiritual wisdom.
        </p>

        {/* Get it on Google Play Badge */}
        <div className="py-2 flex justify-center">
          <a
            id="footer-google-play-btn"
            href="https://play.google.com/store/apps/details?id=com.yds.sutrasparsh"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-lg transition-all duration-200 group active:scale-[0.98] cursor-pointer ${
              theme === "light"
                ? "bg-[#FFFDF8] hover:bg-[#F5EEDB] text-[#261B12] border-[#E8DCC2] hover:border-[#DECB9F] shadow-[0_4px_20px_-2px_rgba(80,50,20,0.06),0_0_0_1px_rgba(222,203,159,0.4)]"
                : "bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-800 hover:border-amber-500/50 hover:shadow-amber-500/10"
            }`}
            title="Get SutraSparsh on Google Play"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-amber-400 to-blue-500 flex items-center justify-center p-0.5 shadow-sm">
              <div
                className={`w-full h-full rounded-[9px] flex items-center justify-center ${
                  theme === "light" ? "bg-[#FFFDF8]" : "bg-stone-950"
                }`}
              >
                <Play
                  className={`w-3.5 h-3.5 ml-0.5 ${
                    theme === "light" ? "fill-[#A64E04] text-[#A64E04]" : "fill-amber-400 text-amber-400"
                  }`}
                />
              </div>
            </div>
            <div className="text-left leading-tight">
              <span
                className={`block text-[9px] uppercase tracking-wider font-medium ${
                  theme === "light" ? "text-[#6E5C4E]" : "text-stone-400"
                }`}
              >
                Get it on
              </span>
              <span
                className={`block text-sm font-semibold transition-colors ${
                  theme === "light"
                    ? "text-[#261B12] group-hover:text-[#A64E04]"
                    : "text-stone-100 group-hover:text-amber-200"
                }`}
              >
                Google Play
              </span>
            </div>
          </a>
        </div>

        {/* Store Listing, Legal, and Seeker Navigation Links */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 text-[11px] pt-1 ${
            theme === "light" ? "text-[#6E5C4E]" : "text-stone-400"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className={`transition-colors cursor-pointer ${
              theme === "light" ? "hover:text-[#A64E04]" : "hover:text-amber-300"
            }`}
          >
            Seeker Sign In / Sign Off
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsAssetsOpen(true)}
            className="hover:text-amber-300 transition-colors cursor-pointer"
          >
            Store Assets (1024x1024 Icon & Screens)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-amber-300 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <a
            href="/terms.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
