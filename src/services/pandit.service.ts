import { PANDIT_CORPUS } from "../data/panditCorpus";
import type { PanditProfile, PanditRitual, PanditReview, PanditBooking } from "../types/pandit";

export interface PanditOnboardingApplication {
  id: string;
  name: string;
  sanskritName?: string;
  tradition: "Rigveda" | "Shukla Yajurveda" | "Krishna Yajurveda" | "Samaveda" | "Atharvaveda" | "Smarta" | "Vaishnava";
  experienceYears: number;
  languages: string[];
  phone: string;
  email?: string;
  city: string;
  state: string;
  area?: string;
  willingToTravel: boolean;
  institution: string;
  lineageOrGuru?: string;
  rituals: string[];
  bio: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  rejectionReason?: string;
}

const STORAGE_KEY_PANDITS = "sutrasparsh_pandits_corpus_v1";
const STORAGE_KEY_APPLICATIONS = "sutrasparsh_pandit_applications_v1";
const STORAGE_KEY_REVIEWS = "sutrasparsh_pandit_reviews_v1";
const STORAGE_KEY_BOOKINGS = "sutrasparsh_pandit_bookings_v1";

const SEED_REVIEWS: PanditReview[] = [
  {
    id: "rev-ramesh-1",
    panditId: "pandit-ramesh-shastri",
    userId: "usr-devotee-101",
    userName: "Radhika & Sundar Raman",
    isVerifiedYajamana: true,
    bookingId: "book-ramesh-101",
    ritualName: "Griha Pravesha & Vastu Shanti",
    rating: 5,
    title: "Immaculate Shukla Yajurveda Chanting",
    comment: "Panditji arrived punctually during Brahma Muhurta. His Vedic swara uccharana filled our new home with divine tranquility. The samagri list was exact and transparent with zero commercial demands.",
    aspects: { uccharana: 5, punctuality: 5, samagriGuidance: 5 },
    createdAt: "2024-09-12T08:30:00.000Z",
    status: "PUBLISHED",
  },
  {
    id: "rev-ramesh-2",
    panditId: "pandit-ramesh-shastri",
    userId: "usr-devotee-102",
    userName: "Amitabh Joshi",
    isVerifiedYajamana: true,
    bookingId: "book-ramesh-102",
    ritualName: "Rudrabhisheka",
    rating: 5,
    title: "Deeply Contemplative Sri Rudram",
    comment: "Flawless recitation of Sri Rudram and Chamakam hymns. Panditji patiently guided our entire family through each offering with immense devotion.",
    aspects: { uccharana: 5, punctuality: 5, samagriGuidance: 5 },
    createdAt: "2024-10-04T10:15:00.000Z",
    status: "PUBLISHED",
  },
  {
    id: "rev-vidyadhar-1",
    panditId: "pandit-vidyadhar-dwivedi",
    userId: "usr-devotee-103",
    userName: "Dr. Mahesh Deshmukh",
    isVerifiedYajamana: true,
    bookingId: "book-vidyadhar-101",
    ritualName: "Navagraha Homa",
    rating: 5,
    title: "Pure Shulba Sutra Geometry & Fire Ceremony",
    comment: "Acharyaji constructed the Yajna vedi with immaculate geometric accuracy. An authentic master of the Vedic traditions who explained the philosophical import of every oblation.",
    aspects: { uccharana: 5, punctuality: 5, samagriGuidance: 5 },
    createdAt: "2024-10-18T11:45:00.000Z",
    status: "PUBLISHED",
  },
  {
    id: "rev-srinivas-1",
    panditId: "pandit-srinivas-dikshitar",
    userId: "usr-devotee-104",
    userName: "Kalyan & Meenakshi Sundaram",
    isVerifiedYajamana: true,
    bookingId: "book-srinivas-101",
    ritualName: "Vivaha Samskara",
    rating: 5,
    title: "Dignified and Sacred Rigvedic Wedding",
    comment: "Conducted the Saptapadi and Panigrahana with immense dignity. Absolutely zero commercial pressure, focusing solely on the spiritual sanctification of the couple.",
    aspects: { uccharana: 5, punctuality: 5, samagriGuidance: 5 },
    createdAt: "2024-11-01T14:20:00.000Z",
    status: "PUBLISHED",
  },
  {
    id: "rev-krishna-1",
    panditId: "pandit-krishna-bhat",
    userId: "usr-devotee-105",
    userName: "Sanjay Nambiar",
    isVerifiedYajamana: true,
    bookingId: "book-krishna-101",
    ritualName: "Satyanarayan Vrat Katha",
    rating: 5,
    title: "Melodious Chanting with Clear Explanations",
    comment: "A joyous and sacred Katha recital. The Sanskrit intonations were clear, resonant, and uplifting for all our relatives.",
    aspects: { uccharana: 5, punctuality: 5, samagriGuidance: 5 },
    createdAt: "2024-10-25T16:00:00.000Z",
    status: "PUBLISHED",
  },
];

