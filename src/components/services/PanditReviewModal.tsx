import React, { useState } from "react";
import {
  X,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  BookOpen,
  MessageSquare,
  Lock,
} from "lucide-react";
import type { PanditProfile, PanditReview, PanditBooking } from "../../types/pandit";
import { panditService } from "../../services/pandit.service";
import { authService } from "../../services/auth.service";
import type { AppTheme } from "../../types";

export interface PanditReviewModalProps {
  pandit: PanditProfile | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  onReviewSubmitted?: (review: PanditReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "उत्कृष्ट · Divine & Flawless Chanting",
  4: "उत्तम · Very Good Experience",
  3: "संतुष्ट · Satisfied & Reverent",
  2: "सुधार योग्य · Needs Improvement",
  1: "अनुचित · Unsatisfactory",
};

export const PanditReviewModal: React.FC<PanditReviewModalProps> = ({
  pandit,
  isOpen,
  onClose,
  theme = "light",
  onReviewSubmitted,
}) => {
  if (!isOpen || !pandit) return null;

  const isLight = theme === "light";
  const currentUser = authService.getCurrentUser();

  // Verification Gate Check
  const verificationStatus = panditService.canUserReviewPandit(
    currentUser?.uid || "seeker_current",
    currentUser?.email,
    pandit.id
  );

  // Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRitualName, setSelectedRitualName] = useState<string>(
    verificationStatus.eligibleBooking?.ritualName || pandit.rituals[0]?.name || "Vedic Ritual"
  );
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [uccharanaScore, setUccharanaScore] = useState<number>(5);
  const [punctualityScore, setPunctualityScore] = useState<number>(5);
  const [samagriScore, setSamagriScore] = useState<number>(5);

