import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal: Renders modal overlays directly into document.body.
 *
 * This guarantees that `position: fixed` modals are anchored to the true browser
 * viewport rather than being trapped or clipped by ancestors with CSS transform,
 * filter, perspective, or will-change properties (such as theme transitions,
 * backdrop animations, or page crossfade wrappers).
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>("prism-pulse");

  useEffect(() => {
    setMounted(true);
    const updateTheme = () => {
      const active =
        document.documentElement.getAttribute("data-theme") ||
        document.body.getAttribute("data-theme") ||
        (typeof localStorage !== "undefined" ? localStorage.getItem("sutrasparsh_theme") : null) ||
        "prism-pulse";
      setTheme(active);
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const themeClass = `theme-${theme} ${
    theme === "light"
      ? "light-mode"
      : theme === "golden-hour"
      ? "golden-hour-mode"
      : theme === "prism-pulse"
      ? "theme-prism-pulse"
      : ""
  }`;

  return createPortal(
    <div data-theme={theme} className={`contents ${themeClass}`}>
      {children}
    </div>,
    document.body
  );
};
