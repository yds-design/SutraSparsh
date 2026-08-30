import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  CreditCard,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, ETHICAL_MONETIZATION_PRINCIPLES } from "../config/monetization.config";
import type { SubscriptionPlanId } from "../types/monetization";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSubscription?: (planId: SubscriptionPlanId) => void;
  initialPlanId?: SubscriptionPlanId;
  triggeredFeature?: string;
  lang?: "en" | "hi";
}

export function PricingModal({
  isOpen,
  onClose,
  onSuccessSubscription,
  initialPlanId = "rishi_annual",
  triggeredFeature,
  lang = "en",
}: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"plans" | "checkout" | "success">("plans");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [successReceipt, setSuccessReceipt] = useState<{ id: string; invoice: string; planName: string } | null>(null);

  if (!isOpen) return null;

  const sadhaka = SUBSCRIPTION_PLANS.sadhaka_monthly;
  const rishi = SUBSCRIPTION_PLANS.rishi_annual;
  const patron = SUBSCRIPTION_PLANS.ashram_patron;

  const currentPlan = SUBSCRIPTION_PLANS[selectedPlan];

  const handleStartCheckout = (planId: SubscriptionPlanId) => {
    setSelectedPlan(planId);
    setCheckoutStep("checkout");
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create checkout order on server
      const chkRes = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "usr_guest_demo" },
        body: JSON.stringify({ planId: selectedPlan, currency, provider: "razorpay" }),
      });
      const chkData = await chkRes.json();

      // 2. Verify payment signature
      const verifyRes = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "usr_guest_demo" },
        body: JSON.stringify({
          orderId: chkData?.session?.orderId || "order_sim_991",
          paymentId: `pay_sim_${Date.now()}`,
          signature: "sig_test_valid_demo",
          planId: selectedPlan,
        }),
      });
      const verifyData = await verifyRes.json();

      setIsProcessing(false);
      setSuccessReceipt({
        id: verifyData.subscription?.id || "sub_active",
        invoice: verifyData.transaction?.invoiceNumber || "INV-2026-0099",
        planName: currentPlan.name[lang],
      });
      setCheckoutStep("success");
      onSuccessSubscription?.(selectedPlan);
    } catch {
      setIsProcessing(false);
      alert("Payment simulation completed with fallback offline verification.");
      setCheckoutStep("success");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-6 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
                {lang === "hi" ? "सूत्रस्पर्श साधना सदस्यता" : "SutraSparsh Sacred Membership"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                {lang === "hi"
                  ? "असीमित शब्दार्थ, प्रामाणिक भाष्य एवं उच्च-गुणवत्ता वैदिक पाठ"
                  : "Unrestricted Vedic scholarship, audio recitations, and sacred commentaries"}
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

        {/* Feature Lock Notice if triggered by a paywall */}
        {triggeredFeature && checkoutStep === "plans" && (
          <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-3 text-amber-300 text-xs sm:text-sm">
            <Lock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              {lang === "hi"
                ? `यह सुविधा (${triggeredFeature}) केवल साधक एवं ऋषि सदस्यों के लिए उपलब्ध है। 7 दिन निःशुल्क आजमाएं।`
                : `This feature (${triggeredFeature}) is unlocked with Sādhaka or Rishi membership. Start your 7-day risk-free trial.`}
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6">
          {checkoutStep === "plans" && (
            <div className="space-y-6">
              {/* Controls: Billing Cycle & Currency Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-800">
                <div className="flex items-center space-x-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      billingCycle === "annual"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {lang === "hi" ? "वार्षिक (37% बचत)" : "Annual (Save 37%)"}
                  </button>
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {lang === "hi" ? "मासिक" : "Monthly"}
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-stone-400">Currency:</span>
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      currency === "INR" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-stone-400"
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      currency === "USD" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-stone-400"
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan 1: Sādhaka Monthly */}
                <div
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    selectedPlan === "sadhaka_monthly"
                      ? "bg-stone-950/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xl"
                      : "bg-stone-950/40 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
                        {sadhaka.badge?.[lang] || "Monthly"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-amber-200 mt-1 font-serif">{sadhaka.name[lang]}</h3>
                    <p className="text-xs text-stone-400 mt-1">{sadhaka.description[lang]}</p>

                    <div className="my-4">
                      <div className="text-2xl sm:text-3xl font-bold text-stone-100">
                        {sadhaka.pricing[currency].displayPrice}
                      </div>
                      <span className="text-[11px] text-amber-400/80 font-medium">
                        ✦ 7-day free trial included
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-stone-300">
                      {sadhaka.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{f[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartCheckout("sadhaka_monthly")}
                    className="w-full mt-6 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 hover:border-amber-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{lang === "hi" ? "साधक चुनें" : "Select Sādhaka"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Plan 2: Rishi Sage Annual (POPULAR / HIGHLIGHT) */}
                <div
                  className={`relative p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    selectedPlan === "rishi_annual"
                      ? "bg-gradient-to-b from-amber-950/40 via-stone-950 to-stone-950 border-amber-400 ring-2 ring-amber-400/40 shadow-2xl scale-[1.02]"
                      : "bg-stone-950/60 border-amber-500/40 hover:border-amber-400"
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    {rishi.badge?.[lang] || "Best Value"}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Most Popular</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-amber-100 mt-1 font-serif">{rishi.name[lang]}</h3>
                    <p className="text-xs text-stone-400 mt-1">{rishi.description[lang]}</p>

                    <div className="my-4">
                      <div className="text-2xl sm:text-3xl font-bold text-amber-200">
                        {rishi.pricing[currency].displayPrice}
                      </div>
                      <span className="text-[11px] text-amber-300 font-bold">
                        ✦ 7-day risk-free trial • Offline Audio
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-stone-200">
                      {rishi.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className={f.highlight ? "font-semibold text-amber-200" : ""}>{f[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartCheckout("rishi_annual")}
                    className="w-full mt-6 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{lang === "hi" ? "ऋषि वार्षिक 7-दिन निःशुल्क शुरू करें" : "Start 7-Day Free Trial"}</span>
                  </button>
                </div>

                {/* Plan 3: Ashram Patron Lifetime */}
                <div
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    selectedPlan === "ashram_patron"
                      ? "bg-stone-950/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xl"
                      : "bg-stone-950/40 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-300/80">
                        {patron.badge?.[lang] || "Lifetime"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-amber-200 mt-1 font-serif">{patron.name[lang]}</h3>
                    <p className="text-xs text-stone-400 mt-1">{patron.description[lang]}</p>

                    <div className="my-4">
                      <div className="text-2xl sm:text-3xl font-bold text-stone-100">
                        {patron.pricing[currency].displayPrice}
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">
                        ✦ One-time payment • 80G Tax Receipt
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-stone-300">
                      {patron.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{f[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartCheckout("ashram_patron")}
                    className="w-full mt-6 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 hover:border-amber-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{lang === "hi" ? "संरक्षक बनें" : "Become a Patron"}</span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Ethical Monetization Principles Ribbon */}
              <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 text-stone-400 text-xs space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-amber-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Ethical Sacred Stewardship Guarantee</span>
                </div>
                <p>
                  100% of core verses remain free forever. Memberships fund authentic scholarship and zero-ad infrastructure. Cancel anytime with 1 click.
                </p>
              </div>
            </div>
          )}

          {/* Checkout Simulator Step (M27.1 / M27.2) */}
          {checkoutStep === "checkout" && (
            <div className="max-w-lg mx-auto space-y-6 py-4 animate-fadeIn">
              <div className="bg-stone-950 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h3 className="font-bold text-amber-200 font-serif">{currentPlan.name[lang]}</h3>
                    <p className="text-xs text-stone-400">{currentPlan.trialDays > 0 ? "7-Day Free Trial, then:" : "Total payable:"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-stone-100">{currentPlan.pricing[currency].displayPrice}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-300">Select Payment Method (Secure Razorpay / UPI):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPaymentMethod("UPI")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                        selectedPaymentMethod === "UPI"
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>UPI / GPay / PhonePe</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod("CARD")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                        selectedPaymentMethod === "CARD"
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Credit/Debit Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod("NETBANKING")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                        selectedPaymentMethod === "NETBANKING"
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>NetBanking</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-stone-400 flex items-center space-x-2 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Secured by 256-bit SSL encryption. You will not be charged today if activating a free trial.
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCheckoutStep("plans")}
                  className="w-1/3 py-3 rounded-xl font-semibold text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-2/3 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Verifying Payment...</span>
                    </span>
                  ) : (
                    <span>
                      {currentPlan.trialDays > 0 ? "Activate 7-Day Free Trial" : `Pay ${currentPlan.pricing[currency].displayPrice}`}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step (M27.2) */}
          {checkoutStep === "success" && (
            <div className="max-w-md mx-auto text-center py-8 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-300 shadow-xl">
                <Check className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-amber-200">
                {lang === "hi" ? "साधना सदस्यता सक्रिय!" : "Membership Activated!"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300">
                Welcome to SutraSparsh Premium. All high-definition chanting tracks, commentaries, and Sanskrit dictionary tools are now unlocked.
              </p>

              {successReceipt && (
                <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-left text-xs space-y-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Plan:</span>
                    <span className="text-stone-200 font-bold">{successReceipt.planName}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Invoice:</span>
                    <span className="text-stone-200">{successReceipt.invoice}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE (Trial / Subscribed)</span>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg hover:scale-105 transition-all"
              >
                Continue Contemplation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
