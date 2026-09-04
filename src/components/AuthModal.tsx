import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  Compass,
} from "lucide-react";
import { authService, type SeekerUser } from "../services/auth.service";
import { soundEngine } from "../utils/audio";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
  onOpenPrivacyPolicy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  theme = "sandstone",
  onOpenPrivacyPolicy,
}) => {
  const [currentUser, setCurrentUser] = useState<SeekerUser | null>(() =>
    authService.getCurrentUser()
  );
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [traditionFocus, setTraditionFocus] = useState("Advaita Vedanta & Raja Yoga");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";

  const modalBg = isLight
    ? "#FFFBF5"
    : isFestival
    ? "#4B0E17"
    : isAmethyst
    ? "#140A28"
    : "#1C120B";

  const modalBorder = isLight
    ? "#E6D7C3"
    : isFestival
    ? "rgba(255, 138, 0, 0.35)"
    : "rgba(216, 137, 22, 0.3)";

  const textColor = isLight ? "#3A2818" : "#F4E9D2";

  const handleGoogleSignIn = async (accountEmail?: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      soundEngine.playTempleBell(261.63);
      await authService.signInWithGoogle(accountEmail);
      setSuccessMsg("Signed in successfully via Google Account.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in via Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid personal email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      soundEngine.playTempleBell(293.66);
      if (authMode === "signup") {
        await authService.registerWithEmail(
          email.trim(),
          password,
          displayName.trim(),
          traditionFocus
        );
        setSuccessMsg("Sacred seeker account created! Welcome to SutraSparsh.");
      } else {
        await authService.signInWithEmail(email.trim(), password);
        setSuccessMsg("Signed in successfully with your personal email.");
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOff = async () => {
    setLoading(true);
    soundEngine.playTempleBell(220);
    try {
      await authService.signOut();
      setSuccessMsg("Signed off from SutraSparsh session.");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{
        backgroundColor: isLight ? "rgba(58, 40, 24, 0.45)" : "rgba(0, 0, 0, 0.8)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden relative transition-all"
        style={{
          backgroundColor: modalBg,
          borderColor: modalBorder,
          color: textColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center text-lg font-bold">
              ॐ
            </div>
            <div>
              <h3 id="auth-modal-title" className="font-serif-sacred text-lg font-bold">
                {currentUser ? "Sādhaka Account" : "Sacred Seeker Sign In"}
              </h3>
              <p className="text-[11px] opacity-75">
                {currentUser
                  ? "Manage spiritual profile & sync"
                  : "Sync daily sadhana across all devices"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BODY: SIGNED-IN SCREEN (SIGN OFF OPTION) */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div
              className="p-4 rounded-2xl border space-y-3"
              style={{
                backgroundColor: isLight ? "#FAF6EE" : "rgba(255,255,255,0.03)",
                borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif-sacred font-bold text-sm truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <div className="text-xs opacity-75 truncate">{currentUser.email}</div>
                  <div className="text-[11px] text-amber-500 mt-0.5 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{currentUser.spiritualTitle || "Sādhaka (साधक)"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-stone-700/40 text-[11px] space-y-1 opacity-80">
                <div className="flex justify-between">
                  <span>Sign-in Provider:</span>
                  <span className="font-mono capitalize font-semibold text-amber-400">
                    {currentUser.provider === "google" ? "Gmail / Google" : "Personal Email ID"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Focus Tradition:</span>
                  <span className="font-semibold">{currentUser.traditionFocus}</span>
                </div>
              </div>
            </div>

            {/* Cloud Sync Benefits */}
            <div className="text-xs space-y-2 text-stone-400">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Encrypted Sanctuary Cloud Sync</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your bookmarks, reading streak, reflections, and audio playback bookmarks are
                automatically protected and synced to this account.
              </p>
            </div>

            {/* Sign Off Action Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSignOff}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Off (साधना विश्राम)</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs opacity-80 hover:opacity-100 transition-colors"
              >
                Return to Reading
              </button>
            </div>
          </div>
        ) : (
          /* BODY: SIGN IN / SIGN UP SCREEN */
          <div className="p-6 space-y-5">
            {/* 1. Google / Gmail Sign In */}
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSignIn("vishal.kr.gupta@gmail.com")}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-center space-x-3 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isLight
                    ? "bg-white border-stone-300 hover:bg-stone-50 text-stone-900"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (vishal.kr.gupta@gmail.com)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div
                className="w-full border-t"
                style={{ borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.1)" }}
              />
              <span
                className="px-3 text-[11px] uppercase tracking-wider relative font-semibold opacity-60"
                style={{ backgroundColor: modalBg }}
              >
                or personal email
              </span>
            </div>

            {/* Sub Tabs: Sign In vs Sign Up */}
            <div
              className="flex rounded-xl p-1 border text-xs"
              style={{
                backgroundColor: isLight ? "#EDE4D8" : "rgba(255,255,255,0.05)",
                borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.1)",
              }}
            >
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">
                    Your Name / Spiritual Name
                  </label>
                  <div
                    className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border"
                    style={{
                      backgroundColor: isLight ? "#FFFFFF" : "rgba(255,255,255,0.05)",
                      borderColor: isLight ? "#D8C7B0" : "rgba(255,255,255,0.12)",
                    }}
                  >
                    <User className="w-4 h-4 opacity-50" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Vishal Kumar"
                      className="flex-1 bg-transparent outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold opacity-80 mb-1">
                  Personal Email Address
                </label>
                <div
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border"
                  style={{
                    backgroundColor: isLight ? "#FFFFFF" : "rgba(255,255,255,0.05)",
                    borderColor: isLight ? "#D8C7B0" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Mail className="w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seeker@sutrasparsh.com"
                    required
                    className="flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold opacity-80 mb-1">
                  Password
                </label>
                <div
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border"
                  style={{
                    backgroundColor: isLight ? "#FFFFFF" : "rgba(255,255,255,0.05)",
                    borderColor: isLight ? "#D8C7B0" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Lock className="w-4 h-4 opacity-50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">
                    Primary Spiritual Focus
                  </label>
                  <select
                    value={traditionFocus}
                    onChange={(e) => setTraditionFocus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-xs bg-transparent outline-none"
                    style={{
                      borderColor: isLight ? "#D8C7B0" : "rgba(255,255,255,0.12)",
                      backgroundColor: isLight ? "#FFFFFF" : "#1C120B",
                    }}
                  >
                    <option value="Advaita Vedanta & Raja Yoga">Advaita Vedanta & Raja Yoga</option>
                    <option value="Bhagavad Gita Study">Bhagavad Gita Study</option>
                    <option value="Patanjali Yoga Sutras">Patanjali Yoga Sutras</option>
                    <option value="Upanishadic Contemplation">Upanishadic Contemplation</option>
                    <option value="Daily Sādhana & Chanting">Daily Sādhana & Chanting</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === "signup" ? "Begin Sādhana Journey" : "Sign In to Sanctuary"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Legal Links footer */}
            <div className="pt-2 text-center text-[10.5px] opacity-70">
              By signing in, you agree to SutraSparsh{" "}
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="underline hover:text-amber-400 cursor-pointer"
              >
                Privacy Policy
              </button>{" "}
              & Terms.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
