"use client";

import { useEffect } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function TextScramble() {
  useEffect(() => {
    const titles = document.querySelectorAll<HTMLElement>(".stitle, .ptitle, .skills-band-title, .ctitle, .mentor-card-title");

    titles.forEach((el) => {
      const original = el.textContent || "";
      let isAnimating = false;
      let rafId: number;

      el.addEventListener("mouseenter", () => {
        if (isAnimating) return;
        isAnimating = true;

        const len = original.length;
        let frame = 0;
        const totalFrames = 12;

        function tick() {
          let output = "";
          for (let i = 0; i < len; i++) {
            const char = original[i];
            if (char === " " || char === "\n") {
              output += char;
              continue;
            }
            // Characters resolve from left to right
            const resolveAt = Math.floor((i / len) * totalFrames);
            if (frame >= resolveAt) {
              output += char;
            } else {
              output += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          el.textContent = output;
          frame++;

          if (frame <= totalFrames) {
            rafId = requestAnimationFrame(tick);
          } else {
            el.textContent = original;
            isAnimating = false;
          }
        }

        rafId = requestAnimationFrame(tick);
      });

      el.addEventListener("mouseleave", () => {
        cancelAnimationFrame(rafId);
        el.textContent = original;
        isAnimating = false;
      });
    });
  }, []);

  return null;
}
