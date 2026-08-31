import React, { useState, useEffect } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  Palette,
  Maximize2,
  Heart,
} from "lucide-react";
import type {
  ShareableContent,
  ShareChannel,
  ShareCardTemplate,
  ShareCardDimension,
} from "../types/sharing";
import {
  sharingService,
  CARD_DIMENSIONS,
  TEMPLATE_STYLES,
} from "../services/sharing.service";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareableContent | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "card">("quick");
  const [personalNote, setPersonalNote] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ShareCardTemplate>("traditional_gold");
  const [selectedDimension, setSelectedDimension] =
    useState<ShareCardDimension>("square");
  const [previewCardUrl, setPreviewCardUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (content && isOpen) {
      setIsGenerating(true);
      const url = sharingService.generateCardDataUrl(
        content,
        selectedTemplate,
        selectedDimension
      );
      setPreviewCardUrl(url);
      setIsGenerating(false);
    }
  }, [content, selectedTemplate, selectedDimension, isOpen]);

  if (!isOpen || !content) return null;

  const handleCopyLink = async () => {
    await sharingService.copyToClipboard(content, personalNote);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    const success = await sharingService.triggerNativeShare(content, personalNote);
    if (success) {
      onClose();
    }
  };

  const handleSocialClick = (channel: ShareChannel) => {
    const url = sharingService.getShareLink(content, channel, personalNote);
    sharingService.trackShareEvent(content, channel);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadCard = () => {
    if (!previewCardUrl) return;
    const a = document.createElement("a");
    a.href = previewCardUrl;
    a.download = `SutraSparsh_${content.title.replace(/\s+/g, "_")}_${selectedTemplate}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sharingService.trackShareEvent(
      content,
      "card_download",
      selectedTemplate,
      selectedDimension
    );
  };

  const handleCopyCardImage = async () => {
    try {
      if (!previewCardUrl) return;
      const res = await fetch(previewCardUrl);
      const blob = await res.blob();
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        sharingService.trackShareEvent(
          content,
          "card_download",
          selectedTemplate,
          selectedDimension
        );
      }
    } catch {
      handleDownloadCard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#1a1007] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#24150a]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-sacred text-base font-bold text-amber-100">
                Share Sacred Wisdom
              </h3>
              <p className="text-[11px] text-amber-400/80">
                {content.title} · {content.source}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800/80 px-6 pt-3 gap-6 bg-[#160c04]">
          <button
            onClick={() => setActiveTab("quick")}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === "quick"
                ? "text-amber-300"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Quick Share & Channels
            {activeTab === "quick" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("card")}
            className={`pb-3 text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
              activeTab === "card"
                ? "text-amber-300"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Wisdom Card Generator</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              V1.5
            </span>
            {activeTab === "card" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "quick" ? (
            <>
              {/* Shloka Snippet Preview */}
              <div className="p-4 rounded-2xl bg-[#281608] border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-mono">
                  <span>Sanskrit Verse Preview</span>
                  <span className="text-stone-400">sutrasparsh.com</span>
                </div>
                <p className="font-sanskrit text-amber-100 text-sm leading-relaxed whitespace-pre-line">
                  {content.sanskritText}
                </p>
                {content.meaning && (
                  <p className="text-xs text-stone-300 italic pt-1 border-t border-amber-500/10">
                    "{content.meaning}"
                  </p>
                )}
              </div>

              {/* Personal Note / Custom Message (M39.4) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                  <span>Add a personal thought (optional):</span>
                  <span className="text-[10px] text-stone-500 font-mono">M39</span>
                </label>
                <input
                  type="text"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="e.g. 'Thought you might find peace in this shloka today...'"
                  className="w-full px-3.5 py-2.5 bg-[#120a04] border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Primary Channel Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
                  Select Channel:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleSocialClick("whatsapp")}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 hover:border-emerald-500 text-emerald-200 hover:bg-emerald-900/30 transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleSocialClick("telegram")}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-950/40 border border-sky-800/50 hover:border-sky-500 text-sky-200 hover:bg-sky-900/30 transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Telegram</span>
                  </button>

                  {/* X / Twitter */}
                  <button
                    onClick={() => handleSocialClick("x")}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-600 text-stone-200 hover:bg-stone-800 transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-200 group-hover:scale-110 transition-transform font-bold text-sm">
                      𝕏
                    </div>
                    <span className="text-xs font-semibold">X (Twitter)</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleSocialClick("facebook")}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-950/40 border border-blue-800/50 hover:border-blue-500 text-blue-200 hover:bg-blue-900/30 transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform font-bold text-sm">
                      f
                    </div>
                    <span className="text-xs font-semibold">Facebook</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={() => handleSocialClick("email")}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 hover:border-amber-500 text-amber-200 hover:bg-amber-900/30 transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Email</span>
                  </button>

                  {/* Native Device Share Sheet (M38.3) */}
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:scale-[1.02] transition-all space-y-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">System Share</span>
                  </button>
                </div>
              </div>

              {/* Copy Canonical Link */}
              <div className="pt-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#281608] hover:bg-[#341d0b] border border-amber-500/30 text-amber-200 font-semibold text-xs transition-all shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">
                        Canonical Deep Link Copied with Attribution!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copy Exact Shloka Link (sutrasparsh.com)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Tab 2: Visual Card Generator (M41) */
            <div className="space-y-5">
              {/* Template Picker */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
                  1. Choose Card Aesthetics:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(Object.keys(TEMPLATE_STYLES) as ShareCardTemplate[]).map((tmplKey) => {
                    const tmpl = TEMPLATE_STYLES[tmplKey];
                    const isSel = selectedTemplate === tmplKey;
                    return (
                      <button
                        key={tmplKey}
                        onClick={() => setSelectedTemplate(tmplKey)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSel
                            ? "border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/40"
                            : "border-stone-800 bg-[#120a04] hover:border-stone-700"
                        }`}
                      >
                        <span className="text-xs font-bold text-stone-200 block truncate">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          {tmpl.themeBadge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dimension Picker */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
                  2. Choose Aspect Ratio:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CARD_DIMENSIONS) as ShareCardDimension[]).map(
                    (dimKey) => {
                      const dim = CARD_DIMENSIONS[dimKey];
                      const isSel = selectedDimension === dimKey;
                      return (
                        <button
                          key={dimKey}
                          onClick={() => setSelectedDimension(dimKey)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSel
                              ? "border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/40"
                              : "border-stone-800 bg-[#120a04] hover:border-stone-700"
                          }`}
                        >
                          <span className="text-xs font-bold text-stone-200 block">
                            {dim.label}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {dim.subLabel}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
                  3. Card Preview:
                </span>
                <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
                  {isGenerating || !previewCardUrl ? (
                    <div className="text-xs text-amber-300/70 animate-pulse flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Rendering sacred typography card...</span>
                    </div>
                  ) : (
                    <img
                      src={previewCardUrl}
                      alt="Sacred Wisdom Card Preview"
                      className="max-h-[280px] max-w-full rounded-xl shadow-lg border border-amber-500/30 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons for Card */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadCard}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow hover:scale-[1.02] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </button>

                <button
                  onClick={handleCopyCardImage}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#281608] hover:bg-[#341d0b] border border-amber-500/30 text-amber-200 font-bold text-xs transition-all"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800/80 bg-[#160c04] flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center space-x-1">
            <span>Preserves exact verse canonical deep-link</span>
          </span>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
