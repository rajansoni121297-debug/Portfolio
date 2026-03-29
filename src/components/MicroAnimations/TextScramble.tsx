"use client";

import { useEffect } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function TextScramble() {
  useEffect(() => {
    const titles = document.querySelectorAll<HTMLElement>(".stitle, .skills-band-title, .mentor-card-title");

    titles.forEach((el) => {
      // Store original innerHTML (preserves <em> tags and gold color)
      const originalHTML = el.innerHTML;
      const originalText = el.textContent || "";
      let isAnimating = false;
      let rafId: number;

      el.addEventListener("mouseenter", () => {
        if (isAnimating) return;
        isAnimating = true;

        const len = originalText.length;
        let frame = 0;
        const totalFrames = 12;

        function tick() {
          let output = "";
          for (let i = 0; i < len; i++) {
            const char = originalText[i];
            if (char === " " || char === "\n") {
              output += char;
              continue;
            }
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
            // Restore original HTML with <em> tags intact
            el.innerHTML = originalHTML;
            isAnimating = false;
          }
        }

        rafId = requestAnimationFrame(tick);
      });

      el.addEventListener("mouseleave", () => {
        cancelAnimationFrame(rafId);
        // Always restore original HTML (not textContent)
        el.innerHTML = originalHTML;
        isAnimating = false;
      });
    });
  }, []);

  return null;
}
