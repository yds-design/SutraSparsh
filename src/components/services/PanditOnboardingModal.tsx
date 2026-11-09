import React, { useState } from "react";
import {
  X,
  UserCheck,
  Building2,
  Award,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  MapPin,
  Send,
} from "lucide-react";
import { panditService } from "../../services/pandit.service";
import type { AppTheme } from "../../types";

export interface PanditOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
}

const VEDIC_TRADITIONS = [
  "Rigveda",
  "Shukla Yajurveda",
  "Krishna Yajurveda",
  "Samaveda",
  "Atharvaveda",
  "Smarta",
  "Vaishnava",
] as const;

const COMMON_RITUALS = [
  "Griha Pravesha & Vastu Shanti (गृहप्रवेश)",
  "Satyanarayan Vrat Katha (सत्यनारायण पूजा)",
  "Rudrabhisheka & Shiva Puja (रुद्राभिषेक)",
  "Navagraha Shanti Homa (नवग्रह शांति होम)",
  "Vivaha Samskara (वैदिक विवाह संस्कार)",
  "Upanayana / Janeu Samskara (उपनयन संस्कार)",
  "Maha Mrityunjaya Homa (महामृत्युंजय होम)",
  "Chandi Patha & Homa (चण्डी पाठ एवं होम)",
  "Shraddha & Tarpan (श्राद्ध एवं तर्पण)",
];

