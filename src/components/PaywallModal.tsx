import React from "react";
import { Lock, Sparkles, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
  featureTitle?: string;
  featureDescription?: string;
  lang?: "en" | "hi";
}

export function PaywallModal({
  isOpen,
  onClose,
  onOpenPricing,
  featureTitle = "Authentic Multi-Tradition Commentaries",
  featureDescription = "Unlock word-by-word Sanskrit etymology, high-definition master audio chants, and scholarly commentary from Shankaracharya, Ramanuja, and Sri Aurobindo.",
  lang = "en",
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-stone-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mx-auto mb-4">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            {lang === "hi" ? "साधक सुविधा" : "Sādhaka Premium Feature"}
          </span>
          <h3 className="text-xl font-bold font-serif text-amber-200 mt-1">{featureTitle}</h3>
          <p className="text-xs text-stone-300 leading-relaxed">{featureDescription}</p>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2 mb-6 text-xs text-stone-300">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Includes 7-Day Risk-Free Trial</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Cancel anytime with 1 click. Zero ads, pure sacred scholarship.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenPricing();
            }}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{lang === "hi" ? "सदस्यता देखें एवं अनलॉक करें" : "Unlock with 7-Day Free Trial"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            {lang === "hi" ? "बाद में" : "Maybe Later"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PremiumBadge({
  text = "PRO",
  onClick,
}: {
  text?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/30 transition-all cursor-pointer"
      title="SutraSparsh Premium Feature"
    >
      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
      <span>{text}</span>
    </button>
  );
}