const SEED_BOOKINGS: PanditBooking[] = [
  {
    id: "book-ramesh-101",
    panditId: "pandit-ramesh-shastri",
    panditName: "Pandit Ramesh Shastri",
    userId: "usr-devotee-101",
    userName: "Radhika & Sundar Raman",
    ritualId: "r-griha-pravesh",
    ritualName: "Griha Pravesha & Vastu Shanti",
    bookingDate: "2024-09-01",
    ritualDate: "2024-09-10",
    status: "COMPLETED",
    reviewed: true,
  },
  {
    id: "book-ramesh-102",
    panditId: "pandit-ramesh-shastri",
    panditName: "Pandit Ramesh Shastri",
    userId: "usr-devotee-102",
    userName: "Amitabh Joshi",
    ritualId: "r-rudrabhisheka",
    ritualName: "Rudrabhisheka",
    bookingDate: "2024-09-25",
    ritualDate: "2024-10-02",
    status: "COMPLETED",
    reviewed: true,
  },
  {
    id: "book-demo-seeker-ramesh",
    panditId: "pandit-ramesh-shastri",
    panditName: "Pandit Ramesh Shastri",
    userId: "seeker_current",
    userName: "Sādhaka Seeker",
    ritualId: "r-rudrabhisheka",
    ritualName: "Rudrabhisheka & Shiva Puja",
    bookingDate: "2024-11-01",
    ritualDate: "2024-11-06",
    status: "COMPLETED",
    reviewed: false, // Ready for the current user to review
  },
  {
    id: "book-demo-seeker-vidyadhar",
    panditId: "pandit-vidyadhar-dwivedi",
    panditName: "Acharya Vidyadhar Dwivedi",
    userId: "seeker_current",
    userName: "Sādhaka Seeker",
    ritualId: "r-homa",
    ritualName: "Navagraha Homa",
    bookingDate: "2024-10-20",
    ritualDate: "2024-10-28",
    status: "COMPLETED",
    reviewed: false,
  },
];

