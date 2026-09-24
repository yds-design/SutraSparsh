import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Copy,
  Download,
  MessageCircle,
  Send,
  ExternalLink,
  Check,
  Palette,
  Sparkles,
  Smartphone,
  Square,
  RectangleHorizontal,
} from "lucide-react";
import {
  ShareableContent,
  ShareChannel,
  ShareCardTemplate,
  ShareCardDimension,
} from "../types/sharing";
import { sharingService, CARD_DIMENSIONS, TEMPLATE_STYLES } from "../services/sharing.service";
import { ModalPortal } from "./ModalPortal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareableContent | null;
  appTheme?: string;
}

interface ThemeStyles {
  modalContainer: string;
  headerBg: string;
  headerBorder: string;
  headerTitle: string;
  headerSub: string;
  iconBg: string;
  iconColor: string;
  closeBtn: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabActiveText: string;
  tabInactiveText: string;
  tabIndicator: string;
  badgeBg: string;
  previewCardBg: string;
  previewCardBorder: string;
  previewVerseText: string;
  previewMeaningText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  inputLabel: string;
  channelHeader: string;
  channelCardText: string;
  aspectRatioActive: string;
  aspectRatioInactive: string;
  templateActive: string;
  templateInactive: string;
  cardPreviewOuterBg: string;
  cardPreviewOuterBorder: string;
  downloadBtn: string;
  copyBtn: string;
  copyLinkBtn: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
  accentText: string;
}

