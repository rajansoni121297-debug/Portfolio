"use client";

import { useEffect } from "react";

export function LetterReveal() {
  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(".stitle");

    headings.forEach((heading) => {
      // Skip if already processed
      if (heading.dataset.letterReveal) return;
      heading.dataset.letterReveal = "1";

      // Store original HTML (preserves <em> tags)
      const originalHTML = heading.innerHTML;

      // Wrap individual characters in spans while preserving HTML tags
      function wrapLetters(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          return [...text]
            .map((ch) => {
              if (ch === " ") return " ";
              return `<span class="lr-char">${ch}</span>`;
            })
            .join("");
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          const attrs = el.attributes;
          let attrStr = "";
          for (let i = 0; i < attrs.length; i++) {
            attrStr += ` ${attrs[i].name}="${attrs[i].value}"`;
          }
          let inner = "";
          el.childNodes.forEach((child) => {
            inner += wrapLetters(child);
          });
          return `<${tag}${attrStr}>${inner}</${tag}>`;
        }
        return "";
      }

      const wrapped = Array.from(heading.childNodes)
        .map((n) => wrapLetters(n))
        .join("");
      heading.innerHTML = wrapped;

      const chars = heading.querySelectorAll<HTMLElement>(".lr-char");

      // Initially hide
      chars.forEach((ch) => {
        ch.style.opacity = "0";
        ch.style.transform = "translateY(20px)";
        ch.style.display = "inline-block";
        ch.style.transition = "none";
      });

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(heading);

          chars.forEach((ch, i) => {
            setTimeout(() => {
              ch.style.transition = "opacity .4s cubic-bezier(.23,1,.32,1), transform .4s cubic-bezier(.23,1,.32,1)";
              ch.style.opacity = "1";
              ch.style.transform = "translateY(0)";
            }, i * 25);
          });
        },
        { threshold: 0.3 }
      );

      obs.observe(heading);
    });
  }, []);

  return null;
}
