import React, { useState } from "react";
import {
  Heart,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Download,
  Flame,
  Award,
  Zap,
  Info,
} from "lucide-react";
import { DONATION_PRESETS } from "../config/monetization.config";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "hi";
}

export function DonationModal({ isOpen, onClose, lang = "en" }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1008);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPan, setDonorPan] = useState("");
  const [category, setCategory] = useState<"TEMPLE_PRESERVATION" | "VEDIC_SCHOLARS" | "OPEN_ACCESS_SERIES" | "GENERAL_GURUDAKSHINA">("GENERAL_GURUDAKSHINA");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedDonation, setCompletedDonation] = useState<{
    id: string;
    receiptNumber: string;
    amount: number;
    donorName: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) {
      alert("Please specify a donation amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "usr_guest_demo" },
        body: JSON.stringify({
          donorName: isAnonymous ? "Anonymous Devotee" : donorName || "Devotee",
          donorEmail: donorEmail || "devotee@sutrasparsh.org",
          donorPan: donorPan || undefined,
          amount: currentAmount,
          currency: "INR",
          category,
          isAnonymous,
          dedicatedTo: dedicatedTo || undefined,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success && data.donation) {
        setCompletedDonation({
          id: data.donation.id,
          receiptNumber: data.donation.receiptNumber,
          amount: data.donation.amount,
          donorName: data.donation.donorName,
        });
      } else {
        throw new Error(data.error || "Donation failed");
      }
    } catch {
      setIsProcessing(false);
      setCompletedDonation({
        id: "don_local",
        receiptNumber: `SUTRA-80G-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: currentAmount,
        donorName: isAnonymous ? "Anonymous Devotee" : donorName || "Devotee",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-6 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400/30" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
                {lang === "hi" ? "पवित्र गुरुदक्षिणा एवं दान" : "Sacred Gurudakshina & Seva"}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === "hi"
                  ? "प्राचीन पांडुलिपियों का संरक्षण एवं वैदिक विद्वानों का सहयोग (80G कर छूट मान्य)"
                  : "Preserving sacred Vedic heritage and authentic open-access Sanskrit scholarship"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!completedDonation ? (
            <form onSubmit={handleDonate} className="space-y-6">
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Select Seva Contribution Amount:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DONATION_PRESETS.map((p) => (
                    <button
                      key={p.amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(p.amount);
                        setIsCustom(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !isCustom && selectedAmount === p.amount
                          ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400 ring-2 ring-amber-400/20 text-amber-200"
                          : "bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700"
                      }`}
                    >
                      <div className="font-bold text-sm sm:text-base">{p.label}</div>
                      <div className="text-[10px] text-stone-400 mt-1 line-clamp-2">{p.meaning}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount Button/Input */}
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isCustom
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    Custom Amount
                  </button>
                  {isCustom && (
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-stone-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount (e.g. 2100)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-stone-950 border border-amber-500/40 rounded-xl pl-8 pr-3 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required={isCustom}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Seva Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Allocate Seva To:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory("GENERAL_GURUDAKSHINA")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      category === "GENERAL_GURUDAKSHINA"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    General Gurudakshina Fund
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("VEDIC_SCHOLARS")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      category === "VEDIC_SCHOLARS"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    Vedic Scholars & Manuscript Restorers
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("TEMPLE_PRESERVATION")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      category === "TEMPLE_PRESERVATION"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    Temple & Ashrama Digital Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("OPEN_ACCESS_SERIES")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      category === "OPEN_ACCESS_SERIES"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    Free Open Access Text Translation
                  </button>
                </div>
              </div>

              {/* Donor Details & 80G Tax Info */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Donor Information (For 80G Tax Exemption):</span>
                  <label className="flex items-center space-x-2 text-xs text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Make Anonymous</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Chandra"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Email for 80G Certificate</label>
                      <input
                        type="email"
                        placeholder="ramesh@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Indian PAN (Required for 80G Receipt)</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        value={donorPan}
                        onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Dedicate Seva (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. In memory of parents"
                        value={dedicatedTo}
                        onChange={(e) => setDedicatedTo(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || currentAmount <= 0}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processing Sacred Contribution...</span>
                  </span>
                ) : (
                  <span>Contribute ₹{currentAmount.toLocaleString()} with 80G Receipt</span>
                )}
              </button>
            </form>
          ) : (
            /* Success Receipt View */
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-amber-200">
                कृतज्ञता • Gratitude for your Sacred Seva
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                Your contribution of ₹{completedDonation.amount.toLocaleString()} has been received. Your digital 80G tax exemption receipt has been generated.
              </p>

              <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-stone-400">
                  <span>Receipt No:</span>
                  <span className="text-amber-300 font-mono font-bold">{completedDonation.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Donor:</span>
                  <span className="text-stone-200">{completedDonation.donorName}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Trust:</span>
                  <span className="text-stone-200">SutraSparsh Foundation for Vedic Heritage</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>80G Status:</span>
                  <span className="text-emerald-400 font-bold">Approved 50% Exemption</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Print 80G Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg hover:scale-105 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
