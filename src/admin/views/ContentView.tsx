import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Edit,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { ContentItem } from "../../types";
import { adminApiClient } from "../../services/admin-api.client";
import { adminAuthService } from "../../services/admin-auth.service";

interface ExtendedVerseForm {
  id?: string;
  title: string;
  body: string;
  transliteration?: string;
  meaning?: string;
  category: string;
  tradition: string;
  source: string;
}

export const ContentView: React.FC = () => {
  const [verses, setVerses] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTradition, setSelectedTradition] = useState("All");

  // Selection for bulk operations (M40.8)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal for Add/Edit Verse
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVerse, setEditingVerse] = useState<ExtendedVerseForm | null>(null);

  const canEdit = adminAuthService.hasPermission("content", "edit");
  const canCreate = adminAuthService.hasPermission("content", "create");
  const canPublish = adminAuthService.hasPermission("content", "publish");

  const loadCorpus = async () => {
    setLoading(true);
    try {
      const res = await adminApiClient.fetchCorpus({ limit: 100 });
      if (res.success && res.data) {
        setVerses(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorpus();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVerses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVerses.map((v) => v.id));
    }
  };

  const handleBulkPublish = () => {
    if (!canPublish) return;
    adminAuthService.logAudit("content", "BULK_PUBLISH", `Bulk verified and published ${selectedIds.length} verses`, {
      ids: selectedIds,
    });
    setNotification(`Successfully verified & published ${selectedIds.length} verses.`);
    setSelectedIds([]);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveVerse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVerse?.title) return;

    if (editingVerse.id) {
      // Update existing
      setVerses((prev) =>
        prev.map((v) =>
          v.id === editingVerse.id
            ? {
                ...v,
                title: editingVerse.title,
                body: editingVerse.body,
                transliteration: editingVerse.transliteration,
                meaning: editingVerse.meaning,
                metadata: {
                  ...v.metadata,
                  category: editingVerse.category,
                  author: editingVerse.tradition,
                  source: editingVerse.source,
                },
              }
            : v
        )
      );
      adminAuthService.logAudit("content", "EDIT_VERSE", `Edited verse ${editingVerse.id}`, {
        verseId: editingVerse.id,
      });
      setNotification(`Verse '${editingVerse.title}' updated successfully.`);
    } else {
      // Create new
      const newV: ContentItem = {
        id: `custom-${Date.now()}`,
        title: editingVerse.title || "Untitled Verse",
        body: editingVerse.body || "",
        transliteration: editingVerse.transliteration || "",
        meaning: editingVerse.meaning || "",
        metadata: {
          language: "sa",
          source: editingVerse.source || "Manual Entry",
          author: editingVerse.tradition || "Bhagavad Gita",
          category: editingVerse.category || "Karma Yoga",
          tags: ["sacred", "scripture"],
        },
      };
      setVerses((prev) => [newV, ...prev]);
      adminAuthService.logAudit("content", "CREATE_VERSE", `Created new verse ${newV.id}`, {
        verseId: newV.id,
      });
      setNotification(`New verse '${newV.title}' added to corpus.`);
    }

    setIsEditModalOpen(false);
    setEditingVerse(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredVerses = verses.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.body.toLowerCase().includes(search.toLowerCase()) ||
      (v.meaning || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || v.metadata.category === selectedCategory;
    const matchesTrad =
      selectedTradition === "All" ||
      (v.metadata.author || "").toLowerCase().includes(selectedTradition.toLowerCase()) ||
      v.title.toLowerCase().includes(selectedTradition.toLowerCase());
    return matchesSearch && matchesCat && matchesTrad;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Corpus & Scripture Administration (M40)</span>
          </div>
          <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Sacred Content Studio
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Curate Sanskrit verses, transliterations, word-by-word etymology, commentaries, and chants.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canCreate && (
            <button
              onClick={() => {
                setEditingVerse({
                  title: "",
                  body: "",
                  transliteration: "",
                  meaning: "",
                  category: "Karma Yoga",
                  tradition: "Bhagavad Gita",
                  source: "Srimad Bhagavad Gita",
                });
                setIsEditModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sacred Verse</span>
            </button>
          )}

          <button
            onClick={loadCorpus}
            title="Refresh Corpus"
            className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-5 shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search by Sanskrit, title, meaning..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Tradition Filter */}
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="All">All Traditions (Bhagavad Gita, Yoga Sutras, Upanishads)</option>
            <option value="Bhagavad Gita">Bhagavad Gita</option>
            <option value="Patanjali">Patanjali Yoga Sutras</option>
            <option value="Upanishads">Upanishads</option>
            <option value="Vedas">Vedas</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="All">All Categories / Yogas</option>
            <option value="Karma Yoga">Karma Yoga</option>
            <option value="Raja Yoga">Raja Yoga</option>
            <option value="Mind & Meditation">Mind & Meditation</option>
            <option value="Jnana / Vedanta">Jnana / Vedanta</option>
            <option value="Vedic Chants">Vedic Chants</option>
          </select>
        </div>

        {/* Bulk Actions Bar (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between animate-fadeIn">
            <span className="text-xs text-amber-200 font-semibold">
              {selectedIds.length} verses selected
            </span>
            <div className="flex items-center space-x-2">
              {canPublish && (
                <button
                  onClick={handleBulkPublish}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  Bulk Verify & Publish
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-stone-200 text-xs border border-stone-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Corpus Verses Table */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filteredVerses.length}
              onChange={handleSelectAll}
              className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
            />
            <span className="font-semibold text-stone-300">
              Showing {filteredVerses.length} Scriptures
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Canonical Corpus M40.1
          </span>
        </div>

        <div className="divide-y divide-stone-800/60 overflow-x-auto">
          {filteredVerses.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-stone-900/80 ${
                  isSelected ? "bg-amber-500/5" : ""
                }`}
              >
                <div className="flex items-start space-x-3 max-w-3xl">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="mt-1 rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif-sacred font-bold text-amber-100 text-sm">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.metadata?.author || "Sacred Text"}
                      </span>
                      {item.metadata?.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-950 text-stone-400 border border-stone-800">
                          {item.metadata.category}
                        </span>
                      )}
                    </div>

                    <p className="font-sanskrit text-stone-300 text-xs sm:text-sm line-clamp-1">
                      {item.body}
                    </p>
                    <p className="text-stone-400 text-xs line-clamp-1 italic font-light">
                      {item.meaning || item.transliteration}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingVerse({
                          id: item.id,
                          title: item.title,
                          body: item.body,
                          transliteration: item.transliteration || "",
                          meaning: item.meaning || "",
                          category: item.metadata?.category || "Karma Yoga",
                          tradition: item.metadata?.author || "Bhagavad Gita",
                          source: item.metadata?.source || "Canonical Source",
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-400 hover:text-amber-300 text-xs transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Create Verse Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif-sacred text-lg font-bold text-amber-100">
                {editingVerse?.id ? `Edit Verse: ${editingVerse.title}` : "Add New Scripture Verse"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveVerse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-stone-400 block mb-1">
                    Scripture Title / Ref *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVerse?.title || ""}
                    onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="e.g. Bhagavad Gita 2.47"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-stone-400 block mb-1">
                    Category / Yoga Path
                  </label>
                  <input
                    type="text"
                    value={editingVerse?.category || "Karma Yoga"}
                    onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-amber-300 block mb-1">
                  Primary Sanskrit Text (Devanagari) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingVerse?.body || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, body: e.target.value } : null)}
                  placeholder="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-sanskrit text-amber-200 focus:outline-none focus:border-amber-500/60 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  IAST Transliteration (Romanized)
                </label>
                <input
                  type="text"
                  value={editingVerse?.transliteration || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, transliteration: e.target.value } : null)}
                  placeholder="karmaṇy-evādhikāras te mā phaleṣu kadācana..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  English Philosophical Meaning & Purport
                </label>
                <textarea
                  rows={3}
                  value={editingVerse?.meaning || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, meaning: e.target.value } : null)}
                  placeholder="You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-300 focus:outline-none focus:border-amber-500/60 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow hover:scale-105 transition-all"
                >
                  Save & Validate Scripture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
