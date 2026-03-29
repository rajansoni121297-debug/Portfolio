"use client";

import { useEffect } from "react";

export function EasterEgg() {
  useEffect(() => {
    const KK = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let ki = 0;

    const egg = document.getElementById("egg") as HTMLElement;
    const eggClose = document.getElementById("egg-close") as HTMLElement;
    const fk = document.getElementById("fk") as HTMLElement;

    if (!egg || !eggClose || !fk) return;

    function showEgg() {
      egg.classList.add("show");
      if ((window as any).toast) {
        (window as any).toast("\uD83C\uDF89 Konami code unlocked!");
      }
    }

    function hideEgg() {
      egg.classList.remove("show");
    }

    const onKonami = (e: KeyboardEvent) => {
      if (e.keyCode === KK[ki]) {
        ki++;
        if (ki === KK.length) {
          showEgg();
          ki = 0;
        }
      } else {
        ki = 0;
      }
    };

    const onEscEgg = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideEgg();
    };

    const onEggCloseClick = () => hideEgg();
    const onFkClick = () => showEgg();

    document.addEventListener("keydown", onKonami);
    document.addEventListener("keydown", onEscEgg);
    eggClose.addEventListener("click", onEggCloseClick);
    fk.addEventListener("click", onFkClick);

    /* Cursor */
    const setCursor = (window as any).setCursor;
    if (setCursor) {
      setCursor(fk, "");
    }

    return () => {
      document.removeEventListener("keydown", onKonami);
      document.removeEventListener("keydown", onEscEgg);
      eggClose.removeEventListener("click", onEggCloseClick);
      fk.removeEventListener("click", onFkClick);
    };
  }, []);

  return (
    <>
      {/* Easter egg overlay */}
      <div id="egg">
        <span className="egg-emoji">{"\uD83C\uDFA8"}</span>
        <div className="egg-title">You found the secret!</div>
        <div className="egg-sub">
          {"// konami code unlocked \u00B7 designer mode activated"}
        </div>
        <p className="egg-msg">
          {
            "Congrats \u2014 you clearly have the attention to detail that makes a great collaborator. Raj would love to work with you."
          }
        </p>
        <button className="egg-close" id="egg-close">
          {"Close \u00B7 Esc"}
        </button>
      </div>

      {/* Footer */}
      <footer>
        <div className="flogo">
          Raj Deep Dey<span>.</span>
        </div>
        <div className="fcopy">
          {"UI/UX & Product Designer \u00B7 Ahmedabad \u00B7 \u00A9 2026"}
        </div>
        <div
          className="fkonami"
          id="fk"
          title="Try the Konami Code \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA"
        >
          {"\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA"}
        </div>
      </footer>
    </>
  );
}
