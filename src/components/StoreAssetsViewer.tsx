import React, { useState } from "react";
import {
  X,
  Download,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Palette,
  ShieldCheck,
  Eye,
  BookOpen,
  Flame,
  Volume2,
} from "lucide-react";

interface StoreAssetsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
}

export const StoreAssetsViewer: React.FC<StoreAssetsViewerProps> = ({
  isOpen,
  onClose,
  theme = "sandstone",
}) => {
  const [selectedScreenTab, setSelectedScreenTab] = useState<number>(0);

  if (!isOpen) return null;

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";

  const modalBg = isLight
    ? "#FFFBF5"
    : isFestival
    ? "#4B0E17"
    : isAmethyst
    ? "#140A28"
    : "#1C120B";

  const modalBorder = isLight
    ? "#E6D7C3"
    : isFestival
    ? "rgba(255, 138, 0, 0.35)"
    : "rgba(216, 137, 22, 0.3)";

  const textColor = isLight ? "#3A2818" : "#F4E9D2";

  // Mockup store screenshot preview definitions
  const storeScreenshots = [
    {
      title: "Daily Sādhana & Shloka",
      headline: "Sacred Daily Contemplation",
      subtitle: "Brahma Muhurta notifications, streak tracking, and tap-to-chant recitation",
      accent: "from-amber-500 to-orange-500",
      icon: "🪔",
      screenTag: "6.7\" Display • Screen 1",
      previewText: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      meta: "Bhagavad Gita 2.47 • Sankhya Yoga",
    },
    {
      title: "Sacred Scripture Corpus",
      headline: "Gita, Yoga Sutras & Upanishads",
      subtitle: "All 18 Chapters of Gita, 196 Yoga Sutras, and classical Vedic Mandukya & Isha",
      accent: "from-amber-600 to-yellow-500",
      icon: "📚",
      screenTag: "6.7\" Display • Screen 2",
      previewText: "योगश्चित्तवृत्तिनिरोधः॥\nतदा द्रष्टुः स्वरूपेऽवस्थानम्॥",
      meta: "Patanjali Yoga Sutras 1.2–1.3 • Samadhi Pada",
    },
    {
      title: "Word-by-Word Padaccheda",
      headline: "Authentic Linguistic Breakdown",
      subtitle: "Devanagari, IAST Roman transliteration, grammatical roots & dual commentary",
      accent: "from-emerald-600 to-teal-500",
      icon: "🔍",
      screenTag: "6.7\" Display • Screen 3",
      previewText: "कर्मणि एव अधिकारः ते | मा फलेषु कदाचन",
      meta: "Grammatical Root √kṛ (to act) • Dual English & Hindi Analysis",
    },
    {
      title: "Acoustic Tanpura & Bell",
      headline: "Meditative Sound Sanctuary",
      subtitle: "Microtonal 136.1Hz Om / 432Hz harmonic drone synthesizer and bronze temple bells",
      accent: "from-purple-600 to-indigo-500",
      icon: "🎵",
      screenTag: "6.7\" Display • Screen 4",
      previewText: "Continuous Acoustic Tanpura Drone\nPa-Sa-Sa-Sa Pure Sine Resonance",
      meta: "Acoustic Web Audio Synthesizer • Zero Lag",
    },
    {
      title: "Sādhana Habits & Radial Goal",
      headline: "Daily Study Time Progress",
      subtitle: "Interactive radial progress meter, daily streak logs, and encrypted journal notes",
      accent: "from-rose-600 to-orange-500",
      icon: "🔥",
      screenTag: "6.7\" Display • Screen 5",
      previewText: "15 Min Daily Goal • 80% Achieved\n7-Day Consecutive Sādhana Active",
      meta: "Progress Service • Local & Cloud Sync",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-assets-title"
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{
        backgroundColor: isLight ? "rgba(58, 40, 24, 0.45)" : "rgba(0, 0, 0, 0.8)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden relative transition-all max-h-[92vh] flex flex-col"
        style={{
          backgroundColor: modalBg,
          borderColor: modalBorder,
          color: textColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center text-lg font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 id="store-assets-title" className="font-serif-sacred text-lg font-bold">
                App Store & Google Play Assets
              </h3>
              <p className="text-[11px] opacity-75">
                Production 1024×1024 Icon & 6.7" / 6.5" High-Resolution Store Screen Displays
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. 1024x1024 Master App Icon Box */}
          <div
            className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5"
            style={{
              backgroundColor: isLight ? "#FAF6EE" : "rgba(255,255,255,0.03)",
              borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.08)",
            }}
          >
            <div className="relative group">
              <img
                src="/icon-1024.png"
                alt="SutraSparsh 1024x1024 App Store Icon"
                className="w-24 h-24 rounded-2xl shadow-xl border border-amber-500/30 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                1024px
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="font-serif-sacred text-base font-bold">Official App Store Icon</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  1024×1024 PNG (No Alpha)
                </span>
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                Rendered with the sacred golden Om insignia, sandstone texture, and Apple Human Interface Guidelines square format.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <a
                  href="/icon-1024.png"
                  download="sutrasparsh-icon-1024.png"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center space-x-1.5 shadow hover:scale-105 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 1024×1024 PNG</span>
                </a>
                <span className="text-[11px] font-mono opacity-60 self-center">
                  Path: /assets/icon.png
                </span>
              </div>
            </div>
          </div>

          {/* 2. Store Screenshot Carousel / Tab Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>App Store Submission Screenshots (5 Mandatory Views)</span>
              </span>
              <span className="text-[11px] opacity-60">6.7" iPhone / Google Play Flagship</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {storeScreenshots.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScreenTab(i)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedScreenTab === i
                      ? "bg-amber-500 text-stone-950 font-bold shadow"
                      : "bg-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  {sc.icon} {sc.title}
                </button>
              ))}
            </div>

            {/* Selected Screenshot Detailed Preview Card */}
            {(() => {
              const activeSc = storeScreenshots[selectedScreenTab];
              return (
                <div
                  className="p-6 rounded-3xl border relative overflow-hidden shadow-2xl space-y-4"
                  style={{
                    backgroundColor: isLight ? "#FAF7F0" : "#120D09",
                    borderColor: isLight ? "#E6D7C3" : "rgba(216, 137, 22, 0.4)",
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center space-x-2 text-amber-500 text-xs font-mono font-bold">
                      <span>{activeSc.screenTag}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                      1290 × 2796 px Retina
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif-sacred text-xl font-bold text-amber-300">
                      {activeSc.headline}
                    </h4>
                    <p className="text-xs opacity-75">{activeSc.subtitle}</p>
                  </div>

                  {/* Simulated Mobile Mockup Screen View */}
                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      backgroundColor: isLight ? "#FFFFFF" : "#1A130D",
                      borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex justify-between items-center text-[11px] text-amber-500 font-mono">
                      <span>{activeSc.meta}</span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>HD Retina</span>
                      </span>
                    </div>

                    <div className="font-sanskrit text-base text-amber-200/95 whitespace-pre-line leading-relaxed">
                      {activeSc.previewText}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-between"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="text-[11px] opacity-60">
            Files ready in <code className="font-mono text-amber-400">/assets/icon.png</code> and <code className="font-mono text-amber-400">store-listing-metadata.json</code>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow hover:scale-105 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
