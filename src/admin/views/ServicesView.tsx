import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Award,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
  MapPin,
  RefreshCw,
  BookOpen,
  X,
  Send,
  Eye,
} from "lucide-react";
import { panditService, type PanditOnboardingApplication } from "../../services/pandit.service";
import type { PanditProfile, PanditRitual } from "../../types/pandit";
import { adminAuthService } from "../../services/admin-auth.service";

const VEDIC_TRADITIONS = [
  "Rigveda",
  "Shukla Yajurveda",
  "Krishna Yajurveda",
  "Samaveda",
  "Atharvaveda",
  "Smarta",
  "Vaishnava",
] as const;

export const ServicesView: React.FC = () => {
  const [pandits, setPandits] = useState<PanditProfile[]>(() => panditService.getAllPandits());
  const [applications, setApplications] = useState<PanditOnboardingApplication[]>(() =>
    panditService.getOnboardingApplications()
  );
  const [activeTab, setActiveTab] = useState<"directory" | "applications" | "rituals">("directory");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Modal states for Create / Edit Pandit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPandit, setEditingPandit] = useState<PanditProfile | null>(null);

  // Form fields for Create / Edit
  const [formName, setFormName] = useState("");
  const [formSanskritName, setFormSanskritName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formTradition, setFormTradition] = useState<(typeof VEDIC_TRADITIONS)[number]>("Shukla Yajurveda");
  const [formExpYears, setFormExpYears] = useState(15);
  const [formLanguages, setFormLanguages] = useState<string[]>(["Hindi", "Sanskrit"]);
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formWillingToTravel, setFormWillingToTravel] = useState(true);
  const [formBio, setFormBio] = useState("");
  const [formIsVerified, setFormIsVerified] = useState(true);
  const [formInstitution, setFormInstitution] = useState("");
  const [formLineage, setFormLineage] = useState("");
  const [formRituals, setFormRituals] = useState<PanditRitual[]>([]);
  const [newRitualName, setNewRitualName] = useState("");
  const [newRitualDuration, setNewRitualDuration] = useState("2 - 3 hours");

  // Notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to panditService updates
  useEffect(() => {
    const unsub = panditService.subscribe(() => {
      setPandits(panditService.getAllPandits());
      setApplications(panditService.getOnboardingApplications());
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Edit Modal with existing Pandit or fresh template for Create
  const handleOpenCreate = () => {
    setEditingPandit(null);
    setFormName("");
    setFormSanskritName("");
    setFormTitle("Vedic Purohit & Ritual Specialist");
    setFormTradition("Shukla Yajurveda");
    setFormExpYears(12);
    setFormLanguages(["Hindi", "Sanskrit"]);
    setFormPhone("+91 ");
    setFormEmail("");
    setFormCity("Varanasi");
    setFormState("Uttar Pradesh");
    setFormArea("");
    setFormWillingToTravel(true);
    setFormBio("");
    setFormIsVerified(true);
    setFormInstitution("Kashi Veda Pathashala");
    setFormLineage("");
    setFormRituals([
      {
        id: `r-${Date.now()}-1`,
        name: "Griha Pravesha & Vastu Shanti",
        category: "samskara",
        duration: "3 - 4 hours",
        samagriListProvided: true,
        description: "Vedic home consecration with Navagraha Homa.",
      },
    ]);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (pandit: PanditProfile) => {
    setEditingPandit(pandit);
    setFormName(pandit.name);
    setFormSanskritName(pandit.sanskritName || "");
    setFormTitle(pandit.title);
    setFormTradition(pandit.tradition as any);
    setFormExpYears(pandit.experienceYears);
    setFormLanguages([...pandit.languages]);
    setFormPhone(pandit.phone);
    setFormEmail(pandit.email || "");
    setFormCity(pandit.location.city);
    setFormState(pandit.location.state);
    setFormArea(pandit.location.area || "");
    setFormWillingToTravel(pandit.location.willingToTravel);
    setFormBio(pandit.bio);
    setFormIsVerified(pandit.isVerified);
    setFormInstitution(pandit.verificationDetails?.institution || "");
    setFormLineage(pandit.verificationDetails?.lineageOrGuru || "");
    setFormRituals([...pandit.rituals]);
    setIsEditModalOpen(true);
  };

  const handleSavePandit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formCity.trim()) {
      showToast("Please provide Name, Phone, and City.");
      return;
    }

    const payload: Partial<PanditProfile> = {
      name: formName.trim(),
      sanskritName: formSanskritName.trim() || undefined,
      title: formTitle.trim(),
      tradition: formTradition,
      experienceYears: Number(formExpYears) || 5,
      languages: formLanguages,
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      location: {
        city: formCity.trim(),
        state: formState.trim(),
        area: formArea.trim() || undefined,
        willingToTravel: formWillingToTravel,
      },
      bio: formBio.trim(),
      isVerified: formIsVerified,
      avatarSeed: formName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      rituals: formRituals,
      verificationDetails: formIsVerified
        ? {
            institution: formInstitution.trim() || "Veda Pathashala Verified",
            verifiedDate: new Date().toISOString().split("T")[0],
            lineageOrGuru: formLineage.trim() || undefined,
            authorityType: "veda_pathashala",
            verificationBadgeTitle: "Veda Pathashala Verified",
          }
        : undefined,
    };

    if (editingPandit) {
      panditService.updatePandit(editingPandit.id, payload);
      adminAuthService.logAudit(
        "services",
        "UPDATE_PUROHIT",
        `Updated Purohit profile: ${formName}`,
        { id: editingPandit.id, name: formName, tradition: formTradition }
      );
      showToast(`Updated Purohit profile: ${formName}`);
    } else {
      const created = panditService.createPandit(payload as any);
      adminAuthService.logAudit(
        "services",
        "CREATE_PUROHIT",
        `Created new Purohit profile: ${formName}`,
        { id: created.id, name: formName, tradition: formTradition }
      );
      showToast(`Added new Purohit profile: ${formName}`);
    }

    setIsEditModalOpen(false);
  };

  const handleDeletePandit = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the public directory?`)) {
      panditService.deletePandit(id);
      adminAuthService.logAudit(
        "services",
        "DELETE_PUROHIT",
        `Deleted Purohit profile: ${name}`,
        { id, name }
      );
      showToast(`Removed Purohit profile: ${name}`);
    }
  };

  const handleToggleVerification = (pandit: PanditProfile) => {
    const updatedStatus = !pandit.isVerified;
    panditService.updatePandit(pandit.id, {
      isVerified: updatedStatus,
      verificationDetails: updatedStatus
        ? {
            institution: "Dharma Parishad Board Verified",
            verifiedDate: new Date().toISOString().split("T")[0],
            authorityType: "veda_pathashala",
            verificationBadgeTitle: "Veda Pathashala Verified",
          }
        : undefined,
    });
    adminAuthService.logAudit(
      "services",
      "TOGGLE_VERIFICATION",
      `Toggled verification for ${pandit.name} to ${updatedStatus}`,
      { id: pandit.id, isVerified: updatedStatus }
    );
    showToast(
      updatedStatus
        ? `Verified badge granted to ${pandit.name}`
        : `Verified badge removed from ${pandit.name}`
    );
  };

  const handleApproveApp = (app: PanditOnboardingApplication) => {
    const profile = panditService.approveOnboardingApplication(app.id);
    adminAuthService.logAudit(
      "services",
      "APPROVE_ONBOARDING",
      `Approved onboarding application for ${app.name}`,
      { applicationId: app.id, priestId: profile.id, institution: app.institution }
    );
    showToast(`Approved & published Pandit: ${app.name} to active directory!`);
  };

  const handleRejectApp = (app: PanditOnboardingApplication) => {
    panditService.rejectOnboardingApplication(app.id, "Credentials could not be verified by Dharma Parishad.");
    adminAuthService.logAudit(
      "services",
      "REJECT_ONBOARDING",
      `Rejected onboarding application for ${app.name}`,
      { applicationId: app.id, name: app.name }
    );
    showToast(`Rejected application for: ${app.name}`);
  };

  const handleAddRitual = () => {
    if (!newRitualName.trim()) return;
    const r: PanditRitual = {
      id: `r-${Date.now()}`,
      name: newRitualName.trim(),
      category: "samskara",
      duration: newRitualDuration,
      samagriListProvided: true,
      description: `Traditional Vedic ${newRitualName.trim()} puja.`,
    };
    setFormRituals([...formRituals, r]);
    setNewRitualName("");
  };

  const handleRemoveRitual = (rid: string) => {
    setFormRituals(formRituals.filter((r) => r.id !== rid));
  };

  // Filtered Pandits
  const filteredPandits = pandits.filter((p) => {
    if (selectedTradition !== "All" && p.tradition !== selectedTradition) return false;
    if (verifiedOnly && !p.isVerified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesCity = p.location.city.toLowerCase().includes(q);
      const matchesState = p.location.state.toLowerCase().includes(q);
      const matchesRitual = p.rituals.some((r) => r.name.toLowerCase().includes(q));
      return matchesName || matchesCity || matchesState || matchesRitual;
    }
    return true;
  });

  const pendingAppsCount = panditService.getPendingApplicationsCount();
  const verifiedCount = pandits.filter((p) => p.isVerified).length;
  const totalRitualsCount = pandits.reduce((acc, p) => acc + (p.rituals?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl flex items-center space-x-2 animate-fadeIn">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="ui-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="ui-badge ui-badge-warning">
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              <span>Vedic Purohit Services • ऋत्विक् सेवा प्रबन्धन</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Vedic Priests, Ritual Services & Onboarding Governance
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Full CRUD management for verified Vedic priests, ritual cataloging, credentials verification,
              and review of mobile onboarding applications.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="ui-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Purohit (पुरोहित जोड़ें)</span>
            </button>
          </div>
        </div>

        {/* Metric Counters */}
        <div className="admin-stats-grid mt-6 pt-6 border-t border-slate-200">
          <div className="stat-card">
            <div className="stat-card-title">Active Priests</div>
            <div className="stat-card-value">{pandits.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Zero-Commission</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Verified Badges</div>
            <div className="stat-card-value text-blue-600">{verifiedCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Pathashala Certified</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Cataloged Rituals</div>
            <div className="stat-card-value">{totalRitualsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Samskaras & Homas</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Pending Onboarding</div>
            <div className="stat-card-value text-amber-600">{pendingAppsCount}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Needs Admin Review</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "directory"
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active Priest Directory ({pandits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 relative ${
            activeTab === "applications"
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Onboarding Applications ({applications.length})</span>
          {pendingAppsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1" />
          )}
        </button>
      </div>

      {/* Tab 1: Active Priest Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by priest name, city, ritual, or tradition..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedTradition}
                onChange={(e) => setSelectedTradition(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Traditions</option>
                {VEDIC_TRADITIONS.map((trad) => (
                  <option key={trad} value={trad}>
                    {trad}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer px-2 select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-400 w-3.5 h-3.5"
                />
                <span>Verified Only</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  panditService.resetToDefaultCorpus();
                  showToast("Corpus reset to canonical seed data.");
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset to default seed corpus"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pandit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPandits.map((pandit) => (
              <div
                key={pandit.id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Top Bar: Tradition + Verification Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {pandit.tradition}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(pandit)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        pandit.isVerified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                      }`}
                      title="Click to toggle verified status"
                    >
                      <Award className="w-3 h-3" />
                      <span>{pandit.isVerified ? "Verified" : "Unverified"}</span>
                    </button>
                  </div>

                  {/* Name + Title */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                      <span>{pandit.name}</span>
                      {pandit.sanskritName && (
                        <span className="text-xs font-sanskrit text-amber-700 font-normal">
                          ({pandit.sanskritName})
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-blue-700 font-medium mt-0.5">{pandit.title}</p>
                  </div>

                  {/* City, Experience & Phone */}
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>
                        {pandit.location.city}, {pandit.location.state}
                        {pandit.location.willingToTravel && " · Willing to travel"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">
                        {pandit.verificationDetails?.institution || "Independent Veda Practitioner"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="font-mono text-slate-700">{pandit.phone}</span>
                    </div>
                  </div>

                  {/* Rituals Chips */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Rituals Offered ({pandit.rituals?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(pandit.rituals || []).slice(0, 3).map((r) => (
                        <span
                          key={r.id}
                          className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {r.name}
                        </span>
                      ))}
                      {(pandit.rituals || []).length > 3 && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          +{pandit.rituals.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions (CRUD) */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    ⭐ <span className="font-bold text-slate-800">{pandit.rating}</span> ({pandit.experienceYears}y exp)
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(pandit)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Priest Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePandit(pandit.id, pandit.name)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete / De-list Priest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Onboarding Applications Queue */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Purohit Onboarding Applications ({applications.length})
              </h3>
              <p className="text-xs text-slate-500">
                Applications submitted by Vedic Priests via the mobile app interface. Review and 1-click certify.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
              No onboarding applications in the queue.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    app.status === "PENDING"
                      ? "bg-white border-blue-300 shadow-sm"
                      : app.status === "APPROVED"
                      ? "bg-white border-emerald-300 opacity-90"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{app.name}</span>
                        {app.sanskritName && (
                          <span className="text-xs font-sanskrit text-amber-700">
                            ({app.sanskritName})
                          </span>
                        )}
                        <span
                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            app.status === "PENDING"
                              ? "ui-badge ui-badge-warning"
                              : app.status === "APPROVED"
                              ? "ui-badge ui-badge-success"
                              : "ui-badge ui-badge-error"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>
                          <strong>Tradition:</strong> {app.tradition}
                        </span>
                        <span>
                          <strong>Experience:</strong> {app.experienceYears} years
                        </span>
                        <span>
                          <strong>Location:</strong> {app.city}, {app.state}
                        </span>
                        <span>
                          <strong>Phone:</strong> {app.phone}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong>Veda Institution:</strong> {app.institution}
                        {app.lineageOrGuru && ` · Guru: ${app.lineageOrGuru}`}
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong>Rituals:</strong> {app.rituals.join(", ")}
                      </div>

                      <p className="text-xs text-slate-700 italic pt-1">"{app.bio}"</p>
                    </div>

                    {/* Actions for Application */}
                    {app.status === "PENDING" && (
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveApp(app)}
                          className="py-1.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1 cursor-pointer shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Certify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectApp(app)}
                          className="py-1.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isEditModalOpen && (
        <div className="ui-overlay animate-fadeIn">
          <div className="ui-modal max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 my-auto relative">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pr-8">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPandit ? `Edit Purohit Profile: ${editingPandit.name}` : "Add New Vedic Purohit"}
              </h3>
              <p className="text-xs text-slate-500">
                Configure profile, Vedic lineage, contact coordinates, and ritual cataloging.
              </p>
            </div>

            <form onSubmit={handleSavePandit} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sanskrit">
                      संस्कृत / देवनागरी नाम
                    </label>
                    <input
                      type="text"
                      value={formSanskritName}
                      onChange={(e) => setFormSanskritName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-sanskrit bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Veda Tradition *
                    </label>
                    <select
                      value={formTradition}
                      onChange={(e) => setFormTradition(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {VEDIC_TRADITIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Experience (Years) *
                    </label>
                    <input
                      type="number"
                      value={formExpYears}
                      onChange={(e) => setFormExpYears(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Verified Badge
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-700 h-8 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsVerified}
                        onChange={(e) => setFormIsVerified(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-400 w-4 h-4"
                      />
                      <span>Pathashala Certified</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City & State *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pathashala / Gurukula Institution
                  </label>
                  <input
                    type="text"
                    value={formInstitution}
                    onChange={(e) => setFormInstitution(e.target.value)}
                    placeholder="e.g. Kashi Veda Pathashala, Sampurnanand"
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bio & Expertise
                  </label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Rituals List inside edit */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Rituals Catalog ({formRituals.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {formRituals.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        <span>{r.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRitual(r.id)}
                          className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={newRitualName}
                      onChange={(e) => setNewRitualName(e.target.value)}
                      placeholder="Add ritual (e.g. Navagraha Homa)"
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRitual}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    >
                      Add Ritual
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="ui-button ui-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button"
                >
                  {editingPandit ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
