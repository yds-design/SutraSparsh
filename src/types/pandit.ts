/**
 * Types & Domain Models for sutraSparsh Services Section
 * Zero-Fee / Pure Facilitator Vedic Pandit Directory
 */

export interface PanditRitual {
  id: string;
  name: string;
  sanskritName?: string;
  category: "samskara" | "shanti" | "puja" | "homa" | "festival";
  duration: string;
  samagriListProvided: boolean;
  description: string;
}

export interface VerificationDetails {
  institution: string; // e.g. "Kashi Veda Pathashala", "Sampurnanand Sanskrit Vishwavidyalaya"
  verifiedDate: string;
  credentialId?: string;
  lineageOrGuru?: string;
  verificationBadgeTitle?: string;
  authorityType: "veda_pathashala" | "peetham" | "temple_board" | "academic_board";
}

export interface PeerEndorsement {
  id: string;
  endorserName: string;
  endorserTitle: string;
  institution?: string;
  relationship: string; // e.g. "Fellow Rigveda Acharya", "Senior Purohit, Kashi"
  comment: string;
  date: string;
}

export interface PanditLocation {
  city: string;
  state: string;
  area?: string;
  willingToTravel: boolean;
}

export interface PanditProfile {
  id: string;
  name: string;
  sanskritName?: string;
  title: string; // Traditional expertise tag, e.g. "Shukla Yajurveda & Griha Shanti Specialist"
  tradition: "Rigveda" | "Shukla Yajurveda" | "Krishna Yajurveda" | "Samaveda" | "Atharvaveda" | "Smarta" | "Vaishnava";
  experienceYears: number;
  languages: string[];
  phone: string; // E.164 formatted or standard national
  email?: string;
  location: PanditLocation;
  bio: string;
  avatarSeed: string; // For generating sacred avatar or displaying portrait
  isVerified: boolean;
  verificationDetails?: VerificationDetails;
  peerEndorsements: PeerEndorsement[];
  rituals: PanditRitual[];
  samagriGuidance: boolean;
  rating: number; // Devotee feedback metric (e.g. 4.9)
  completedRitualsCount: number;
  isAvailable: boolean;
}

export interface PanditFilterState {
  tradition: string;
  language: string;
  ritualCategory: string;
  searchQuery: string;
  verifiedOnly: boolean;
  peerEndorsedOnly: boolean;
}
