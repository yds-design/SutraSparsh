import React, { useState } from "react";
import { Flag, X, ShieldAlert, Check } from "lucide-react";
import { ModalPortal } from "../ModalPortal";
import { communityService, type CommunityReport } from "../../services/community.service";
import { validateSubmissionGuard } from "../../utils/spamProtection";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment" | "user";
  targetId: string;
  isLight?: boolean;
}

const REASONS: { id: CommunityReport["reason"]; label: string; desc: string }[] = [
  { id: "harassment", label: "Harassment or Hostile Speech", desc: "Attacking, bullying, or disrespectful remarks towards individuals or lineages." },
  { id: "disrespect", label: "Disrespect of Sacred Heritage", desc: "Mocking sacred Sanskrit verses, deities, or spiritual traditions." },
  { id: "spam", label: "Commercial Spam or Links", desc: "Advertisements, cryptocurrency schemes, affiliate links, or unsolicited services." },
  { id: "misinformation", label: "Gross Misinformation", desc: "Fabricated translations or intentionally distorted scriptural quotes." },
  { id: "inappropriate", label: "Inappropriate Content", desc: "Vulgarity, adult content, or material contrary to Satsang Maryada." },
  { id: "other", label: "Other Violation", desc: "Any other issue conflicting with community principles." },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  isLight = false,
}) => {
  const [reason, setReason] = useState<CommunityReport["reason"]>("harassment");
  const [note, setNote] = useState("");
  const [blockAuthor, setBlockAuthor] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const spamGuard = validateSubmissionGuard({
      actionKey: `community_report_${targetId}`,
      honeypotValue: honeypot,
      maxRequests: 4,
      windowMs: 60_000,
      text: note,
      maxUrls: 2,
    });
    if (!spamGuard.ok) {
      setErrorMessage(spamGuard.error || "Please wait before submitting another report.");
      return;
    }

    const res = communityService.reportContent({
      targetType,
      targetId,
      reason,
      note: note.trim() || undefined,
    });

    if (blockAuthor && targetType === "post") {
      const p = communityService.getPostById(targetId);
      if (p) communityService.blockUser(p.authorId);
    }

    setResultMessage(res.message);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2000);
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div
          className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all relative ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-rose-500/30 text-stone-100"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-100">Report Received</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">{resultMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Hidden Honeypot Anti-Spam Field (#18) */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="report-website-hp">Leave this field empty</label>
                <input
                  id="report-website-hp"
                  name="website_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                    Upholding Maryādā
                  </span>
                  <h2 id="report-modal-title" className="text-lg font-bold font-serif-sacred text-stone-100">
                    Report {targetType === "post" ? "Post" : targetType === "comment" ? "Comment" : "User"}
                  </h2>
                </div>
              </div>

              {errorMessage && (
                <div role="alert" aria-live="assertive" className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs">
                  {errorMessage}
                </div>
              )}

              <p className="text-xs text-stone-400 leading-relaxed">
                Reports are confidential and reviewed promptly by our community moderators.
              </p>

              {/* Reasons */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`block p-3 rounded-2xl border cursor-pointer transition-all ${
                      reason === r.id
                        ? "bg-rose-950/30 border-rose-400 ring-1 ring-rose-400/30 text-rose-200"
                        : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.id}
                        checked={reason === r.id}
                        onChange={() => setReason(r.id)}
                        className="accent-rose-500"
                      />
                      <span className="text-xs font-bold">{r.label}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pl-5 mt-0.5">{r.desc}</p>
                  </label>
                ))}
              </div>

              {/* Additional Note */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Additional Context (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Provide context for our moderators (max 500 chars)..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs focus:outline-hidden"
                />
              </div>

              {/* Also Block Option */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="block-author-check"
                  checked={blockAuthor}
                  onChange={(e) => setBlockAuthor(e.target.checked)}
                  className="accent-rose-500"
                />
                <label htmlFor="block-author-check" className="text-xs text-stone-400 cursor-pointer">
                  Also block this author from my feed
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-800 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};
