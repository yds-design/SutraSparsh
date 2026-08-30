import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles, BookOpen, Sun, Activity, Bookmark, Flame, RefreshCw, Smartphone, Crown, Heart, Zap, ShieldCheck } from "lucide-react";
import type { ContentItem, ContentResponse, JournalEntry } from "./types";
import { Header, type NavTab } from "./components/Header";
import { VerseCard } from "./components/VerseCard";
import { VerseModal } from "./components/VerseModal";
import { DailySutra } from "./components/DailySutra";
import { WisdomJournal } from "./components/WisdomJournal";
import { SutraSparshAdminApp } from "./admin/SutraSparshAdminApp";
import { DailyShlokaMobile } from "./components/DailyShlokaMobile";
import { PricingModal } from "./components/PricingModal";
import { PaywallModal } from "./components/PaywallModal";
import { DonationModal } from "./components/DonationModal";
import { SubscriptionManagementPanel } from "./components/SubscriptionManagementPanel";
import type { SubscriptionPlanId } from "./types/monetization";

const TRADITIONS = ["All", "Bhagavad Gita", "Patanjali", "Upanishads", "Vedas"];
const CATEGORIES = ["All", "Karma Yoga", "Raja Yoga", "Mind & Meditation", "Jnana / Vedanta", "Vedic Chants"];

