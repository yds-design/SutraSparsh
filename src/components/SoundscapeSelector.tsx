import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Sparkles, Check, Music, Radio, Waves, Wind, Bell } from "lucide-react";
import {
  soundEngine,
  SOUNDSCAPES,
  type AmbientSoundscape,
  type SoundscapeInfo,
} from "../utils/audio";

export interface SoundscapeSelectorProps {
  isLight?: boolean;
  className?: string;
  onSoundscapeChange?: (soundscape: AmbientSoundscape) => void;
}

export const SoundscapeSelector: React.FC<SoundscapeSelectorProps> = ({
  isLight = false,
  className = "",
  onSoundscapeChange,
}) => {
  const [selectedSoundscape, setSelectedSoundscape] = useState<AmbientSoundscape>(() =>
    soundEngine.getSoundscape()
  );
  const [isDroneActive, setIsDroneActive] = useState(() => soundEngine.getIsPlayingDrone());
  const [isTanpuraEnabled, setIsTanpuraEnabled] = useState(() => soundEngine.getIsTanpuraEnabled());
  const [previewingId, setPreviewingId] = useState<AmbientSoundscape | null>(null);

  // Sync state with global soundscape and tanpura toggle events
  useEffect(() => {
    const handleSoundscapeChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AmbientSoundscape>;
      if (customEvent.detail) {
        setSelectedSoundscape(customEvent.detail);
      }
    };

    const handleTanpuraChanged = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIsTanpuraEnabled(customEvent.detail);
      }
    };

    window.addEventListener("sutrasparsh:soundscape_changed", handleSoundscapeChanged);
    window.addEventListener("sutrasparsh:tanpura_enabled_changed", handleTanpuraChanged);

    return () => {
      window.removeEventListener("sutrasparsh:soundscape_changed", handleSoundscapeChanged);
      window.removeEventListener("sutrasparsh:tanpura_enabled_changed", handleTanpuraChanged);
    };
  }, []);

  // Poll drone active state for responsive synchronization across tabs & components
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDroneActive(soundEngine.getIsPlayingDrone());
      setIsTanpuraEnabled(soundEngine.getIsTanpuraEnabled());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (soundscape: AmbientSoundscape) => {
    setSelectedSoundscape(soundscape);
    soundEngine.setSoundscape(soundscape);
    if (onSoundscapeChange) {
      onSoundscapeChange(soundscape);
    }
  };

  const handleToggleTanpura = () => {
    const nextState = !isTanpuraEnabled;
    setIsTanpuraEnabled(nextState);
    soundEngine.setTanpuraEnabled(nextState);
  };

  const handlePreview = (e: React.MouseEvent, soundscape: AmbientSoundscape) => {
    e.stopPropagation();
    if (previewingId === soundscape) {
      setPreviewingId(null);
      return;
    }
    setPreviewingId(soundscape);
    soundEngine.previewSoundscape(soundscape);
    setTimeout(() => {
      setPreviewingId((current) => (current === soundscape ? null : current));
    }, 4000);
  };

  const handleToggleDroneWithSoundscape = () => {
    const active = soundEngine.toggleTanpuraDrone();
    setIsDroneActive(active);
  };

  const getSoundscapeIcon = (id: AmbientSoundscape) => {
    switch (id) {
      case "temple-bell":
        return <Bell className="w-4 h-4 text-amber-500" />;
      case "himalayan-breeze":
        return <Wind className="w-4 h-4 text-sky-500" />;
      case "river-ganga":
        return <Waves className="w-4 h-4 text-emerald-500" />;
      default:
        return <Music className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      data-testid="soundscape-selector"
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isLight
          ? "bg-[#FFFDF8] border-[#E8DCC2] shadow-2xs"
          : "bg-white/5 border-white/10 hover:border-amber-500/20"
      } ${className}`}
    >
      {/* 1. Header Row & Master Ambient Audio Play/Pause Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-amber-500/10">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isLight ? "bg-[#FDF3DF] text-[#874606] border border-[#E8CF9A]" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold tracking-wider uppercase ${
                  isLight ? "text-[#261B12]" : "text-amber-200"
                }`}
              >
                Ambient Soundscapes & Atmosphere
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F]"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}
              >
                3 Audio Modes
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? "text-[#4A3A2F]" : "text-stone-400"}`}>
              Select your preferred sacred background audio: Temple Bell, Himalayan Breeze, or River Ganga
            </p>
          </div>
        </div>

        {/* Master Play/Pause Soundscape Button */}
        <button
          type="button"
          onClick={handleToggleDroneWithSoundscape}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shrink-0 self-start sm:self-auto active:scale-95 ${
            isDroneActive
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50"
              : isLight
              ? "bg-[#FBEFD3] hover:bg-[#F5EEDB] text-[#874606] border border-[#DECB9F]"
              : "bg-white/10 hover:bg-white/15 text-stone-300 border border-white/10"
          }`}
          title="Start or pause ambient soundscape"
          aria-label={isDroneActive ? "Pause Ambient Soundscape" : "Play Ambient Soundscape"}
        >
          {isDroneActive ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Playing Soundscape</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Soundscape</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Tanpura Drone Layer Toggle (Disabled by Default per requirements) */}
      <div
        data-testid="tanpura-drone-settings-card"
        className={`my-3.5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
          isTanpuraEnabled
            ? isLight
              ? "bg-[#FDF7E7] border-amber-300"
              : "bg-amber-950/20 border-amber-500/30"
            : isLight
            ? "bg-[#FAF7F0] border-[#E8DCC2]"
            : "bg-white/5 border-white/5"
        }`}
      >
        <div className="flex items-start sm:items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
              isTanpuraEnabled
                ? "bg-amber-500 text-stone-950 font-bold"
                : isLight
                ? "bg-stone-200 text-stone-600"
                : "bg-stone-800 text-stone-400"
            }`}
          >
            <span className="text-xs">🕉️</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold ${
                  isLight ? "text-[#261B12]" : "text-stone-200"
                }`}
              >
                432Hz / 136.1Hz Tanpura Drone Layer
              </span>
              <span
                className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isTanpuraEnabled
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : isLight
                    ? "bg-stone-200/80 text-stone-600 border border-stone-300"
                    : "bg-stone-800 text-stone-400 border border-stone-700"
                }`}
              >
                {isTanpuraEnabled ? "Active (Layered)" : "Disabled by default (Off)"}
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? "text-[#5B493B]" : "text-stone-400"}`}>
              {isTanpuraEnabled
                ? "Synthesizing 136.1Hz Cosmic Om fundamental and 432Hz harmonics alongside your selected soundscape."
                : "Disabled by default for clean, natural ambient listening. Toggle on anytime to layer the 136.1Hz Om Tanpura drone."}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          data-testid="toggle-tanpura-drone"
          onClick={handleToggleTanpura}
          role="switch"
          aria-checked={isTanpuraEnabled}
          aria-label="Toggle 432Hz/136.1Hz Tanpura Drone Layer (Disabled by default)"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out self-end sm:self-center focus:outline-hidden ${
            isTanpuraEnabled
              ? "bg-amber-500"
              : isLight
              ? "bg-stone-300"
              : "bg-stone-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isTanpuraEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 3. Soundscape Quick-Switch Navigation Tabs */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-[#874606]" : "text-amber-400"}`}>
          Switch Ambient Soundscape Audio
        </span>
        <span className={`text-[10px] ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
          Tap card or preview to listen
        </span>
      </div>

      {/* 4. Three Selectable Soundscape Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SOUNDSCAPES.map((item: SoundscapeInfo) => {
          const isSelected = selectedSoundscape === item.id;
          const isPreviewing = previewingId === item.id;

          return (
            <div
              key={item.id}
              data-testid={`soundscape-card-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`group relative p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? isLight
                    ? "bg-[#FFFDF8] border-amber-500 ring-2 ring-amber-500/30 shadow-sm"
                    : "bg-amber-500/15 border-amber-500 ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/15"
                  : isLight
                  ? "bg-[#FAF8F5] border-[#E8DCC2] hover:border-amber-400/60 hover:bg-white"
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
              }`}
            >
              {/* Card Top: Icon, Titles & Active Checkmark */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-base ${
                        isSelected
                          ? isLight
                            ? "bg-amber-100 border border-amber-300"
                            : "bg-amber-500/25 border border-amber-500/40"
                          : isLight
                          ? "bg-stone-100"
                          : "bg-white/5"
                      }`}
                    >
                      <span role="img" aria-label={item.name}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isSelected
                            ? isLight
                              ? "text-amber-900"
                              : "text-amber-300"
                            : isLight
                            ? "text-[#261B12]"
                            : "text-stone-200"
                        }`}
                      >
                        {item.name}
                      </div>
                      <div className="text-[10px] font-sanskrit text-amber-600/90 dark:text-amber-400/90 font-medium">
                        {item.devanagari}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${
                        isLight
                          ? "bg-amber-500 text-stone-950 font-extrabold"
                          : "bg-amber-400 text-stone-950 font-extrabold"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.id);
                      }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                        isLight
                          ? "border-[#E8DCC2] text-[#874606] hover:bg-amber-100"
                          : "border-white/10 text-stone-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Select
                    </button>
                  )}
                </div>

                <p
                  className={`text-[11px] leading-relaxed mb-2.5 ${
                    isLight ? "text-[#4A3A2F]" : "text-stone-400"
                  }`}
                >
                  {item.description}
                </p>

                {/* Acoustic Elements Tags */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {item.elements.map((el) => (
                    <span
                      key={el}
                      className={`text-[9.5px] px-1.5 py-0.5 rounded ${
                        isLight
                          ? "bg-[#F5EEDB] text-[#874606] border border-[#E8DCC2]"
                          : "bg-white/5 text-stone-400 border border-white/5"
                      }`}
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom: Subtitle & Audition Preview Button */}
              <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between">
                <span className={`text-[10px] font-mono ${isLight ? "text-stone-500" : "text-stone-400"}`}>
                  {item.subtitle}
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePreview(e, item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ${
                    isPreviewing
                      ? "bg-amber-500 text-stone-950 font-bold animate-pulse"
                      : isLight
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                      : "bg-white/10 hover:bg-white/15 text-stone-300 border border-white/10"
                  }`}
                  title={`Preview ${item.name} for 4 seconds`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isPreviewing ? "Playing..." : "Preview"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Real-time Status Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1.5">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className={isLight ? "text-[#4A3A2F]" : "text-stone-400"}>
            Selected Soundscape:{" "}
            <strong className={isLight ? "text-[#261B12]" : "text-amber-300"}>
              {SOUNDSCAPES.find((s) => s.id === selectedSoundscape)?.name || "Temple Bell"}
            </strong>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {isTanpuraEnabled ? "with 136.1Hz Drone" : "Pure Soundscape"}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-[10.5px]">
          {isDroneActive ? (
            <span className="inline-flex items-center space-x-1.5 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Streaming {SOUNDSCAPES.find((s) => s.id === selectedSoundscape)?.name}
                {isTanpuraEnabled ? " + Tanpura Drone" : ""}
              </span>
            </span>
          ) : (
            <span className={isLight ? "text-stone-500" : "text-stone-400"}>
              Tap "Play Soundscape" above or header audio button to begin
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