  // Self-verification flow for devotees who booked via WhatsApp/Phone
  const [isVerifyingManualBooking, setIsVerifyingManualBooking] = useState(false);
  const [manualBookingDate, setManualBookingDate] = useState(
    new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0]
  );
  const [manualRitualName, setManualRitualName] = useState(pandit.rituals[0]?.name || "Griha Pravesha");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle manual booking verification (e.g. devotee who connected via WhatsApp)
  const handleVerifyManualBooking = () => {
    try {
      const newBooking = panditService.recordBooking({
        panditId: pandit.id,
        panditName: pandit.name,
        userId: currentUser?.uid || "seeker_current",
        userName: currentUser?.displayName || "Verified Yajamāna",
        ritualId: `r-manual-${Date.now()}`,
        ritualName: manualRitualName,
        bookingDate: manualBookingDate,
        ritualDate: manualBookingDate,
        status: "COMPLETED",
        reviewed: false,
      });
      setSelectedRitualName(newBooking.ritualName);
      setIsVerifyingManualBooking(false);
      setError(null);
    } catch {
      setError("Could not register booking verification. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!comment.trim()) {
      setError("Please write your devotional feedback and experience with the Pandit.");
      return;
    }

    if (comment.trim().length < 15) {
      setError("Please provide at least 15 characters of detailed feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingId =
        verificationStatus.eligibleBooking?.id || `book-verified-${Date.now()}`;

      const created = panditService.submitReview({
        panditId: pandit.id,
        userId: currentUser?.uid || "seeker_current",
        userName: currentUser?.displayName || "Devout Yajamāna",
        userAvatar: currentUser?.photoURL,
        bookingId,
        ritualName: selectedRitualName,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        aspects: {
          uccharana: uccharanaScore,
          punctuality: punctualityScore,
          samagriGuidance: samagriScore,
        },
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(created);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pandit-review-title"
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl border my-auto transition-all relative ${
          isLight
            ? "bg-[#FFFDF8] text-stone-900 border-[#E8DCC2]"
            : "bg-stone-900 text-stone-100 border-amber-500/30"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
            isLight
              ? "bg-stone-100 hover:bg-stone-200 text-stone-600"
              : "bg-white/10 hover:bg-white/20 text-stone-300"
          }`}
          aria-label="Close review modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif-sacred text-amber-900 dark:text-amber-200">
                समीक्षा स्वीकृत · Review Published
              </h3>
              <p
                className={`text-xs max-w-md mx-auto leading-relaxed ${
                  isLight ? "text-stone-600" : "text-stone-300"
                }`}
              >
                धन्यवाद! Your verified Yajamāna review for <strong>{pandit.name}</strong> has been
                published. Your rating of <strong>{rating} ★</strong> is now visible across the directory
                to assist fellow seekers.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all cursor-pointer shadow-md"
            >
              Done & Return to Directory
            </button>
          </div>
        ) : !verificationStatus.canReview && !isVerifyingManualBooking ? (
          /* Gated Verification State: Devotee has not verified booking */
          <div className="space-y-5">
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Yajamāna Gate · प्रमाणित यजमान</span>
              </div>
              <h2
                id="modal-pandit-review-title"
                className="text-lg sm:text-xl font-bold font-serif-sacred leading-tight"
              >
                Review Pandit {pandit.name}
              </h2>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-amber-50/60 border-amber-200 text-stone-800" : "bg-amber-950/20 border-amber-500/30 text-stone-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs leading-relaxed">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Authentic Devotee Reviews Only
                  </p>
                  <p className="opacity-90">
                    To maintain spiritual integrity and Maryada, reviews on SutraSparsh are strictly
                    reserved for devotees who have booked and completed a sacred ritual with the Pandit.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Did you recently connect with <strong>{pandit.name}</strong> via WhatsApp or direct phone
                for a completed puja or ceremony?
              </p>
              <button
                type="button"
                onClick={() => setIsVerifyingManualBooking(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Completed a Ritual with this Pandit (Verify & Review)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200"
                    : "bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isVerifyingManualBooking ? (
          /* One-step Booking Verification Dialog */
          <div className="space-y-4">
            <div className="space-y-1 pr-6">
              <h2 className="text-lg font-bold font-serif-sacred">
                Confirm Completed Ritual with {pandit.name}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Please verify your ritual details to enable your authenticated review.
              </p>
            </div>

            <div className="space-y-3 py-1">
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Select Completed Ritual *
                </label>
                <select
                  value={manualRitualName}
                  onChange={(e) => setManualRitualName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900"
                      : "bg-stone-800 border-stone-700 text-stone-100"
                  }`}
                >
                  {pandit.rituals.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Approximate Date of Ritual Ceremony *
                </label>
                <input
                  type="date"
                  value={manualBookingDate}
                  onChange={(e) => setManualBookingDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900"
                      : "bg-stone-800 border-stone-700 text-stone-100"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyingManualBooking(false)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyManualBooking}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md"
              >
                Confirm & Write Review →
              </button>
            </div>
          </div>
        ) : (
          /* Active Review Form for Verified Yajamāna */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Yajamāna · प्रमाणित यजमान</span>
              </div>
              <h2
                id="modal-pandit-review-title"
                className="text-lg font-bold font-serif-sacred leading-tight"
              >
                Rate & Review {pandit.name}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Share your sacred experience to guide fellow devotees on SutraSparsh.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Star Rating Selector */}
            <div className="space-y-1.5 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Overall Sacred Experience Rating *
              </label>
              <div className="flex items-center justify-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-stone-300 dark:text-stone-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                {RATING_LABELS[hoverRating || rating]}
              </p>
            </div>

            {/* 2. Aspect Ratings (Pronunciation, Punctuality, Samagri) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-1">
                <span className="block font-bold text-[10.5px] opacity-80">
                  वैदिक उच्चारण · Chanting
                </span>
                <select
                  value={uccharanaScore}
                  onChange={(e) => setUccharanaScore(Number(e.target.value))}
                  className="w-full text-xs p-1 rounded border bg-transparent"
                >
                  <option value={5}>5 ★ - Flawless Swara</option>
                  <option value={4}>4 ★ - Very Good</option>
                  <option value={3}>3 ★ - Moderate</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-1">
                <span className="block font-bold text-[10.5px] opacity-80">
                  समयपालन · Punctuality
                </span>
                <select
                  value={punctualityScore}
                  onChange={(e) => setPunctualityScore(Number(e.target.value))}
                  className="w-full text-xs p-1 rounded border bg-transparent"
                >
                  <option value={5}>5 ★ - On Time (Brahma Muhurta)</option>
                  <option value={4}>4 ★ - Punctual</option>
                  <option value={3}>3 ★ - Slight Delay</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-1">
                <span className="block font-bold text-[10.5px] opacity-80">
                  सामग्री · Guidance
                </span>
                <select
                  value={samagriScore}
                  onChange={(e) => setSamagriScore(Number(e.target.value))}
                  className="w-full text-xs p-1 rounded border bg-transparent"
                >
                  <option value={5}>5 ★ - Precise & Clear</option>
                  <option value={4}>4 ★ - Good Guidance</option>
                  <option value={3}>3 ★ - Standard</option>
                </select>
              </div>
            </div>

            {/* 3. Ritual Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Ritual Performed *
                </label>
                <select
                  value={selectedRitualName}
                  onChange={(e) => setSelectedRitualName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900"
                      : "bg-stone-800 border-stone-700 text-stone-100"
                  }`}
                >
                  {pandit.rituals.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sublime Vedic Chanting & Peaceful Puja"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900"
                      : "bg-stone-800 border-stone-700 text-stone-100"
                  }`}
                />
              </div>
            </div>

            {/* 4. Devotional Feedback */}
            <div>
              <label className="block text-[11px] font-bold mb-1 opacity-90">
                Detailed Devotional Feedback (अनुभव एवं समीक्षा) *
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe how Panditji conducted the ceremony, adherence to Vidhi, phonetic clarity, and how it blessed your family..."
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isLight
                    ? "bg-white border-stone-200 text-stone-900"
                    : "bg-stone-800 border-stone-700 text-stone-100"
                }`}
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Publishing..." : "Submit Verified Review (समीक्षा भेजें)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