export default function App() {
  // App Mode Separation (Phase 22, M38-M46): 'user' (sutrasparsh.com) vs 'admin' (admin.sutrasparsh.com)
  const [appMode, setAppMode] = useState<"user" | "admin">("user");
  const [activeTab, setActiveTab] = useState<NavTab>("daily-app");
  const [verses, setVerses] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVerse, setSelectedVerse] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Monetization Modals & State (Phases 16–21)
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState({ title: "", description: "" });

  // Local storage for Bookmarks and Journal
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
    fetchContent();
  }, [selectedCategory, searchTerm]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveJournalNote = (verseId: string, verseTitle: string, note: string) => {
    const newEntry: JournalEntry = {
      id: `note-${Date.now()}`,
      verseId,
      verseTitle,
      note,
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleOpenVerse = (verse: ContentItem) => {
    setSelectedVerse(verse);
    setIsModalOpen(true);
  };

  const triggerPaywall = (title: string, description: string) => {
    setPaywallFeature({ title, description });
    setIsPaywallOpen(true);
  };

  // Filter by tradition client side
  const filteredVerses = verses.filter((v) => {
    if (selectedTradition === "All") return true;
    return (
      v.metadata.author?.toLowerCase().includes(selectedTradition.toLowerCase()) ||
      v.title.toLowerCase().includes(selectedTradition.toLowerCase())
    );
  });

  const dailyVerse = verses.length > 0 ? verses[0] : null;

  if (appMode === "admin") {
    return <SutraSparshAdminApp onSwitchToUserApp={() => setAppMode("user")} />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={bookmarks.length}
        backendOnline={backendOnline}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenAdminConsole={() => setAppMode("admin")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "daily-app" && (
          <DailyShlokaMobile onOpenAdmin={() => setAppMode("admin")} />
        )}

        {activeTab === "explorer" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero / Sacred Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 border border-stone-800 p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>Timeless Sanskrit Wisdom & Philosophical Heritage</span>
                </div>
                <h1 className="font-serif-sacred text-3xl sm:text-5xl font-bold tracking-tight text-amber-100 leading-tight">
                  Touch the Sacred Essence of Ancient Sutras
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                  Explore authentic verses from the Bhagavad Gita, Patanjali Yoga Sutras, and the Upanishads. Study transliterations, commentaries, and chant sacred mantras.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsPricingOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold rounded-xl text-xs shadow hover:scale-105 transition-all flex items-center space-x-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Explore Sādhaka & Rishi Memberships</span>
                  </button>
                  <button
                    onClick={() => setIsDonationOpen(true)}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Gurudakshina & Seva (80G Tax Exemption)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="space-y-4 bg-stone-900/60 border border-stone-800 rounded-3xl p-6 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  id="search-sacred-verses"
                  type="text"
                  placeholder="Search by Sanskrit verse, English meaning, topic (e.g., 'karma', 'mind', 'yoga')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-stone-950/90 border border-stone-800 rounded-2xl pl-12 pr-4 py-3.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 text-sm shadow-inner transition-colors"
                />
              </div>

              {/* Traditions / Authors Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-stone-400 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tradition:</span>
                </span>
                {TRADITIONS.map((tradition) => (
                  <button
                    key={tradition}
                    onClick={() => setSelectedTradition(tradition)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTradition === tradition
                        ? "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm"
                        : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                    }`}
                  >
                    {tradition}
                  </button>
                ))}
              </div>

              {/* Categories Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-stone-400 mr-2 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Path / Yoga:</span>
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm"
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
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Sacred Scripture Verses</span>
                  <span className="text-xs text-stone-500 font-sans font-normal ml-2">
                    ({filteredVerses.length} verses)
                  </span>
                </h3>

                <button
                  onClick={fetchContent}
                  title="Reload verses"
                  className="p-2 text-stone-500 hover:text-amber-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 h-64 animate-pulse space-y-4"
                    >
                      <div className="h-4 bg-stone-800 rounded w-1/3" />
                      <div className="h-6 bg-stone-800 rounded w-2/3" />
                      <div className="h-16 bg-stone-950/60 rounded" />
                      <div className="h-4 bg-stone-800 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredVerses.length === 0 ? (
                <div className="text-center py-16 bg-stone-900/30 border border-stone-800/80 rounded-3xl p-8 space-y-4">
                  <BookOpen className="w-12 h-12 text-stone-600 mx-auto" />
                  <h4 className="text-base font-bold text-stone-300">
                    No verses found for selected criteria
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try broadening your search query or choosing "All" in the filters above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVerses.map((item) => (
                    <VerseCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarks.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                      onSelect={handleOpenVerse}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "daily" && (
          <DailySutra
            verse={dailyVerse}
            isBookmarked={dailyVerse ? bookmarks.includes(dailyVerse.id) : false}
            onToggleBookmark={toggleBookmark}
            onSaveJournalNote={handleSaveJournalNote}
            onOpenDetails={handleOpenVerse}
          />
        )}

        {activeTab === "journal" && (
          <WisdomJournal
            entries={journalEntries}
            bookmarks={bookmarks}
            allVerses={verses}
            onDeleteEntry={handleDeleteJournalEntry}
            onOpenVerse={handleOpenVerse}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {activeTab === "membership" && (
          <SubscriptionManagementPanel onOpenPricing={() => setIsPricingOpen(true)} />
        )}
      </main>

      {/* Verse Detail Reader Modal */}
      <VerseModal
        item={selectedVerse}
        isOpen={isModalOpen}
        isBookmarked={selectedVerse ? bookmarks.includes(selectedVerse.id) : false}
        onClose={() => setIsModalOpen(false)}
        onToggleBookmark={toggleBookmark}
        onSaveJournalNote={handleSaveJournalNote}
      />

      {/* Global Monetization & Billing Modals (Phases 16–21) */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSuccessSubscription={() => {
          setActiveTab("membership");
        }}
      />

      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onOpenPricing={() => setIsPricingOpen(true)}
        featureTitle={paywallFeature.title}
        featureDescription={paywallFeature.description}
      />

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-8 mt-12 text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-stone-400">
          <span className="font-serif-sacred font-bold text-amber-200">SutraSparsh</span>
          <span>•</span>
          <span className="font-sanskrit">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</span>
        </div>
        <p className="text-[11px]">
          Dedicated to the preservation, exploration, and meditative study of sacred spiritual wisdom.
        </p>
      </footer>
    </div>
  );
}
