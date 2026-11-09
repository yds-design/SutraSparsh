import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Plus,
  Award,
  BookOpen,
} from "lucide-react";
import type { PanditProfile, PanditReview } from "../../types/pandit";
import { panditService } from "../../services/pandit.service";
import { PanditReviewModal } from "./PanditReviewModal";
import type { AppTheme } from "../../types";

export interface PanditReviewsDrawerProps {
  pandit: PanditProfile | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
}

export const PanditReviewsDrawer: React.FC<PanditReviewsDrawerProps> = ({
  pandit,
  isOpen,
  onClose,
  theme = "light",
}) => {
  if (!isOpen || !pandit) return null;

  const isLight = theme === "light";
  const [reviews, setReviews] = useState<PanditReview[]>(() =>
    panditService.getReviewsForPandit(pandit.id)
  );
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // Re-fetch on panditService updates
  useEffect(() => {
    const unsub = panditService.subscribe(() => {
      setReviews(panditService.getReviewsForPandit(pandit.id));
    });
    return unsub;
  }, [pandit.id]);

  const summary = panditService.getRatingSummary(pandit.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviews-drawer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-scaleUp ${
          isLight
            ? "bg-[#FFFDF8] text-stone-900 border-[#E8DCC2]"
            : "bg-stone-900 text-stone-100 border-amber-500/30"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/15 flex items-start justify-between bg-amber-500/[0.03]">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Yajamāna Reviews · यजमान समीक्षाएं</span>
            </div>
            <h2 id="reviews-drawer-title" className="text-lg sm:text-xl font-bold font-serif-sacred">
              Reviews for {pandit.name}
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Authentic feedback from devotees who booked and performed Vedic rituals with Panditji.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? "bg-stone-100 hover:bg-stone-200 text-stone-700" : "bg-white/10 hover:bg-white/20 text-stone-300"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Summary Banner */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 bg-amber-500/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-serif">
                {summary.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-0.5 text-amber-400 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.average)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                Based on {summary.count} verified {summary.count === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Rating distribution bar */}
            <div className="hidden sm:block space-y-1 text-[10px] w-40">
              {[5, 4, 3, 2, 1].map((s) => {
                const countForStar = summary.starsBreakdown[s] || 0;
                const pct = summary.count > 0 ? (countForStar / summary.count) * 100 : 0;
                return (
                  <div key={s} className="flex items-center space-x-1.5">
                    <span className="w-3 text-right">{s}★</span>
                    <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-4 text-stone-400">{countForStar}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => setIsWriteReviewOpen(true)}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review (समीक्षा लिखें)</span>
          </button>
        </div>

        {/* Reviews List (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {reviews.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">No reviews yet for this Pandit</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Be the first verified devotee to share your sacred experience with {pandit.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(true)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow cursor-pointer"
              >
                Write First Review
              </button>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  isLight
                    ? "bg-white border-stone-200/80 shadow-xs"
                    : "bg-stone-950/40 border-stone-800"
                }`}
              >
                {/* Review Header: Devotee Name + Stars + Date */}
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {rev.userName}
                    </span>
                    {rev.isVerifiedYajamana && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Yajamāna</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold ml-1 text-stone-700 dark:text-stone-300">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Ritual Tag & Date */}
                <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-medium text-amber-800 dark:text-amber-400">
                    Ritual: {rev.ritualName}
                  </span>
                  <span>·</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* Headline (if present) */}
                {rev.title && (
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                )}

                {/* Comment */}
                <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                  {rev.comment}
                </p>

                {/* Aspect Breakdown Chips */}
                {rev.aspects && (
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {rev.aspects.uccharana && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Chanting: {rev.aspects.uccharana}/5 ★
                      </span>
                    )}
                    {rev.aspects.punctuality && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Punctuality: {rev.aspects.punctuality}/5 ★
                      </span>
                    )}
                    {rev.aspects.samagriGuidance && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Samagri: {rev.aspects.samagriGuidance}/5 ★
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal for Writing Review */}
        <PanditReviewModal
          pandit={pandit}
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          theme={theme}
          onReviewSubmitted={() => {
            setIsWriteReviewOpen(false);
          }}
        />
      </div>
    </div>
  );
};
