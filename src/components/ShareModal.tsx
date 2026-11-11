import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Share2,
  Copy,
  Download,
  Check,
  Sparkles,
  Smartphone,
  Square,
  RectangleHorizontal,
} from "lucide-react";
import type {
  ShareableContent,
  ShareCardTemplate,
  ShareCardDimension,
} from "../types/sharing";
import { sharingService } from "../services/sharing.service";
import { ModalPortal } from "./ModalPortal";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareableContent | null;
  appTheme?: string;
}

interface FormatOption {
  id: ShareCardDimension;
  label: string;
  ratio: string;
  tooltip: string;
  icon: React.ReactNode;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "story",
    label: "Story",
    ratio: "9:16",
    tooltip: "Vertical Story · 1080 × 1920",
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  {
    id: "square",
    label: "Square",
    ratio: "1:1",
    tooltip: "Square Feed · 1080 × 1080",
    icon: <Square className="w-3.5 h-3.5" />,
  },
  {
    id: "landscape",
    label: "Banner",
    ratio: "16:9",
    tooltip: "Landscape Banner · 1200 × 630",
    icon: <RectangleHorizontal className="w-3.5 h-3.5" />,
  },
];

interface ThemeOption {
  id: ShareCardTemplate;
  name: string;
  gradient: string;
  borderColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "vedic_parchment",
    name: "Sacred Ivory",
    gradient: "linear-gradient(135deg, #F7EDDB, #E4D0A8)",
    borderColor: "#B86C0E",
  },
  {
    id: "sunrise_saffron",
    name: "Surya Saffron",
    gradient: "linear-gradient(135deg, #F49D37, #5A1E0C)",
    borderColor: "#F49D37",
  },
  {
    id: "meditation_indigo",
    name: "Amethyst Twilight",
    gradient: "linear-gradient(135deg, #7A5AF8, #170F26)",
    borderColor: "#E8A93E",
  },
  {
    id: "minimal",
    name: "Deep Stillness",
    gradient: "linear-gradient(135deg, #2D2D2D, #080502)",
    borderColor: "#D4AF37",
  },
  {
    id: "traditional_gold",
    name: "Sandstone Gold",
    gradient: "linear-gradient(135deg, #E8921A, #1C1008)",
    borderColor: "#E8921A",
  },
];

const getInitialTemplate = (appTheme?: string): ShareCardTemplate => {
  try {
    const saved = localStorage.getItem("sutrasparsh_share_theme");
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved as ShareCardTemplate;
    }
  } catch {}

  switch (appTheme) {
    case "light":
    case "parchment-dawn":
      return "vedic_parchment";
    case "golden-hour":
    case "festival":
      return "sunrise_saffron";
    case "amethyst":
      return "meditation_indigo";
    default:
      return "traditional_gold";
  }
};

