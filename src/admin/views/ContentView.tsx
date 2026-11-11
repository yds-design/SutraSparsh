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
import { ModalPortal } from "../../components/ModalPortal";

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
    const matchesCat = selectedCategory === "All" || (v.metadata?.category || (v as any).category) === selectedCategory;
    const matchesTrad =
      selectedTradition === "All" ||
      ((v.metadata?.author || (v as any).source || "").toLowerCase().includes(selectedTradition.toLowerCase())) ||
      v.title.toLowerCase().includes(selectedTradition.toLowerCase());
    return matchesSearch && matchesCat && matchesTrad;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="ui-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="ui-badge ui-badge-info mb-1">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span>Corpus & Scripture Administration (M40)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Sacred Content Studio
            </h1>
            <p className="text-slate-500 text-xs mt-1">
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
                className="ui-button"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sacred Verse</span>
              </button>
            )}

            <button
              onClick={loadCorpus}
              title="Refresh Corpus"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="ui-alert ui-alert-info">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="ui-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Sanskrit, title, meaning..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input pl-10"
            />
          </div>

          {/* Tradition Filter */}
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="ui-select"
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
            className="ui-select"
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
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between mt-3 animate-fadeIn">
            <span className="text-xs text-blue-800 font-semibold">
              {selectedIds.length} verses selected
            </span>
            <div className="flex items-center space-x-2">
              {canPublish && (
                <button
                  onClick={handleBulkPublish}
                  className="ui-button py-1 px-3 text-xs"
                >
                  Bulk Verify & Publish
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="ui-button-secondary py-1 px-3 text-xs rounded-lg"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Corpus Verses Container */}
      <div className="ui-table-container">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filteredVerses.length}
              onChange={handleSelectAll}
              className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="font-semibold text-slate-800">
              Showing {filteredVerses.length} Scriptures
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Canonical Corpus M40.1
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {filteredVerses.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start space-x-3 max-w-3xl">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="mt-1 rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.metadata?.author || "Sacred Text"}
                      </span>
                      {item.metadata?.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {item.metadata.category}
                        </span>
                      )}
                    </div>

                    <p className="font-sanskrit text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {item.body}
                    </p>
                    <p className="text-slate-500 text-xs leading-relaxed italic font-light">
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
                      className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs transition-colors flex items-center space-x-1"
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
        <ModalPortal>
          <div className="ui-overlay">
            <div className="ui-modal max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVerse?.id ? `Edit Verse: ${editingVerse.title}` : "Add New Scripture Verse"}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕ Close
                </button>
              </div>

            <form onSubmit={handleSaveVerse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">
                    Scripture Title / Ref *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVerse?.title || ""}
                    onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="e.g. Bhagavad Gita 2.47"
                    className="ui-input"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">
                    Category / Yoga Path
                  </label>
                  <input
                    type="text"
                    value={editingVerse?.category || "Karma Yoga"}
                    onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, category: e.target.value } : null)}
                    className="ui-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-700 font-bold block mb-1">
                  Primary Sanskrit Text (Devanagari) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingVerse?.body || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, body: e.target.value } : null)}
                  placeholder="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन..."
                  className="ui-textarea font-sanskrit text-amber-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-600 block mb-1">
                  IAST Transliteration (Romanized)
                </label>
                <input
                  type="text"
                  value={editingVerse?.transliteration || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, transliteration: e.target.value } : null)}
                  placeholder="karmaṇy-evādhikāras te mā phaleṣu kadācana..."
                  className="ui-input"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-600 block mb-1">
                  English Philosophical Meaning & Purport
                </label>
                <textarea
                  rows={3}
                  value={editingVerse?.meaning || ""}
                  onChange={(e) => setEditingVerse((prev) => prev ? { ...prev, meaning: e.target.value } : null)}
                  placeholder="You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions..."
                  className="ui-textarea text-slate-700 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="ui-button ui-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button"
                >
                  Save & Validate Scripture
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};
