import React from "react";
import { ShieldCheck, HeartHandshake, BookOpen, Sparkles, Check, X } from "lucide-react";
import { ModalPortal } from "../ModalPortal";

interface SatsangGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isLight?: boolean;
}

export const SatsangGuidelinesModal: React.FC<SatsangGuidelinesModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isLight = false,
}) => {
  if (!isOpen) return null;

  const guidelines = [
    {
      sanskrit: "सत्यम् (Satyam)",
      title: "Truthful & Authentic Inquiry",
      desc: "Share genuine realizations, study reflections, and questions born of authentic spiritual seeking.",
    },
    {
      sanskrit: "अहिंसा (Ahiṃsā)",
      title: "Respectful & Non-Harmful Speech",
      desc: "Express differing philosophical viewpoints with kindness. Harassment, personal attacks, and intolerance are strictly prohibited.",
    },
    {
      sanskrit: "स्वाध्याय (Svādhyāya)",
      title: "Rooted in Sacred Wisdom",
      desc: "Anchor discussions in the timeless teachings of Bhagavad Gītā, Upaniṣads, and Yoga Sūtras to uplift the collective mind.",
    },
    {
      sanskrit: "शौचम् (Śaucam)",
      title: "Cleanliness & No Commercial Spam",
      desc: "No advertisements, commercial schemes, cryptocurrency, external spam links, or self-promotion.",
    },
  ];

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guidelines-title"
      >
        <div
          className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative transition-all ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
              isLight ? "hover:bg-stone-200 text-stone-600" : "hover:bg-stone-800 text-stone-400"
            }`}
            aria-label="Close guidelines"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                Satsang Maryādā • सत्संग मर्यादा
              </span>
              <h2 id="guidelines-title" className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-200">
                Community Principles & Code
              </h2>
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isLight ? "text-stone-700" : "text-stone-300"}`}>
            SutraSparsh Community is a sacred virtual <em>Satsang Mandali</em> where seekers, practitioners, and scholars
            gather to deepen contemplation. By entering, you commit to honoring these core principles:
          </p>

          {/* Guidelines Grid */}
          <div className="space-y-3 mb-8 max-h-[48vh] overflow-y-auto pr-1">
            {guidelines.map((g, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLight
                    ? "bg-amber-50/80 border-amber-200"
                    : "bg-stone-900/70 border-stone-800/80 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-xs font-bold text-amber-400 font-sanskrit">{g.sanskrit}</span>
                  <span className="text-xs font-semibold text-stone-200">{g.title}</span>
                </div>
                <p className={`text-xs ${isLight ? "text-stone-600" : "text-stone-400"}`}>{g.desc}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onAccept}
              className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>I Commit & Enter Satsang</span>
            </button>
            <button
              onClick={onClose}
              className={`w-full sm:w-auto py-3 px-5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? "border-stone-300 hover:bg-stone-200 text-stone-700"
                  : "border-stone-800 hover:bg-stone-900 text-stone-400"
              }`}
            >
              View Feed Only
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
