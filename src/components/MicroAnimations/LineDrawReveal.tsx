"use client";

import { useEffect } from "react";

export function LineDrawReveal() {
  useEffect(() => {
    const lines = document.querySelectorAll<HTMLElement>(".hr-gold");

    lines.forEach((line) => {
      // Start with scaleX(0)
      line.style.transform = "scaleX(0)";
      line.style.transition = "none";

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(line);

          // Small delay for dramatic effect
          setTimeout(() => {
            line.style.transition = "transform .8s cubic-bezier(.23,1,.32,1)";
            line.style.transform = "scaleX(1)";
          }, 100);
        },
        { threshold: 0.5 }
      );

      obs.observe(line);
    });
  }, []);

  return null;
}