const getModalThemeStyles = (theme?: string): ThemeStyles => {
  switch (theme) {
    case "light":
      return {
        modalContainer: "bg-[#FFFDF9] border border-stone-300 text-stone-900 shadow-2xl",
        headerBg: "bg-[#F5EFEB]",
        headerBorder: "border-stone-200",
        headerTitle: "text-stone-950 font-bold",
        headerSub: "text-amber-800 font-semibold",
        iconBg: "bg-amber-100 border border-amber-300",
        iconColor: "text-amber-700",
        closeBtn: "text-stone-500 hover:text-stone-900 hover:bg-stone-200",
        tabBarBg: "bg-[#EFE7E0]",
        tabBarBorder: "border-stone-200",
        tabActiveText: "text-amber-900 font-bold",
        tabInactiveText: "text-stone-600 hover:text-stone-900 font-medium",
        tabIndicator: "bg-amber-600",
        badgeBg: "bg-amber-100 text-amber-900 border border-amber-300",
        previewCardBg: "bg-[#F7F2EB]",
        previewCardBorder: "border-stone-300",
        previewVerseText: "text-stone-950 font-bold",
        previewMeaningText: "text-stone-700 italic",
        inputBg: "bg-white",
        inputBorder: "border-stone-300 focus:border-amber-600",
        inputText: "text-stone-900",
        inputPlaceholder: "placeholder-stone-400",
        inputLabel: "text-stone-700",
        channelHeader: "text-amber-800",
        channelCardText: "text-stone-700",
        aspectRatioActive: "bg-amber-100 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-500/30",
        aspectRatioInactive: "bg-white border-stone-300 text-stone-700 hover:border-amber-400 hover:bg-stone-50",
        templateActive: "bg-amber-100 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500/30",
        templateInactive: "bg-white border-stone-200 text-stone-700 hover:border-stone-300",
        cardPreviewOuterBg: "bg-stone-100/80",
        cardPreviewOuterBorder: "border-stone-300",
        downloadBtn: "bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-white border-stone-300 hover:bg-stone-100 text-stone-800 font-bold shadow-xs",
        copyLinkBtn: "bg-[#F5EFEB] hover:bg-[#ECE3DB] border-stone-300 text-stone-800 font-semibold shadow-xs",
        footerBg: "bg-[#F5EFEB]",
        footerBorder: "border-stone-200",
        footerText: "text-stone-600",
        accentText: "text-amber-800 font-bold",
      };

    case "prism-pulse":
      return {
        modalContainer: "bg-[#FFFFFF] border border-stone-200 text-stone-900 shadow-2xl",
        headerBg: "bg-[#F8FAFC]",
        headerBorder: "border-stone-200",
        headerTitle: "text-stone-950 font-bold",
        headerSub: "text-indigo-700 font-semibold",
        iconBg: "bg-indigo-50 border border-indigo-200",
        iconColor: "text-indigo-600",
        closeBtn: "text-stone-500 hover:text-stone-950 hover:bg-stone-100",
        tabBarBg: "bg-[#F1F5F9]",
        tabBarBorder: "border-stone-200",
        tabActiveText: "text-indigo-950 font-bold",
        tabInactiveText: "text-stone-600 hover:text-stone-950 font-medium",
        tabIndicator: "bg-indigo-600",
        badgeBg: "bg-indigo-50 text-indigo-900 border border-indigo-200",
        previewCardBg: "bg-[#F8FAFC]",
        previewCardBorder: "border-stone-200",
        previewVerseText: "text-stone-950 font-bold",
        previewMeaningText: "text-stone-700 italic",
        inputBg: "bg-white",
        inputBorder: "border-stone-300 focus:border-indigo-500",
        inputText: "text-stone-900",
        inputPlaceholder: "placeholder-stone-400",
        inputLabel: "text-stone-700",
        channelHeader: "text-indigo-800",
        channelCardText: "text-stone-700",
        aspectRatioActive: "bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500/30",
        aspectRatioInactive: "bg-white border-stone-300 text-stone-700 hover:border-indigo-400 hover:bg-stone-50",
        templateActive: "bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-1 ring-indigo-500/30",
        templateInactive: "bg-white border-stone-200 text-stone-700 hover:border-stone-300",
        cardPreviewOuterBg: "bg-stone-50",
        cardPreviewOuterBorder: "border-stone-200",
        downloadBtn: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-white border-stone-300 hover:bg-stone-100 text-stone-800 font-bold shadow-xs",
        copyLinkBtn: "bg-[#F1F5F9] hover:bg-[#E2E8F0] border-stone-300 text-stone-800 font-semibold shadow-xs",
        footerBg: "bg-[#F8FAFC]",
        footerBorder: "border-stone-200",
        footerText: "text-stone-600",
        accentText: "text-indigo-800 font-bold",
      };

    case "amethyst":
      return {
        modalContainer: "bg-[#140A26] border border-[#52297A]/50 text-purple-100 shadow-2xl",
        headerBg: "bg-[#20113B]",
        headerBorder: "border-[#52297A]/40",
        headerTitle: "text-[#EDE0F8] font-bold",
        headerSub: "text-purple-300 font-medium",
        iconBg: "bg-purple-950/60 border border-purple-500/40",
        iconColor: "text-purple-300",
        closeBtn: "text-purple-300 hover:text-white hover:bg-purple-900/40",
        tabBarBg: "bg-[#170C2D]",
        tabBarBorder: "border-[#52297A]/30",
        tabActiveText: "text-purple-200 font-bold",
        tabInactiveText: "text-purple-300/70 hover:text-purple-100",
        tabIndicator: "bg-purple-400",
        badgeBg: "bg-purple-900/40 text-purple-200 border border-purple-500/40",
        previewCardBg: "bg-[#1E1138]",
        previewCardBorder: "border-[#52297A]/40",
        previewVerseText: "text-[#F3E8FF] font-medium",
        previewMeaningText: "text-purple-200/90 italic",
        inputBg: "bg-[#0F071D]",
        inputBorder: "border-[#52297A]/50 focus:border-purple-400",
        inputText: "text-purple-100",
        inputPlaceholder: "placeholder-purple-300/40",
        inputLabel: "text-purple-200",
        channelHeader: "text-purple-300",
        channelCardText: "text-purple-200",
        aspectRatioActive: "bg-purple-900/60 border-purple-400 text-purple-100 font-bold ring-2 ring-purple-400/30",
        aspectRatioInactive: "bg-[#1A0E33] border-[#52297A]/30 text-purple-200/80 hover:border-purple-400/40 hover:bg-[#20123D]",
        templateActive: "bg-purple-900/60 border-purple-400 text-purple-100 font-bold ring-1 ring-purple-400/30",
        templateInactive: "bg-[#1A0E33] border-[#52297A]/30 text-purple-200/70 hover:border-purple-400/40",
        cardPreviewOuterBg: "bg-black/60",
        cardPreviewOuterBorder: "border-purple-500/20",
        downloadBtn: "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-[#241344] border border-[#52297A]/50 hover:bg-[#301A5A] text-purple-200 font-bold",
        copyLinkBtn: "bg-[#1E1138] hover:bg-[#271649] border border-[#52297A]/40 text-purple-200 font-semibold",
        footerBg: "bg-[#170C2D]",
        footerBorder: "border-[#52297A]/40",
        footerText: "text-purple-300/70",
        accentText: "text-purple-300 font-bold",
      };

    case "festival":
      return {
        modalContainer: "bg-[#35050C] border border-[#FF8A00]/40 text-[#FFF6E3] shadow-2xl",
        headerBg: "bg-[#520914]",
        headerBorder: "border-[#FF8A00]/30",
        headerTitle: "text-[#FFF6E3] font-bold",
        headerSub: "text-amber-300 font-medium",
        iconBg: "bg-red-950/60 border border-[#FF8A00]/40",
        iconColor: "text-amber-400",
        closeBtn: "text-amber-200 hover:text-white hover:bg-red-950/40",
        tabBarBg: "bg-[#2A040A]",
        tabBarBorder: "border-[#FF8A00]/20",
        tabActiveText: "text-amber-200 font-bold",
        tabInactiveText: "text-amber-200/70 hover:text-white",
        tabIndicator: "bg-amber-500",
        badgeBg: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
        previewCardBg: "bg-[#480913]",
        previewCardBorder: "border-[#FF8A00]/30",
        previewVerseText: "text-[#FFF6E3] font-medium",
        previewMeaningText: "text-amber-200/90 italic",
        inputBg: "bg-[#200307]",
        inputBorder: "border-[#FF8A00]/30 focus:border-amber-400",
        inputText: "text-amber-100",
        inputPlaceholder: "placeholder-amber-300/40",
        inputLabel: "text-amber-200",
        channelHeader: "text-amber-400",
        channelCardText: "text-amber-200",
        aspectRatioActive: "bg-amber-500/25 border-amber-400 text-amber-100 font-bold ring-2 ring-amber-400/30",
        aspectRatioInactive: "bg-[#3F070E] border-[#FF8A00]/25 text-amber-100/80 hover:border-amber-400/40 hover:bg-[#4E0A13]",
        templateActive: "bg-amber-500/25 border-amber-400 text-amber-100 font-bold ring-1 ring-amber-400/30",
        templateInactive: "bg-[#3F070E] border-[#FF8A00]/25 text-amber-100/70 hover:border-amber-400/40",
        cardPreviewOuterBg: "bg-black/60",
        cardPreviewOuterBorder: "border-amber-500/20",
        downloadBtn: "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-[#4B0B15] border border-[#FF8A00]/35 hover:bg-[#600F1C] text-amber-200 font-bold",
        copyLinkBtn: "bg-[#480913] hover:bg-[#5C0C1B] border border-[#FF8A00]/30 text-amber-200 font-semibold",
        footerBg: "bg-[#2A040A]",
        footerBorder: "border-[#FF8A00]/20",
        footerText: "text-amber-200/70",
        accentText: "text-amber-400 font-bold",
      };

    case "golden-hour":
      return {
        modalContainer: "bg-[#18100A] border border-[#C9822B]/40 text-[#FFF4D8] shadow-2xl",
        headerBg: "bg-[#281A10]",
        headerBorder: "border-[#C9822B]/35",
        headerTitle: "text-[#FFF4D8] font-bold",
        headerSub: "text-amber-300 font-medium",
        iconBg: "bg-amber-950/60 border border-[#C9822B]/40",
        iconColor: "text-amber-400",
        closeBtn: "text-amber-200 hover:text-white hover:bg-amber-950/40",
        tabBarBg: "bg-[#120B07]",
        tabBarBorder: "border-[#C9822B]/20",
        tabActiveText: "text-amber-200 font-bold",
        tabInactiveText: "text-amber-200/70 hover:text-white",
        tabIndicator: "bg-amber-500",
        badgeBg: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
        previewCardBg: "bg-[#2A1C12]",
        previewCardBorder: "border-[#C9822B]/35",
        previewVerseText: "text-[#FFF4D8] font-medium",
        previewMeaningText: "text-amber-200/90 italic",
        inputBg: "bg-[#100905]",
        inputBorder: "border-[#C9822B]/30 focus:border-amber-400",
        inputText: "text-amber-100",
        inputPlaceholder: "placeholder-amber-300/40",
        inputLabel: "text-amber-200",
        channelHeader: "text-amber-400",
        channelCardText: "text-amber-200",
        aspectRatioActive: "bg-amber-500/25 border-amber-400 text-amber-100 font-bold ring-2 ring-amber-400/30",
        aspectRatioInactive: "bg-[#22150D] border-[#C9822B]/25 text-amber-100/80 hover:border-amber-400/40 hover:bg-[#2C1C11]",
        templateActive: "bg-amber-500/25 border-amber-400 text-amber-100 font-bold ring-1 ring-amber-400/30",
        templateInactive: "bg-[#22150D] border-[#C9822B]/25 text-amber-100/70 hover:border-amber-400/40",
        cardPreviewOuterBg: "bg-black/60",
        cardPreviewOuterBorder: "border-amber-500/20",
        downloadBtn: "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-[#2B1B10] border border-[#C9822B]/35 hover:bg-[#382315] text-amber-200 font-bold",
        copyLinkBtn: "bg-[#2A1C12] hover:bg-[#382518] border border-[#C9822B]/30 text-amber-200 font-semibold",
        footerBg: "bg-[#120B07]",
        footerBorder: "border-[#C9822B]/20",
        footerText: "text-amber-200/70",
        accentText: "text-amber-400 font-bold",
      };

    case "sandstone":
    default:
      return {
        modalContainer: "bg-[#1A1007] border border-amber-500/30 text-stone-200 shadow-2xl",
        headerBg: "bg-[#24150A]",
        headerBorder: "border-stone-800",
        headerTitle: "text-amber-100 font-bold",
        headerSub: "text-amber-400/80",
        iconBg: "bg-amber-500/20 border border-amber-500/40",
        iconColor: "text-amber-300",
        closeBtn: "text-stone-400 hover:text-stone-100 hover:bg-stone-800",
        tabBarBg: "bg-[#160C04]",
        tabBarBorder: "border-stone-800/80",
        tabActiveText: "text-amber-300 font-bold",
        tabInactiveText: "text-stone-400 hover:text-stone-200",
        tabIndicator: "bg-amber-500",
        badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        previewCardBg: "bg-[#281608]",
        previewCardBorder: "border-amber-500/20",
        previewVerseText: "text-amber-100 font-medium",
        previewMeaningText: "text-stone-300 italic",
        inputBg: "bg-[#120A04]",
        inputBorder: "border-stone-800 focus:border-amber-500/50",
        inputText: "text-stone-100",
        inputPlaceholder: "placeholder-stone-600",
        inputLabel: "text-stone-300",
        channelHeader: "text-amber-400",
        channelCardText: "text-stone-300",
        aspectRatioActive: "bg-amber-500/20 border-amber-400 text-amber-300 font-bold ring-2 ring-amber-400/30",
        aspectRatioInactive: "bg-[#160C04] border-stone-800 text-stone-400 hover:border-stone-700 hover:bg-[#201107]",
        templateActive: "bg-amber-500/20 border-amber-400 text-amber-300 font-bold ring-1 ring-amber-400/30",
        templateInactive: "bg-[#160C04] border-stone-800 text-stone-400 hover:border-stone-700",
        cardPreviewOuterBg: "bg-black/60",
        cardPreviewOuterBorder: "border-amber-500/20",
        downloadBtn: "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold hover:brightness-105 shadow-md",
        copyBtn: "bg-[#281608] border border-amber-500/30 hover:bg-[#341D0B] text-amber-200 font-bold",
        copyLinkBtn: "bg-[#281608] hover:bg-[#341D0B] border border-amber-500/30 text-amber-200 font-semibold shadow-xs",
        footerBg: "bg-[#160C04]",
        footerBorder: "border-stone-800/80",
        footerText: "text-stone-400",
        accentText: "text-amber-400 font-bold",
      };
  }
};

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  content,
  appTheme,
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "card">("quick");
  const [personalNote, setPersonalNote] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  // Map app theme to corresponding card aesthetic template
  const getTemplateForTheme = (themeName?: string): ShareCardTemplate => {
    switch (themeName) {
      case "amethyst":
        return "meditation_indigo";
      case "festival":
        return "sunrise_saffron";
      case "light":
      case "prism-pulse":
        return "vedic_parchment";
      case "golden-hour":
        return "sunrise_saffron";
      case "sandstone":
      default:
        return "traditional_gold";
    }
  };

  // Card aesthetic template: synced with app theme by default, but allows manual override
  const [selectedTemplate, setSelectedTemplate] = useState<ShareCardTemplate>(() =>
    getTemplateForTheme(appTheme)
  );

  // Sync template whenever appTheme changes
  useEffect(() => {
    setSelectedTemplate(getTemplateForTheme(appTheme));
  }, [appTheme]);

  // Aspect ratio: Default to Story format (9:16), but allow user to select manual aspect ratio
  const [selectedDimension, setSelectedDimension] = useState<ShareCardDimension>("story");

  const [previewCardUrl, setPreviewCardUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Get synchronized theme styles for modal container and elements
  const t = getModalThemeStyles(appTheme);

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
    a.download = `SutraSparsh_${content.title.replace(/\s+/g, "_")}_${selectedDimension}_${selectedTemplate}.png`;
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

  const availableDimensions: {
    id: ShareCardDimension;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    isDefault?: boolean;
  }[] = [
    {
      id: "story",
      label: "Story (9:16)",
      subLabel: "1080 × 1920 · WhatsApp & Insta",
      icon: <Smartphone className="w-3.5 h-3.5" />,
      isDefault: true,
    },
    {
      id: "square",
      label: "Square (1:1)",
      subLabel: "1080 × 1080 · Feed & Chat",
      icon: <Square className="w-3.5 h-3.5" />,
    },
    {
      id: "landscape",
      label: "Banner (16:9)",
      subLabel: "1200 × 630 · Web & X",
      icon: <RectangleHorizontal className="w-3.5 h-3.5" />,
    },
  ];

  const availableTemplates: {
    id: ShareCardTemplate;
    name: string;
    badge: string;
  }[] = [
    { id: "traditional_gold", name: "Sandstone Gold", badge: "Traditional" },
    { id: "meditation_indigo", name: "Amethyst Twilight", badge: "Meditation" },
    { id: "sunrise_saffron", name: "Surya Saffron", badge: "Sunrise" },
    { id: "vedic_parchment", name: "Sacred Ivory", badge: "Parchment" },
    { id: "minimal", name: "Deep Stillness", badge: "Minimal" },
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain animate-fadeIn backdrop-blur-xl bg-black/75 p-0 sm:p-4 md:p-6 lg:p-8 pt-0 sm:pt-4 md:pt-6 lg:pt-8 pb-20 sm:pb-6 md:pb-8">
        <div
          className={`relative w-full max-w-full sm:max-w-xl md:max-w-2xl min-h-dvh sm:min-h-0 sm:my-auto rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-none sm:max-h-[92vh] ${t.modalContainer}`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b ${t.headerBg} ${t.headerBorder}`}
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${t.iconBg} ${t.iconColor}`}
              >
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-serif-sacred text-base ${t.headerTitle}`}>
                  Share Sacred Wisdom
                </h3>
                <p className={`text-[11px] ${t.headerSub}`}>
                  {content.title} · {content.source}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${t.closeBtn}`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div
            className={`flex border-b px-6 pt-3 gap-6 ${t.tabBarBg} ${t.tabBarBorder}`}
          >
            <button
              onClick={() => setActiveTab("quick")}
              className={`pb-3 text-xs font-bold transition-all relative ${
                activeTab === "quick" ? t.tabActiveText : t.tabInactiveText
              }`}
            >
              Quick Share & Channels
              {activeTab === "quick" && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${t.tabIndicator}`}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("card")}
              className={`pb-3 text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
                activeTab === "card" ? t.tabActiveText : t.tabInactiveText
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Wisdom Card Generator</span>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-mono ${t.badgeBg}`}
              >
                9:16 Story
              </span>
              {activeTab === "card" && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${t.tabIndicator}`}
                />
              )}
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === "quick" ? (
              <>
                {/* Shloka Snippet Preview */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${t.previewCardBg} ${t.previewCardBorder}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={t.accentText}>Sanskrit Verse Preview</span>
                    <span className="opacity-70">sutrasparsh.com</span>
                  </div>
                  <p
                    className={`font-sanskrit text-sm leading-relaxed whitespace-pre-line ${t.previewVerseText}`}
                  >
                    {content.sanskritText}
                  </p>
                  {content.meaning && (
                    <p
                      className={`text-xs pt-1 border-t border-current/10 ${t.previewMeaningText}`}
                    >
                      "{content.meaning}"
                    </p>
                  )}
                </div>

                {/* Personal Note / Custom Message */}
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-medium flex items-center justify-between ${t.inputLabel}`}
                  >
                    <span>Add a personal thought (optional):</span>
                    <span className="text-[10px] opacity-60 font-mono">Custom Note</span>
                  </label>
                  <input
                    type="text"
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="e.g. 'Thought you might find peace in this shloka today...'"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-colors border ${t.inputBg} ${t.inputBorder} ${t.inputText} ${t.inputPlaceholder}`}
                  />
                </div>

                {/* Primary Channel Buttons */}
                <div className="space-y-2">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider block font-semibold ${t.channelHeader}`}
                  >
                    Select Channel:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* WhatsApp */}
                    <button
                      onClick={() => handleSocialClick("whatsapp")}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/30 border border-emerald-700/40 hover:border-emerald-500 text-emerald-300 hover:bg-emerald-900/30 transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">WhatsApp</span>
                    </button>

                    {/* Telegram */}
                    <button
                      onClick={() => handleSocialClick("telegram")}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-950/30 border border-sky-700/40 hover:border-sky-500 text-sky-300 hover:bg-sky-900/30 transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">Telegram</span>
                    </button>

                    {/* X / Twitter */}
                    <button
                      onClick={() => handleSocialClick("x")}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-900/60 border border-stone-700/50 hover:border-stone-500 text-stone-200 hover:bg-stone-850 transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-200 group-hover:scale-110 transition-transform font-bold text-sm">
                        𝕏
                      </div>
                      <span className="text-xs font-semibold">X (Twitter)</span>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handleSocialClick("facebook")}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-950/30 border border-blue-700/40 hover:border-blue-500 text-blue-300 hover:bg-blue-900/30 transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform font-bold text-sm">
                        f
                      </div>
                      <span className="text-xs font-semibold">Facebook</span>
                    </button>

                    {/* Email */}
                    <button
                      onClick={() => handleSocialClick("email")}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-950/30 border border-amber-700/40 hover:border-amber-500 text-amber-300 hover:bg-amber-900/30 transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">Email</span>
                    </button>

                    {/* Native Device Share Sheet */}
                    <button
                      onClick={handleNativeShare}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:scale-[1.02] transition-all space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">System Share</span>
                    </button>
                  </div>
                </div>

                {/* Copy Canonical Link */}
                <div className="pt-1">
                  <button
                    onClick={handleCopyLink}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border font-semibold text-xs transition-all cursor-pointer ${t.copyLinkBtn}`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">
                          Canonical Deep Link Copied with Attribution!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Exact Shloka Link (sutrasparsh.com)</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Tab 2: Visual Card Generator */
              <div className="space-y-4 flex flex-col flex-1">
                {/* 1. Aspect Ratio Selector (Default: Story 9:16, with manual selection enabled) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${t.channelHeader}`}
                    >
                      Aspect Ratio Format:
                    </span>
                    <span className="text-[10px] opacity-70">
                      Default: Story (9:16)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {availableDimensions.map((dim) => {
                      const isSelected = selectedDimension === dim.id;
                      return (
                        <button
                          key={dim.id}
                          onClick={() => setSelectedDimension(dim.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                            isSelected ? t.aspectRatioActive : t.aspectRatioInactive
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="flex items-center space-x-1.5">
                              {dim.icon}
                              <span className="text-xs font-bold leading-none">
                                {dim.label}
                              </span>
                            </span>
                            {dim.isDefault && (
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 font-mono font-bold leading-tight">
                                Story
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-75 truncate">
                            {dim.subLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Theme / Card Style Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${t.channelHeader}`}
                    >
                      Aesthetic Theme:
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] opacity-80 font-medium">
                        Synced with App
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                    {availableTemplates.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                            isSelected ? t.templateActive : t.templateInactive
                          }`}
                        >
                          <span>{tpl.name}</span>
                          <span className="text-[9px] opacity-60 font-mono">
                            {tpl.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Card Preview: Section filled based on responsiveness and space available */}
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${t.channelHeader}`}
                    >
                      Card Preview:
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {CARD_DIMENSIONS[selectedDimension]?.width} ×{" "}
                      {CARD_DIMENSIONS[selectedDimension]?.height} px
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl p-2.5 sm:p-4 flex items-center justify-center min-h-[300px] sm:min-h-[360px] md:min-h-[420px] max-h-[56vh] sm:max-h-[62vh] overflow-hidden flex-1 shadow-inner border ${t.cardPreviewOuterBg} ${t.cardPreviewOuterBorder}`}
                  >
                    {isGenerating || !previewCardUrl ? (
                      <div className="text-xs animate-pulse flex items-center space-x-2 opacity-80">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Rendering sacred typography card...</span>
                      </div>
                    ) : (
                      <img
                        src={previewCardUrl}
                        alt="Sacred Wisdom Card Preview"
                        className="h-full max-h-[52vh] sm:max-h-[58vh] w-auto max-w-full rounded-xl shadow-2xl border border-current/20 object-contain mx-auto transition-transform hover:scale-[1.01]"
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons for Card */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleDownloadCard}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${t.downloadBtn}`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>

                  <button
                    onClick={handleCopyCardImage}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${t.copyBtn}`}
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-3 border-t flex items-center justify-between text-[11px] ${t.footerBg} ${t.footerBorder} ${t.footerText}`}
          >
            <span className="flex items-center space-x-1">
              <span>Preserves exact verse canonical deep-link</span>
            </span>
            <button
              onClick={onClose}
              className={`font-semibold cursor-pointer ${t.accentText}`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
