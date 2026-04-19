"use client";

import { useEffect, useRef, useState } from "react";

const quotes = [
  "Every design decision should be traceable to a user need or a business metric \u2014 if it isn't, it's decoration.",
  "Great UI isn't just about moving pixels; it's about removing friction. A seamless experience speaks louder than a striking aesthetic.",
  "Users don't read interfaces, they scan them. A successful design respects their time and guides their intuition.",
  "A design system is a living product. Without consistency, you scale chaos. With governance, you scale speed.",
  "The best interfaces are invisible. When the user forgets they are using software and simply achieves their goal, the design has succeeded."
];

const orbs = [
  { name: "Product Design", on: true },
  { name: "UI/UX", on: false },
  { name: "BRD & Docs", on: false },
  { name: "User Journeys", on: false },
  { name: "Design Systems", on: false },
  { name: "Vibe Coding", on: true },
  { name: "AI Workflows", on: true },
  { name: "Stakeholder Mgmt", on: false },
  { name: "Sprint Planning", on: false },
  { name: "UAT & QA", on: false },
  { name: "Usability Testing", on: false },
  { name: "Dev Handoff", on: false },
];

export function About() {
  const orbsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    setMounted(true);
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    const container = orbsRef.current;
    if (!container) return;

    const chips = container.querySelectorAll<HTMLElement>(".skill-orb");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const isOn = chip.classList.toggle("on");
        const name = chip.textContent?.trim() || "";
        if (typeof (window as any).toast === "function") {
          (window as any).toast(
            isOn ? `\u2713 ${name} selected` : `${name} removed`
          );
        }
      });

      if (typeof (window as any).setCursor === "function") {
        (window as any).setCursor(chip, "");
      }
    });
  }, []);

  return (
    <section id="about">
      <div className="stag reveal">01 &mdash; About Me</div>
      <div className="about-grid">
        <div className="about-text reveal">
          <h2
            className="stitle"
            style={{ fontSize: "clamp(36px,4vw,56px)", marginBottom: "36px" }}
          >
            Design that <em>thinks</em>
          </h2>
          <p>
            I&rsquo;m a UI/UX and Product Designer with{" "}
            <strong>6 years 3 months</strong> of hands-on experience turning
            ambiguous business goals into polished, measurable digital products.
            My career spans fintech dashboards, e-commerce platforms, SaaS tools,
            and AI-native interfaces &mdash; every project grounded in user
            research, rapid prototyping, and close engineering collaboration.
          </p>
          <p>
            I own the full cycle: discovery workshops, user-journey mapping,
            information architecture, wireframes, high-fidelity UI, interaction
            specs, design-system governance, and post-launch analytics review. I
            treat every handoff as a conversation, not a PDF.
          </p>
          <p>
            What sets me apart is my comfort at the intersection of design and
            code. I prototype in Figma <em>and</em> in React; I use AI
            workflows (Claude, Cursor, v0) to compress timelines without
            sacrificing craft; and I speak fluent developer so nothing gets lost
            in translation.
          </p>
        </div>
        <div className="reveal rd2">
          <div className="about-quote">
            {mounted ? (
              <p>&ldquo;{currentQuote}&rdquo;</p>
            ) : (
              <p>&ldquo;{quotes[0]}&rdquo;</p>
            )}
          </div>
          <p className="orbs-hint">// tap to highlight your interests</p>
          <div className="skill-orbs" ref={orbsRef}>
            {orbs.map((orb) => (
              <span
                key={orb.name}
                className={`skill-orb${orb.on ? " on" : ""}`}
              >
                {orb.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
