import React from "react";
import { Sun, BookOpen, Search, Compass, Sliders } from "lucide-react";
import type { NavTab } from "./Header";

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedCount: number;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  theme = "sandstone",
}) => {
  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isSandstone = theme === "sandstone";

  const isTodayActive = activeTab === "today" || activeTab === "daily-app" || activeTab === "daily";
  const isExploreActive = activeTab === "explore" || activeTab === "explorer";
  const isSearchActive = activeTab === "search";
  const isJourneyActive = activeTab === "my-journey" || activeTab === "journal" || activeTab === "membership";
  const isPreferencesActive = activeTab === "preferences";

  const navBg = isLight
    ? "rgba(255, 251, 245, 0.96)"
    : isFestival
    ? "rgba(75, 14, 23, 0.96)"
    : isAmethyst
    ? "rgba(15, 10, 26, 0.96)"
    : "rgba(18, 13, 9, 0.96)";

  const navBorder = isLight
    ? "#E6D7C3"
    : isFestival
    ? "rgba(255, 138, 0, 0.3)"
    : isAmethyst
    ? "rgba(196, 168, 230, 0.2)"
    : "rgba(216, 137, 22, 0.25)";

  const activeColor = isLight
    ? "#B9680D"
    : isFestival
    ? "#FFD54A"
    : isAmethyst
    ? "#C4A8E6"
    : "#F2B333";

  const inactiveColor = isLight
    ? "#6B5844"
    : isFestival
    ? "#E6B17E"
    : isAmethyst
    ? "#8A79A5"
    : "#B9A995";

  const activePillBg = isLight
    ? "rgba(216, 137, 22, 0.15)"
    : isFestival
    ? "rgba(255, 138, 0, 0.2)"
    : isAmethyst
    ? "rgba(196, 168, 230, 0.15)"
    : "rgba(216, 137, 22, 0.15)";

  const navItems = [
    {
      id: "today" as NavTab,
      label: "Today",
      sanskrit: "आज",
      icon: Sun,
      isActive: isTodayActive,
    },
    {
      id: "explore" as NavTab,
      label: "Explore",
      sanskrit: "दर्शन",
      icon: BookOpen,
      isActive: isExploreActive,
    },
    {
      id: "search" as NavTab,
      label: "Search",
      sanskrit: "खोज",
      icon: Search,
      isActive: isSearchActive,
    },
    {
      id: "my-journey" as NavTab,
      label: "Journey",
      sanskrit: "साधना",
      icon: Compass,
      isActive: isJourneyActive,
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: "preferences" as NavTab,
      label: "More",
      sanskrit: "अधिक",
      icon: Sliders,
      isActive: isPreferencesActive,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t transition-colors duration-300 pb-[env(safe-area-inset-bottom,0.5rem)] shadow-2xl"
      style={{
        backgroundColor: navBg,
        borderColor: navBorder,
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-label={`${item.label} (${item.sanskrit})`}
              aria-current={item.isActive ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer"
              style={{
                color: item.isActive ? activeColor : inactiveColor,
              }}
            >
              {/* Active ambient glow pill behind icon */}
              {item.isActive && (
                <span
                  className="absolute inset-x-2 inset-y-1 rounded-xl -z-10 transition-all opacity-80"
                  style={{
                    backgroundColor: activePillBg,
                  }}
                />
              )}

              {/* Icon with potential notification count badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    item.isActive ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-black flex items-center justify-center border leading-none shadow-sm"
                    style={{
                      backgroundColor: isSandstone ? "#E8921A" : "#C4A8E6",
                      color: isSandstone ? "#1A0E06" : "#150B28",
                      borderColor: isSandstone ? "#F4B24B" : "#D4BEF2",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Label + Sanskrit Subtext */}
              <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
