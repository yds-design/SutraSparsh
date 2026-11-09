import { PANDIT_CORPUS } from "../data/panditCorpus";
import type { PanditProfile, PanditRitual } from "../types/pandit";

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

class PanditService {
  private pandits: PanditProfile[] = [];
  private applications: PanditOnboardingApplication[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    if (typeof window === "undefined") {
      this.pandits = [...PANDIT_CORPUS];
      return;
    }

    try {
      const storedPandits = localStorage.getItem(STORAGE_KEY_PANDITS);
      if (storedPandits) {
        const parsed = JSON.parse(storedPandits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.pandits = parsed;
        } else {
          this.pandits = [...PANDIT_CORPUS];
        }
      } else {
        this.pandits = [...PANDIT_CORPUS];
      }

      const storedApps = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      if (storedApps) {
        const parsed = JSON.parse(storedApps);
        if (Array.isArray(parsed)) {
          this.applications = parsed;
        }
      } else {
        // Seed 1 default pending application for admin review demo
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
      this.pandits = [...PANDIT_CORPUS];
      this.applications = [];
    }
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

  // --- READ ---
  public getAllPandits(): PanditProfile[] {
    return [...this.pandits];
  }

  public getPanditById(id: string): PanditProfile | undefined {
    return this.pandits.find((p) => p.id === id);
  }

  // --- CREATE ---
  public createPandit(profile: Omit<PanditProfile, "id"> & { id?: string }): PanditProfile {
    const id = profile.id || `pandit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPandit: PanditProfile = {
      ...profile,
      id,
      rating: profile.rating ?? 4.9,
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

  // --- UPDATE ---
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

  // --- DELETE ---
  public deletePandit(id: string): boolean {
    const initialLength = this.pandits.length;
    this.pandits = this.pandits.filter((p) => p.id !== id);
    if (this.pandits.length !== initialLength) {
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

    // Map the application to a full PanditProfile
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
    this.pandits = [...PANDIT_CORPUS];
    this.savePandits();
  }
}

export const panditService = new PanditService();
