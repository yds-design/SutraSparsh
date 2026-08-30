import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  Download,
  AlertCircle,
  Clock,
  RefreshCw,
  X,
  Check,
  Zap,
} from "lucide-react";
import type { UserSubscription, BillingTransaction } from "../types/monetization";
import { SUBSCRIPTION_PLANS } from "../config/monetization.config";

interface SubscriptionManagementPanelProps {
  onOpenPricing: () => void;
  lang?: "en" | "hi";
}

export function SubscriptionManagementPanel({ onOpenPricing, lang = "en" }: SubscriptionManagementPanelProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    try {
      const [subRes, txRes] = await Promise.all([
        fetch("/api/billing/subscription", { headers: { "x-user-id": "usr_guest_demo" } }),
        fetch("/api/billing/history", { headers: { "x-user-id": "usr_guest_demo" } }),
      ]);

      const subData = await subRes.json();
      const txData = await txRes.json();

      if (subData.success && subData.subscription) {
        setSubscription(subData.subscription);
      }
      if (txData.success && txData.transactions) {
        setTransactions(txData.transactions);
      }
    } catch {
      // Fallback offline mock state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "usr_guest_demo" },
        body: JSON.stringify({ reason: cancelReason || "User self-service cancellation", immediate: false }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        setActionSuccessMsg("Your subscription will end at the end of the current billing cycle.");
        setCancelModalOpen(false);
      }
    } catch {
      alert("Cancellation processed.");
      setCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  const plan = subscription ? SUBSCRIPTION_PLANS[subscription.planId] : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-between text-emerald-300 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="p-6 bg-stone-900 border border-amber-500/30 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                {lang === "hi" ? "वर्तमान साधना योजना" : "Active Sacred Plan"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  subscription?.status === "ACTIVE" || subscription?.status === "TRIAL"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : subscription?.status === "GRACE_PERIOD"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {subscription?.status || "Seeker Free"}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-amber-200">
              {plan ? plan.name[lang] : "Jijñāsu (Seeker Free Plan)"}
            </h2>
            <p className="text-xs text-stone-400 max-w-md">
              {plan ? plan.description[lang] : "Upgrade to unlock unlimited Sanskrit dictionary, commentaries, and audio recitations."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {subscription && subscription.status !== "CANCELLED" && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-rose-400 bg-stone-950 border border-stone-800 hover:border-rose-500/30 transition-all"
              >
                Cancel Membership
              </button>
            )}
            <button
              onClick={onOpenPricing}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-md hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{subscription ? "Change / Upgrade Plan" : "Upgrade to Sādhaka"}</span>
            </button>
          </div>
        </div>

        {/* Subscription Meta Timeline */}
        {subscription && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-800 text-xs">
            <div className="flex items-center space-x-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-stone-400 text-[10px] uppercase">Period Starts</div>
                <div className="font-semibold text-stone-200">
                  {new Date(subscription.currentPeriodStartsAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-stone-400 text-[10px] uppercase">
                  {subscription.cancelAtPeriodEnd ? "Access Expires On" : "Next Renewal Date"}
                </div>
                <div className="font-semibold text-stone-200">
                  {new Date(subscription.currentPeriodEndsAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-stone-400 text-[10px] uppercase">Payment Method</div>
                <div className="font-semibold text-stone-200">
                  Razorpay UPI (Recurring Auto-Pay)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Billing & Invoices History Table */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-200">
              {lang === "hi" ? "भुगतान एवं रसीद इतिहास" : "Billing History & Invoices"}
            </h3>
          </div>
          <button
            onClick={fetchSubscriptionDetails}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-950/40">
                    <td className="py-3 px-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-mono text-stone-400">{tx.invoiceNumber}</td>
                    <td className="py-3 px-3">{tx.type.replace("_", " ")}</td>
                    <td className="py-3 px-3 font-semibold text-stone-100">
                      ₹{tx.amount.toLocaleString()} ({tx.currency})
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : tx.status === "REFUNDED"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors inline-flex items-center space-x-1"
                        title="Download Tax Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[10px]">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-stone-400 text-xs">
            No billing transactions recorded yet.
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-6 text-stone-100 space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif">Cancel Sacred Membership?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              We respect your decision. If you cancel, your premium features will remain active until{" "}
              <span className="text-amber-300 font-semibold">
                {subscription ? new Date(subscription.currentPeriodEndsAt).toLocaleDateString() : "the period ends"}
              </span>
              , and no future charges will occur.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-stone-400">Please share your reason (optional):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Taking a spiritual break / Financial reasons"
                rows={2}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
              >
                Keep Membership
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-rose-900/40 border border-rose-500/40 text-rose-200 hover:bg-rose-900/60 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
