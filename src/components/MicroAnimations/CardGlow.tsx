"use client";

import { useEffect } from "react";

export function CardGlow() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".pcard, .tcard, .mentor-card, .cred-card, .cred-video");

    cards.forEach((card) => {
      // Create glow element
      const glow = document.createElement("div");
      glow.style.cssText = `
        position:absolute;inset:0;pointer-events:none;z-index:0;
        opacity:0;transition:opacity .3s;
        border-radius:inherit;overflow:hidden;
      `;
      const inner = document.createElement("div");
      inner.style.cssText = `
        position:absolute;width:300px;height:300px;
        border-radius:50%;
        background:radial-gradient(circle,rgba(200,153,58,0.12) 0%,transparent 70%);
        transform:translate(-50%,-50%);
        pointer-events:none;
      `;
      glow.appendChild(inner);

      // Ensure card has relative positioning
      const pos = getComputedStyle(card).position;
      if (pos === "static") card.style.position = "relative";

      card.appendChild(glow);

      card.addEventListener("mouseenter", () => {
        glow.style.opacity = "1";
      });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        inner.style.left = x + "px";
        inner.style.top = y + "px";
      });

      card.addEventListener("mouseleave", () => {
        glow.style.opacity = "0";
      });
    });
  }, []);

  return null;
}
