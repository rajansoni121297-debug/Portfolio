"use client";

import { useEffect, useRef } from "react";

const skills: { label: string; pct: number }[] = [
  { label: "UI/UX\nDesign", pct: 95 },
  { label: "Product\nThinking", pct: 90 },
  { label: "Design\nSystems", pct: 88 },
  { label: "AI\nWorkflows", pct: 85 },
  { label: "Vibe\nCoding", pct: 75 },
];

const CIRCUMFERENCE = 2 * Math.PI * 36; // ~226.19

export function SkillsBand() {
  const barsRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    const bars = barsRef.current;
    if (!bars) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || initRef.current) return;
        initRef.current = true;

        const gauges = bars.querySelectorAll<HTMLElement>(".sgauge");

        gauges.forEach((gauge, i) => {
          const pct = Number(gauge.dataset.pct) || 0;
          const fill = gauge.querySelector<SVGCircleElement>(".sgauge-fill");
          const pctText = gauge.querySelector<HTMLElement>(".sgauge-pct");

          if (!fill || !pctText) return;

          // Stagger animation start
          setTimeout(() => {
            // Animate stroke
            const targetOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
            fill.style.transition =
              "stroke-dashoffset 1.4s cubic-bezier(.23,1,.32,1)";
            fill.style.strokeDashoffset = String(targetOffset);

            // Count up percentage
            const dur = 1400;
            const t0 = performance.now();
            function tick(now: number) {
              const p = Math.min((now - t0) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = Math.round(eased * pct);
              if (pctText) pctText.textContent = `${val}%`;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }, i * 120);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(bars);

    // Cursor
    const gaugeEls = bars.querySelectorAll<HTMLElement>(".sgauge");
    gaugeEls.forEach((g) => {
      if (typeof (window as any).setCursor === "function") {
        (window as any).setCursor(g, "");
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills-band">
      <div className="skills-band-inner">
        <div className="skills-band-left reveal">
          <div className="skills-band-tag">Core Proficiency</div>
          <h2 className="skills-band-title">
            Skills that
            <br />
            <em>ship products</em>
          </h2>
          <p className="skills-band-sub">
            // hover each ring
            <br />
            to see mastery level
          </p>
        </div>

        <div className="skills-band-gauges reveal rd2" id="sbars" ref={barsRef}>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold)" />
                <stop offset="100%" stopColor="var(--gold2)" />
              </linearGradient>
            </defs>
          </svg>

          {skills.map((skill) => {
            const labelParts = skill.label.split("\n");
            return (
              <div className="sgauge" data-pct={skill.pct} key={skill.label}>
                <div className="sgauge-ring">
                  <svg viewBox="0 0 80 80">
                    <circle
                      className="sgauge-track"
                      cx="40"
                      cy="40"
                      r="36"
                    />
                    <circle
                      className="sgauge-fill"
                      cx="40"
                      cy="40"
                      r="36"
                      style={{
                        strokeDasharray: CIRCUMFERENCE,
                        strokeDashoffset: CIRCUMFERENCE,
                        stroke: "url(#gaugeGrad)",
                        fill: "none",
                        strokeLinecap: "round",
                        transform: "rotate(-90deg)",
                        transformOrigin: "center",
                      }}
                    />
                  </svg>
                  <div className="sgauge-center">
                    <span className="sgauge-pct">0%</span>
                  </div>
                </div>
                <div className="sgauge-label">
                  {labelParts.map((part, i) => (
                    <span key={i}>
                      {part}
                      {i < labelParts.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
