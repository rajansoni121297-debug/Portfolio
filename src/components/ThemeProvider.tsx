"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "./Toast/Toast";

type Theme = "dark";

interface ThemeContextType {
  theme: Theme;
  showDarkModePopup: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  showDarkModePopup: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>("dark");
  const [popupVisible, setPopupVisible] = useState(false);
  const { toast } = useToast();

  const showDarkModePopup = useCallback(() => {
    setPopupVisible(true);
    toast("// Nice try ☀️ — dark side is forever");
  }, [toast]);

  const closePopup = useCallback(() => {
    setPopupVisible(false);
  }, []);

  useEffect(() => {
    if (!popupVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [popupVisible, closePopup]);

  return (
    <ThemeContext.Provider value={{ theme, showDarkModePopup }}>
      {children}
      <div
        id="darkmode-popup"
        className={popupVisible ? "show" : ""}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePopup();
        }}
      >
        <div className="dm-card">
          <span className="dm-emoji">🌙</span>
          <div className="dm-headline">
            Naah, we designers<br />don&apos;t use light mode.
          </div>
          <div className="dm-sub">// ERROR 403 · LIGHT_MODE_FORBIDDEN</div>
          <div className="dm-sub2">
            Your retinas will thank you later.<br />
            <span>Dark mode is not a preference — it&apos;s a lifestyle.</span>
          </div>
          <button className="dm-btn" id="dm-close-btn" onClick={closePopup}>
            ← Stay in the Dark
          </button>
          <div className="dm-hint">
            // press Esc to also dismiss · your eyes are safe here
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
