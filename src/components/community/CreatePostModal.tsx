import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Send,
  AlertTriangle,
  Lock,
  Tag,
  HelpCircle,
  Sun,
  Compass,
  Flame,
  Volume2,
} from "lucide-react";
import { ModalPortal } from "../ModalPortal";
import {
  communityService,
  COMMUNITY_CATEGORIES,
  type CommunityCategory,
  type ScriptureRef,
} from "../../services/community.service";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLight?: boolean;
}

const COMMON_SCRIPTURE_PRESETS: ScriptureRef[] = [
  { scriptureId: "gita", verseRef: "Gītā 2.47", sanskritSnippet: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" },
  { scriptureId: "gita", verseRef: "Gītā 6.5", sanskritSnippet: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्" },
  { scriptureId: "yoga-sutras", verseRef: "Yoga Sūtras 1.2", sanskritSnippet: "योगश्चित्तवृत्तिनिरोधः" },
  { scriptureId: "upanishads", verseRef: "Isha Upaniṣad 1", sanskritSnippet: "ईशा वास्यमिदं सर्वम्" },
  { scriptureId: "upanishads", verseRef: "Katha Upaniṣad 1.3.14", sanskritSnippet: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत" },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isLight = false,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("gita");
  const [tagsInput, setTagsInput] = useState("Satsang, Sadhana");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [scriptureRef, setScriptureRef] = useState<ScriptureRef | null>(null);
  const [customScriptureRef, setCustomScriptureRef] = useState("");
  const [showScripturePicker, setShowScripturePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [crisisAlert, setCrisisAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setCrisisAlert(false);

    if (title.trim().length < 5) {
      setErrorMessage("Title must be at least 5 characters long.");
      return;
    }
    if (body.trim().length < 15) {
      setErrorMessage("Reflection must be at least 15 characters long.");
      return;
    }

    setIsSubmitting(true);

    const tags = (tagsInput || "")
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const finalScripture = scriptureRef || (customScriptureRef.trim() ? { scriptureId: "custom", verseRef: customScriptureRef.trim() } : undefined);

    const result = communityService.createPost({
      title: title.trim(),
      body: body.trim(),
      category,
      tags,
      scriptureRef: finalScripture,
      isAnonymous,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Failed to publish reflection.");
      return;
    }

    if (result.crisisDetected) {
      setCrisisAlert(true);
    } else {
      onSuccess();
    }
  };

  const getCategoryIcon = (cat: CommunityCategory) => {
    switch (cat) {
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
        return HelpCircle;
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-post-title"
      >
        <div
          className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-amber-500/15">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                  Satsang Mandali • नया विचार
                </span>
                <h2 id="compose-post-title" className="text-lg sm:text-xl font-bold font-serif-sacred text-amber-200">
                  Share Sacred Reflection or Inquiry
                </h2>
              </div>
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {crisisAlert && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500 text-amber-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-300">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Support & Sacred Sanctuary Guidance</span>
                </div>
                <p>
                  You are deeply valued and never alone in your spiritual journey. If you are experiencing overwhelming
                  distress, please reach out immediately to dedicated compassionate listeners:
                </p>
                <div className="p-2.5 rounded-xl bg-stone-900 border border-amber-500/30 font-mono text-[11px] text-amber-100">
                  India Tele-MANAS: 14416 | Global Crisis Care: 988 (US/Canada) | Dedicated 24/7 Helpline
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-amber-500 mb-2 uppercase tracking-wide">
                Topic Tradition / श्रेणी
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMUNITY_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                  const Icon = getCategoryIcon(cat.id);
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40"
                          : isLight
                          ? "bg-white/80 border-stone-200 hover:border-amber-300 text-stone-800"
                          : "bg-stone-900/60 border-stone-800 hover:border-amber-500/30 text-stone-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400" : "text-stone-400"}`} />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{cat.name}</div>
                        <div className="text-[10px] opacity-75 font-sanskrit">{cat.sanskrit}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title */}
            <div>
              <label htmlFor="post-title-input" className="block text-xs font-bold text-amber-500 mb-1.5 uppercase tracking-wide">
                Reflection Title / शीर्षक
              </label>
              <input
                id="post-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="e.g. How do you practice Nishkāma Karma during deadline crunches?"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  isLight
                    ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                    : "bg-stone-900 border-stone-800 focus:border-amber-400 text-stone-100"
                }`}
              />
              <div className="flex justify-end text-[10px] text-stone-500 font-mono mt-1">
                {title.length}/150
              </div>
            </div>

            {/* Optional Scripture Reference Tag */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-500 uppercase tracking-wide flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Link Sacred Shloka Reference (Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowScripturePicker(!showScripturePicker)}
                  className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  {showScripturePicker ? "Hide Presets" : "Select from Presets"}
                </button>
              </div>

              {showScripturePicker && (
                <div className="mb-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <span className="text-[10.5px] text-amber-300 font-medium block">Tap a canonical scripture to link:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SCRIPTURE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setScriptureRef(p);
                          setShowScripturePicker(false);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          scriptureRef?.verseRef === p.verseRef
                            ? "bg-amber-500 text-stone-950 border-amber-400 font-bold"
                            : "bg-stone-900/80 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                        }`}
                      >
                        {p.verseRef}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {scriptureRef ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">{scriptureRef.verseRef}</span>
                    {scriptureRef.sanskritSnippet && (
                      <span className="text-[11px] opacity-80 font-sanskrit hidden sm:inline truncate max-w-xs">
                        "{scriptureRef.sanskritSnippet}"
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setScriptureRef(null)}
                    className="text-stone-400 hover:text-stone-200 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={customScriptureRef}
                  onChange={(e) => setCustomScriptureRef(e.target.value)}
                  placeholder="Or enter custom reference: e.g. Bhagavad Gita 2.47, Yoga Sutras 1.2"
                  className={`w-full px-4 py-2 rounded-xl border text-xs transition-all focus:outline-hidden ${
                    isLight
                      ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                      : "bg-stone-900 border-stone-800 focus:border-amber-400 text-stone-100"
                  }`}
                />
              )}
            </div>

            {/* Post Body Textarea */}
            <div>
              <label htmlFor="post-body-input" className="block text-xs font-bold text-amber-500 mb-1.5 uppercase tracking-wide">
                Contemplation / Reflection Body (Max 2,000 characters)
              </label>
              <textarea
                id="post-body-input"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                placeholder="Share your contemplation, question on meditation, commentary insight, or practical application of the verse..."
                className={`w-full px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all focus:outline-hidden resize-none ${
                  isLight
                    ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                    : "bg-stone-900 border-stone-800 focus:border-amber-400 text-stone-100"
                }`}
              />
              <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono mt-1">
                <span>Markdown supported (*italics*, **bold**)</span>
                <span className={body.length > 1900 ? "text-amber-400 font-bold" : ""}>
                  {body.length}/2000
                </span>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="post-tags-input" className="block text-xs font-bold text-amber-500 mb-1.5 uppercase tracking-wide flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                id="post-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Gita, KarmaYoga, Meditation, DailySadhana"
                className={`w-full px-4 py-2 rounded-xl border text-xs transition-all focus:outline-hidden ${
                  isLight
                    ? "bg-white border-stone-300 focus:border-amber-500 text-stone-900"
                    : "bg-stone-900 border-stone-800 focus:border-amber-400 text-stone-100"
                }`}
              />
            </div>

            {/* Anonymous Posting Option (FR-PST-06) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-stone-200">Post Anonymously (Gupta Sādhaka)</div>
                  <div className="text-[10px] text-stone-400">
                    Your name will appear as 'Gupta Sādhaka'. Maintain humility and privacy.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Submit Footer */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isLight
                    ? "border-stone-300 hover:bg-stone-200 text-stone-700"
                    : "border-stone-800 hover:bg-stone-900 text-stone-400"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Publishing..." : "Publish to Satsang"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