class PanditService {
  private pandits: PanditProfile[] = [];
  private applications: PanditOnboardingApplication[] = [];
  private reviews: PanditReview[] = [];
  private bookings: PanditBooking[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    if (typeof window === "undefined") {
      this.pandits = this.enrichWithReviewStats([...PANDIT_CORPUS]);
      this.reviews = [...SEED_REVIEWS];
      this.bookings = [...SEED_BOOKINGS];
      return;
    }

    try {
      // 1. Reviews
      const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (storedReviews) {
        const parsed = JSON.parse(storedReviews);
        this.reviews = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_REVIEWS];
      } else {
        this.reviews = [...SEED_REVIEWS];
        this.saveReviews();
      }

      // 2. Bookings
      const storedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings);
        this.bookings = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_BOOKINGS];
      } else {
        this.bookings = [...SEED_BOOKINGS];
        this.saveBookings();
      }

      // 3. Pandits Corpus
      const storedPandits = localStorage.getItem(STORAGE_KEY_PANDITS);
      if (storedPandits) {
        const parsed = JSON.parse(storedPandits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.pandits = this.enrichWithReviewStats(parsed);
        } else {
          this.pandits = this.enrichWithReviewStats([...PANDIT_CORPUS]);
        }
      } else {
        this.pandits = this.enrichWithReviewStats([...PANDIT_CORPUS]);
        this.savePandits();
      }

      // 4. Onboarding Applications
      const storedApps = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      if (storedApps) {
        const parsed = JSON.parse(storedApps);
        if (Array.isArray(parsed)) {
          this.applications = parsed;
        }
      } else {
        this.applications = [
          {
            id: "app-shridhar-joshi",
            name: "Pandit Shridhar Joshi",
            sanskritName: "पं. श्रीधर जोशी",
            tradition: "Rigveda",
            experienceYears: 16,
            languages: ["Marathi", "Hindi", "Sanskrit"],
            phone: "+91 94220 88912",
            city: "Nashik",
            state: "Maharashtra",
            area: "Trimbakeshwar / Panchavati",
            willingToTravel: true,
            institution: "Trimbakeshwar Veda Shastra Mahavidyalaya",
            lineageOrGuru: "Shishya of Pt. Moreshwar Shastri",
            rituals: ["Kalsarp Shanti", "Tripindi Shraddha", "Mahamrityunjaya Homa", "Griha Pravesha"],
            bio: "16 years of rigorous Vedic practice at holy Godavari Teertha. Specializes in Shanti Karmas and Rigvedic chants.",
            submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "PENDING",
          },
        ];
        this.saveApplications();
      }
    } catch {
      this.pandits = this.enrichWithReviewStats([...PANDIT_CORPUS]);
      this.reviews = [...SEED_REVIEWS];
      this.bookings = [...SEED_BOOKINGS];
      this.applications = [];
    }
  }

  private enrichWithReviewStats(list: PanditProfile[]): PanditProfile[] {
    return list.map((p) => {
      const pReviews = this.reviews.filter((r) => r.panditId === p.id && r.status === "PUBLISHED");
      const reviewCount = pReviews.length;
      let rating = p.rating || 4.9;
      if (pReviews.length > 0) {
        const sum = pReviews.reduce((acc, r) => acc + r.rating, 0);
        rating = Number((sum / pReviews.length).toFixed(1));
      }
      return {
        ...p,
        rating,
        reviewCount,
      };
    });
  }

  private savePandits(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_PANDITS, JSON.stringify(this.pandits));
      } catch (err) {
        console.warn("Could not save pandits to localStorage:", err);
      }
    }
    this.notify();
  }

  private saveApplications(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(this.applications));
      } catch (err) {
        console.warn("Could not save applications to localStorage:", err);
      }
    }
    this.notify();
  }

  private saveReviews(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.reviews));
      } catch (err) {
        console.warn("Could not save reviews to localStorage:", err);
      }
    }
    this.notify();
  }

  private saveBookings(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(this.bookings));
      } catch (err) {
        console.warn("Could not save bookings to localStorage:", err);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in PanditService listener:", err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- READ PANDITS ---
  public getAllPandits(): PanditProfile[] {
    return [...this.pandits];
  }

  public getPanditById(id: string): PanditProfile | undefined {
    return this.pandits.find((p) => p.id === id);
  }

  // --- CREATE PANDIT ---
  public createPandit(profile: Omit<PanditProfile, "id"> & { id?: string }): PanditProfile {
    const id = profile.id || `pandit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPandit: PanditProfile = {
      ...profile,
      id,
      rating: profile.rating ?? 5.0,
      reviewCount: profile.reviewCount ?? 0,
      samagriGuidance: profile.samagriGuidance ?? true,
      completedRitualsCount: profile.completedRitualsCount ?? 10,
      isAvailable: profile.isAvailable ?? true,
      rituals: profile.rituals || [],
      peerEndorsements: profile.peerEndorsements || [],
    };

    this.pandits = [newPandit, ...this.pandits];
    this.savePandits();
    return newPandit;
  }

  // --- UPDATE PANDIT ---
  public updatePandit(id: string, updates: Partial<PanditProfile>): PanditProfile {
    const index = this.pandits.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pandit with id ${id} not found.`);
    }

    const updated = {
      ...this.pandits[index],
      ...updates,
      id, // Preserve original id
    };

    this.pandits[index] = updated;
    this.savePandits();
    return updated;
  }

  // --- DELETE PANDIT ---
  public deletePandit(id: string): boolean {
    const initialLength = this.pandits.length;
    this.pandits = this.pandits.filter((p) => p.id !== id);
    if (this.pandits.length !== initialLength) {
      this.savePandits();
      return true;
    }
    return false;
  }

  // --- REVIEWS & FEEDBACK ENGINE ---
  public getReviewsForPandit(panditId: string): PanditReview[] {
    return this.reviews
      .filter((r) => r.panditId === panditId && r.status === "PUBLISHED")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRatingSummary(panditId: string): {
    average: number;
    count: number;
    starsBreakdown: Record<number, number>;
  } {
    const list = this.getReviewsForPandit(panditId);
    const count = list.length;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (count === 0) {
      const pandit = this.getPanditById(panditId);
      return {
        average: pandit?.rating || 4.9,
        count: 0,
        starsBreakdown: breakdown,
      };
    }

    let sum = 0;
    list.forEach((r) => {
      const s = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[s] = (breakdown[s] || 0) + 1;
      sum += r.rating;
    });

    return {
      average: Number((sum / count).toFixed(1)),
      count,
      starsBreakdown: breakdown,
    };
  }

  // Verification Gate: Check if user has a verified completed booking with this Pandit
  public canUserReviewPandit(
    userId?: string | null,
    userEmail?: string | null,
    panditId?: string
  ): {
    canReview: boolean;
    reason?: string;
    eligibleBooking?: PanditBooking;
  } {
    if (!userId && !userEmail) {
      return {
        canReview: false,
        reason: "Please sign in to submit feedback for this Pandit.",
      };
    }

    if (!panditId) {
      return { canReview: false, reason: "No Pandit specified." };
    }

    // Search for completed booking matching this user & pandit
    const matchingBookings = this.bookings.filter(
      (b) =>
        b.panditId === panditId &&
        b.status === "COMPLETED" &&
        (b.userId === userId ||
          b.userId === "seeker_current" ||
          (userEmail && b.userId.toLowerCase() === userEmail.toLowerCase()))
    );

    const unreviewed = matchingBookings.find((b) => !b.reviewed);

    if (unreviewed) {
      return {
        canReview: true,
        eligibleBooking: unreviewed,
      };
    }

    if (matchingBookings.length > 0) {
      return {
        canReview: false,
        reason: "You have already submitted a review for your completed ritual with this Pandit.",
      };
    }

    return {
      canReview: false,
      reason:
        "Only devotees with a verified completed ritual booking through SutraSparsh can submit reviews. This preserves the sanctity and truthfulness of our Vedic directory.",
    };
  }

  // Create / Record booking (e.g. from WhatsApp connect or manual confirmation)
  public recordBooking(booking: Omit<PanditBooking, "id">): PanditBooking {
    const id = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBooking: PanditBooking = {
      ...booking,
      id,
    };
    this.bookings = [newBooking, ...this.bookings];
    this.saveBookings();
    return newBooking;
  }

  // Submit verified review
  public submitReview(
    reviewData: Omit<PanditReview, "id" | "createdAt" | "status" | "isVerifiedYajamana">
  ): PanditReview {
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newReview: PanditReview = {
      ...reviewData,
      id,
      isVerifiedYajamana: true, // Only verified callers reach this
      createdAt: new Date().toISOString(),
      status: "PUBLISHED",
    };

    this.reviews = [newReview, ...this.reviews];
    this.saveReviews();

    // Mark matching booking as reviewed
    if (reviewData.bookingId) {
      const bIndex = this.bookings.findIndex((b) => b.id === reviewData.bookingId);
      if (bIndex !== -1) {
        this.bookings[bIndex].reviewed = true;
        this.saveBookings();
      }
    }

    // Recompute Pandit rating and reviewCount
    this.pandits = this.enrichWithReviewStats(this.pandits);
    this.savePandits();

    return newReview;
  }

  // Delete review (Admin moderation)
  public deleteReview(reviewId: string): boolean {
    const initLen = this.reviews.length;
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    if (this.reviews.length !== initLen) {
      this.saveReviews();
      this.pandits = this.enrichWithReviewStats(this.pandits);
      this.savePandits();
      return true;
    }
    return false;
  }

  // --- ONBOARDING APPLICATIONS ---
  public submitOnboardingApplication(
    app: Omit<PanditOnboardingApplication, "id" | "submittedAt" | "status">
  ): PanditOnboardingApplication {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newApp: PanditOnboardingApplication = {
      ...app,
      id,
      submittedAt: new Date().toISOString(),
      status: "PENDING",
    };

    this.applications = [newApp, ...this.applications];
    this.saveApplications();
    return newApp;
  }

  public getOnboardingApplications(): PanditOnboardingApplication[] {
    return [...this.applications];
  }

  public getPendingApplicationsCount(): number {
    return this.applications.filter((a) => a.status === "PENDING").length;
  }

  public approveOnboardingApplication(applicationId: string): PanditProfile {
    const appIndex = this.applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const app = this.applications[appIndex];
    app.status = "APPROVED";
    app.reviewedAt = new Date().toISOString();
    this.saveApplications();

    const rituals: PanditRitual[] = app.rituals.map((r, idx) => ({
      id: `r-${Date.now()}-${idx}`,
      name: r,
      category: "samskara",
      duration: "2 - 3 hours",
      samagriListProvided: true,
      description: `Traditional Vedic ${r} according to ${app.tradition} parampara.`,
    }));

    const newProfile: PanditProfile = {
      id: `pandit-${app.id.replace("app-", "")}`,
      name: app.name,
      sanskritName: app.sanskritName,
      title: `${app.tradition} Acharya`,
      tradition: app.tradition,
      experienceYears: app.experienceYears,
      languages: app.languages,
      phone: app.phone,
      email: app.email,
      location: {
        city: app.city,
        state: app.state,
        area: app.area,
        willingToTravel: app.willingToTravel,
      },
      bio: app.bio,
      avatarSeed: app.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      isVerified: true,
      verificationDetails: {
        institution: app.institution,
        verifiedDate: new Date().toISOString().split("T")[0],
        credentialId: `SS-VERIFIED-${Date.now().toString(36).toUpperCase()}`,
        lineageOrGuru: app.lineageOrGuru,
        verificationBadgeTitle: "Veda Pathashala Verified",
        authorityType: "veda_pathashala",
      },
      peerEndorsements: [],
      rituals,
      samagriGuidance: true,
      rating: 5.0,
      reviewCount: 0,
      completedRitualsCount: 1,
      isAvailable: true,
    };

    return this.createPandit(newProfile);
  }

  public rejectOnboardingApplication(applicationId: string, reason?: string): boolean {
    const appIndex = this.applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) return false;

    this.applications[appIndex].status = "REJECTED";
    this.applications[appIndex].reviewedAt = new Date().toISOString();
    this.applications[appIndex].rejectionReason = reason || "Credentials could not be verified by Dharma Parishad.";
    this.saveApplications();
    return true;
  }

  // --- RESET TO SEED CORPUS ---
  public resetToDefaultCorpus(): void {
    this.pandits = this.enrichWithReviewStats([...PANDIT_CORPUS]);
    this.reviews = [...SEED_REVIEWS];
    this.bookings = [...SEED_BOOKINGS];
    this.savePandits();
    this.saveReviews();
    this.saveBookings();
  }
}

export const panditService = new PanditService();
