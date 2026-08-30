/**
 * Phase 20 — Donations & Additional Revenue Architecture (M31, M32)
 * Sacred Gurudakshina, Temple Preservation, and 80G Tax Exemption receipt generator.
 */

import crypto from "node:crypto";
import type { DonationRecord } from "../types/monetization.js";

export interface CreateDonationInput {
  userId?: string;
  donorName: string;
  donorEmail: string;
  donorPan?: string;
  amount: number;
  currency?: "INR" | "USD";
  category?: DonationRecord["category"];
  isAnonymous?: boolean;
  dedicatedTo?: string;
  paymentMethod?: string;
}

class DonationsRepository {
  private donations: Map<string, DonationRecord> = new Map();

  constructor() {
    this.seedDefaultDonations();
  }

  private seedDefaultDonations() {
    const demo1: DonationRecord = {
      id: "don_2026_001",
      userId: "usr_guest_demo",
      donorName: "Arunava Sharma",
      donorEmail: "arunava@sutra.org",
      amount: 1008,
      currency: "INR",
      category: "VEDIC_SCHOLARS",
      isAnonymous: false,
      paymentMethod: "UPI",
      providerPaymentId: "pay_rzp_don_882",
      receiptNumber: "SUTRA-80G-2026-0089",
      taxExemptionEligible: true,
      status: "SUCCESS",
      dedicatedTo: "In memory of Swami Vidyananda",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const demo2: DonationRecord = {
      id: "don_2026_002",
      donorName: "Anonymous Seeker",
      donorEmail: "patron@vedicstudies.net",
      amount: 5000,
      currency: "INR",
      category: "TEMPLE_PRESERVATION",
      isAnonymous: true,
      paymentMethod: "CARD",
      providerPaymentId: "pay_rzp_don_991",
      receiptNumber: "SUTRA-80G-2026-0090",
      taxExemptionEligible: true,
      status: "SUCCESS",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.donations.set(demo1.id, demo1);
    this.donations.set(demo2.id, demo2);
  }

  public save(donation: DonationRecord): DonationRecord {
    this.donations.set(donation.id, donation);
    return donation;
  }

  public getById(id: string): DonationRecord | undefined {
    return this.donations.get(id);
  }

  public getAll(): DonationRecord[] {
    return Array.from(this.donations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export class DonationsService {
  private repo = new DonationsRepository();

  public async createDonation(input: CreateDonationInput): Promise<{
    donation: DonationRecord;
    checkoutOrderId: string;
    keyId: string;
  }> {
    if (input.amount <= 0) {
      throw new Error("Donation amount must be greater than zero.");
    }

    const donationId = `don_${crypto.randomBytes(8).toString("hex")}`;
    const receiptNum = `SUTRA-80G-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const checkoutOrderId = `order_don_${crypto.randomBytes(8).toString("hex")}`;

    const donation: DonationRecord = {
      id: donationId,
      userId: input.userId,
      donorName: input.isAnonymous ? "Anonymous Seeker" : input.donorName,
      donorEmail: input.donorEmail,
      donorPan: input.donorPan?.toUpperCase(),
      amount: input.amount,
      currency: input.currency || "INR",
      category: input.category || "GENERAL_GURUDAKSHINA",
      isAnonymous: Boolean(input.isAnonymous),
      paymentMethod: input.paymentMethod || "UPI",
      providerPaymentId: `pay_don_${crypto.randomBytes(6).toString("hex")}`,
      receiptNumber: receiptNum,
      taxExemptionEligible: Boolean(input.donorPan && input.donorPan.length >= 10),
      status: "SUCCESS",
      dedicatedTo: input.dedicatedTo,
      createdAt: new Date().toISOString(),
    };

    const saved = this.repo.save(donation);

    return {
      donation: saved,
      checkoutOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_sutrasparsh_demo",
    };
  }

  public getDonationById(id: string): DonationRecord | undefined {
    return this.repo.getById(id);
  }

  public getAllDonations(): DonationRecord[] {
    return this.repo.getAll();
  }

  public getDonationStats(): {
    totalAmountInr: number;
    donorCount: number;
    byCategory: Record<string, number>;
  } {
    const all = this.repo.getAll().filter((d) => d.status === "SUCCESS");
    const totalAmountInr = all.reduce((sum, d) => sum + (d.currency === "INR" ? d.amount : d.amount * 85), 0);
    const byCategory: Record<string, number> = {};

    for (const d of all) {
      byCategory[d.category] = (byCategory[d.category] || 0) + d.amount;
    }

    return {
      totalAmountInr,
      donorCount: all.length,
      byCategory,
    };
  }
}

export const donationsService = new DonationsService();