const getInitialDimension = (): ShareCardDimension => {
  try {
    const saved = localStorage.getItem("sutrasparsh_share_format");
    if (saved && FORMAT_OPTIONS.some((f) => f.id === saved)) {
      return saved as ShareCardDimension;
    }
  } catch {}
  return "story";
};

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  content,
  appTheme,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ShareCardDimension>(getInitialDimension);
  const [selectedTheme, setSelectedTheme] = useState<ShareCardTemplate>(() => getInitialTemplate(appTheme));
  const [previewCardUrl, setPreviewCardUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Sync initial template if appTheme changes and no local override
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      setSelectedTheme(getInitialTemplate(appTheme));
      setSelectedFormat(getInitialDimension());
      setErrorMessage(null);
      setToastMessage(null);
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus?.();
      }
    }
  }, [isOpen, appTheme]);

  // Persist selections in localStorage
  const handleFormatChange = (fmt: ShareCardDimension) => {
    setSelectedFormat(fmt);
    setErrorMessage(null);
    try {
      localStorage.setItem("sutrasparsh_share_format", fmt);
    } catch {}
  };

  const handleThemeChange = (tpl: ShareCardTemplate) => {
    setSelectedTheme(tpl);
    setErrorMessage(null);
    try {
      localStorage.setItem("sutrasparsh_share_theme", tpl);
    } catch {}
  };

  // Live lightweight card render on format/theme changes
  useEffect(() => {
    if (content && isOpen) {
      try {
        const url = sharingService.generateCardDataUrl(content, selectedTheme, selectedFormat);
        setPreviewCardUrl(url);
      } catch (err) {
        setErrorMessage("Couldn't create the image. Try again.");
      }
    }
  }, [content, selectedTheme, selectedFormat, isOpen]);

  // Keyboard accessibility: Escape to close, focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Show temporary toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Primary Action: Share image (native Web Share API with fallback to save + copy link)
  const handleShareImage = async () => {
    if (!content) return;
    setIsSharing(true);
    setErrorMessage(null);

    try {
      const dataUrl = previewCardUrl || sharingService.generateCardDataUrl(content, selectedTheme, selectedFormat);
      if (!dataUrl) {
        throw new Error("Failed to generate image");
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const safeTitle = (content.title || "Shloka").replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, "_");
      const fileName = `SutraSparsh_${safeTitle}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const canonicalUrl = sharingService.generateCanonicalUrl(content, "native");
      const shareText = `${content.title}${content.source ? ` — ${content.source}` : ""}`;

      // Check if navigator.share supports file sharing
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: content.title,
          text: shareText,
          url: canonicalUrl,
        });
        sharingService.trackShareEvent(content, "native", selectedTheme, selectedFormat);
      } else {
        // Fallback for desktop & unsupported browsers: download image and copy link
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        await navigator.clipboard.writeText(canonicalUrl);
        showToast("Image saved. Link copied.");
        sharingService.trackShareEvent(content, "card_download", selectedTheme, selectedFormat);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setErrorMessage("Couldn't create the image. Try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Secondary Action: Save image (download PNG at target dimension)
  const handleSave = () => {
    if (!content) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const dataUrl = previewCardUrl || sharingService.generateCardDataUrl(content, selectedTheme, selectedFormat);
      if (!dataUrl) throw new Error("Image missing");

      const safeTitle = (content.title || "Shloka").replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, "_");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `SutraSparsh_${safeTitle}_${selectedFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      sharingService.trackShareEvent(content, "card_download", selectedTheme, selectedFormat);
    } catch {
      setErrorMessage("Couldn't create the image. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Secondary Action: Copy canonical shloka deep link
  const handleCopyLink = async () => {
    if (!content) return;
    try {
      const link = sharingService.generateCanonicalUrl(content, "copy_link");
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      sharingService.trackShareEvent(content, "copy_link");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isOpen || !content) return null;

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === selectedTheme) || THEME_OPTIONS[0];
  const shlokaReference = content.source
    ? `${content.title} · ${content.source}`
    : content.subtitle
    ? `${content.title} · ${content.subtitle}`
    : content.title;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
          aria-describedby="share-dialog-ref"
          className="relative w-full sm:max-w-[560px] max-h-[92vh] sm:max-h-none rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden bg-[#FAF7F0] dark:bg-[#181411] border border-[#E8DCC2] dark:border-stone-800 text-stone-900 dark:text-stone-100 transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8DCC2]/80 dark:border-stone-800 bg-[#F5EEDB]/60 dark:bg-stone-900/60">
            <div className="min-w-0 pr-3">
              <h2
                id="share-dialog-title"
                className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight"
              >
                Share this shloka
              </h2>
              <p
                id="share-dialog-ref"
                className="text-xs text-stone-600 dark:text-stone-400 truncate mt-0.5"
                title={shlokaReference}
              >
                {shlokaReference}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Two columns on desktop (preview left, controls right), stacked on mobile */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left Column: Live Card Preview in neutral surface container */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="w-full h-[230px] sm:h-[260px] rounded-xl bg-stone-100 dark:bg-stone-900/80 border border-[#E8DCC2]/70 dark:border-stone-800 p-2.5 flex items-center justify-center relative overflow-hidden"
              >
                {previewCardUrl ? (
                  <img
                    src={previewCardUrl}
                    alt={`Preview card for ${content.title}`}
                    className="max-h-[210px] sm:max-h-[240px] max-w-full object-contain rounded-md shadow-xs border border-black/5 transition-transform"
                  />
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs text-stone-400 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rendering preview...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Format, Theme, and Action Controls */}
            <div className="flex flex-col space-y-3.5 justify-center">
              {/* 1. Format Control: 3-option segmented radio group */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Format
                </span>
                <div
                  role="radiogroup"
                  aria-label="Card format"
                  className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-200/60 dark:bg-stone-900/80 border border-stone-300/60 dark:border-stone-800"
                >
                  {FORMAT_OPTIONS.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        title={fmt.tooltip}
                        onClick={() => handleFormatChange(fmt.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          isSelected
                            ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-xs border border-stone-200/80 dark:border-stone-700"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        }`}
                      >
                        {fmt.icon}
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Theme Control: Row of circular swatches with name label */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">
                    Theme: <span className="text-stone-900 dark:text-stone-100 font-bold">{currentThemeObj.name}</span>
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Card theme"
                  className="flex items-center space-x-2.5 pt-0.5"
                >
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={theme.name}
                        title={theme.name}
                        onClick={() => handleThemeChange(theme.id)}
                        style={{ background: theme.gradient }}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer relative shrink-0 ${
                          isSelected
                            ? "ring-2 ring-amber-600 ring-offset-2 ring-offset-[#FAF7F0] dark:ring-offset-[#181411] scale-110 shadow-xs"
                            : "border border-stone-300 dark:border-stone-700 hover:scale-105 opacity-90 hover:opacity-100"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Error feedback if card generation fails */}
              {errorMessage && (
                <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* 3. Action Buttons Stack */}
              <div className="space-y-2 pt-1">
                {/* Primary Button: Share Image (Full Width) */}
                <button
                  type="button"
                  onClick={handleShareImage}
                  disabled={isSharing}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isSharing ? "Sharing..." : "Share image"}</span>
                </button>

                {/* Secondary Buttons Row: Save & Copy link */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="py-2 px-3 rounded-xl font-medium text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl font-medium text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {toastMessage && (
                <div className="text-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 py-0.5 animate-fadeIn">
                  {toastMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