export const PanditOnboardingModal: React.FC<PanditOnboardingModalProps> = ({
  isOpen,
  onClose,
  theme = "sandstone",
}) => {
  const isLight = theme === "light";

  // Form states
  const [name, setName] = useState("");
  const [sanskritName, setSanskritName] = useState("");
  const [tradition, setTradition] = useState<(typeof VEDIC_TRADITIONS)[number]>("Shukla Yajurveda");
  const [experienceYears, setExperienceYears] = useState(10);
  const [languages, setLanguages] = useState<string[]>(["Hindi", "Sanskrit"]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [willingToTravel, setWillingToTravel] = useState(true);
  const [institution, setInstitution] = useState("");
  const [lineageOrGuru, setLineageOrGuru] = useState("");
  const [selectedRituals, setSelectedRituals] = useState<string[]>([
    "Griha Pravesha & Vastu Shanti (गृहप्रवेश)",
    "Satyanarayan Vrat Katha (सत्यनारायण पूजा)",
  ]);
  const [bio, setBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleRitual = (ritual: string) => {
    setSelectedRituals((prev) =>
      prev.includes(ritual) ? prev.filter((r) => r !== ritual) : [...prev, ritual]
    );
  };

  const handleAddLanguage = () => {
    const trimmed = customLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages((prev) => [...prev, trimmed]);
      setCustomLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages((prev) => prev.filter((l) => l !== lang));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit WhatsApp / phone number.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError("Please specify your primary city and state.");
      return;
    }
    if (!institution.trim()) {
      setError("Please specify your Veda Pathashala, Gurukula, or certifying institution.");
      return;
    }
    if (selectedRituals.length === 0) {
      setError("Please select at least one sacred ritual you perform.");
      return;
    }

    setIsSubmitting(true);

    try {
      panditService.submitOnboardingApplication({
        name: name.trim(),
        sanskritName: sanskritName.trim() || undefined,
        tradition,
        experienceYears: Number(experienceYears) || 5,
        languages: languages.length > 0 ? languages : ["Hindi", "Sanskrit"],
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        area: area.trim() || undefined,
        willingToTravel,
        institution: institution.trim(),
        lineageOrGuru: lineageOrGuru.trim() || undefined,
        rituals: selectedRituals,
        bio:
          bio.trim() ||
          `Dedicated Vedic Purohit practicing ${tradition} traditions with ${experienceYears} years of experience.`,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : "Failed to submit application";
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pandit-onboarding-title"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border my-auto transition-all relative ${
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
          aria-label="Close onboarding modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif-sacred">
                पंजीकरण आवेदन प्राप्त हुआ · Application Submitted
              </h3>
              <p
                className={`text-xs max-w-md mx-auto leading-relaxed ${
                  isLight ? "text-stone-600" : "text-stone-300"
                }`}
              >
                धन्यवाद! Your application has been submitted to the SutraSparsh Dharma Parishad. Our team
                will verify your credentials and Veda Pathashala affiliation within 24-48 hours. Once verified,
                devotees can connect directly with you with 0% commission.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl text-left text-xs space-y-1 border max-w-md mx-auto ${
                isLight ? "bg-amber-50/70 border-amber-200 text-amber-950" : "bg-amber-950/20 border-amber-500/30 text-amber-200"
              }`}
            >
              <div className="font-bold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Next Steps for Verified Status:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                <li>Direct phone/WhatsApp verification with our Acharya Council</li>
                <li>Free digital listing with zero platform deduction forever</li>
                <li>Sacred verification badge issued upon certification</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all cursor-pointer shadow-md"
            >
              Close & Return to Sanctuary
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="space-y-1 pr-8">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Purohit Onboarding • पुरोहित पंजीकरण</span>
              </div>
              <h2
                id="modal-pandit-onboarding-title"
                className="text-lg sm:text-xl font-bold font-serif-sacred leading-tight"
              >
                Join the Verified Vedic Purohit Directory
              </h2>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? "text-stone-600" : "text-stone-300"
                }`}
              >
                Connect directly with devout Yajamanas across India and the global diaspora. 100% zero
                commission, zero booking fees, and full respect for Vedic Parampara.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields Container (Scrollable) */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {/* Row 1: Name & Sanskrit Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pandit Ramesh Shastri"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90 font-sanskrit">
                    संस्कृत / देवनागरी नाम (Optional)
                  </label>
                  <input
                    type="text"
                    value={sanskritName}
                    onChange={(e) => setSanskritName(e.target.value)}
                    placeholder="पं. रमेश शास्त्री"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-sanskrit border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Veda Tradition & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Veda Shakha / Tradition (वेद शाखा) *
                  </label>
                  <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  >
                    {VEDIC_TRADITIONS.map((trad) => (
                      <option key={trad} value={trad}>
                        {trad}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Years of Vedic Experience *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Phone / WhatsApp Number (Direct Contact) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isLight
                          ? "bg-white border-stone-200 text-stone-900"
                          : "bg-stone-800 border-stone-700 text-stone-100"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="purohit@example.com"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
              </div>

              {/* Row 4: City, State, Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    City (नगर) *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Varanasi, Bengaluru, Pune"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    State (राज्य) *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Uttar Pradesh, Karnataka"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Locality / Teertha Area
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Assi Ghat, Malleswaram"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
              </div>

              {/* Willing to Travel Toggle */}
              <label className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={willingToTravel}
                  onChange={(e) => setWillingToTravel(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span className="font-medium">
                  Willing to travel to other cities / overseas for major Yagnas and Samskaras
                </span>
              </label>

              {/* Row 5: Pathashala / Gurukula Institution & Guru */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Veda Pathashala / Certifying Institution *
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                    <input
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Kashi Veda Pathashala, Sampurnanand Sanskrit"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isLight
                          ? "bg-white border-stone-200 text-stone-900"
                          : "bg-stone-800 border-stone-700 text-stone-100"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Lineage / Parampara / Guru Name
                  </label>
                  <input
                    type="text"
                    value={lineageOrGuru}
                    onChange={(e) => setLineageOrGuru(e.target.value)}
                    placeholder="e.g. Shishya of Pt. Vidyadhar Shastri"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                </div>
              </div>

              {/* Rituals Conducted */}
              <div>
                <label className="block text-[11px] font-bold mb-1.5 opacity-90">
                  Primary Vedic Rituals Conducted * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_RITUALS.map((ritual) => {
                    const isSelected = selectedRituals.includes(ritual);
                    return (
                      <button
                        key={ritual}
                        type="button"
                        onClick={() => toggleRitual(ritual)}
                        className={`text-left p-2 rounded-xl text-xs border transition-all flex items-center space-x-2 cursor-pointer ${
                          isSelected
                            ? isLight
                              ? "bg-amber-100/70 border-amber-400 text-amber-950 font-semibold"
                              : "bg-amber-500/20 border-amber-500 text-amber-200 font-semibold"
                            : isLight
                            ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                            : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700/50"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] shrink-0 ${
                            isSelected
                              ? "bg-amber-500 border-amber-500 text-stone-950"
                              : "border-stone-400"
                          }`}
                        >
                          {isSelected ? "✓" : ""}
                        </div>
                        <span className="truncate">{ritual}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Languages for Chanting & Yajamana Guidance
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    >
                      <span>{lang}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-red-400 text-stone-400 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Add language (e.g. Gujarati, Telugu, Bengali)"
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-900"
                        : "bg-stone-800 border-stone-700 text-stone-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bio & Dedication */}
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-90">
                  Brief Introduction & Lineage Background (परिचय)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your Vedic studies, specialized prayogas, and adherence to Shastra maryada..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900"
                      : "bg-stone-800 border-stone-700 text-stone-100"
                  }`}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isLight
                    ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                    : "bg-stone-800 hover:bg-stone-700 text-stone-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Registration (पंजीकरण जमा करें)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
