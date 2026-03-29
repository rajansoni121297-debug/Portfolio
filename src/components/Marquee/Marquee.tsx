"use client";

import { useEffect } from "react";

const tools = [
  "Figma",
  "Product Design",
  "Figma Make",
  "AI-Assisted Design",
  "Adobe XD",
  "Vibe Coding",
  "Design Systems",
  "Google AI Studio",
  "User Research",
  "Jira",
  "Miro",
  "Sprint Planning",
];

export function Marquee() {
  const doubled = [...tools, ...tools];

  useEffect(() => {
    const chips = document.querySelectorAll(".tool-chip");
    chips.forEach((chip) => {
      if (typeof (window as any).setCursor === "function") {
        (window as any).setCursor(chip as HTMLElement, "");
      }
    });
  }, []);

  return (
    <div className="marquee-wrap">
      <div className="tools-track">
        {doubled.map((name, i) => (
          <div className="tool-chip" key={`${name}-${i}`}>
            <span className="tdot"></span>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
