"use client";

import { useEffect } from "react";

const stats = [
  { num: "50+", label: "Students Mentored" },
  { num: "30+", label: "Placed in Jobs" },
  { num: "100+", label: "Sessions Conducted" },
];

const highlights = [
  {
    icon: "🎯",
    title: "Portfolio & Resume Reviews",
    desc: "Helping aspiring designers build portfolios that actually land interviews — with real feedback, not templates.",
  },
  {
    icon: "🧭",
    title: "Career Guidance",
    desc: "1-on-1 sessions to navigate the UI/UX job market — from internships to senior product roles.",
  },
  {
    icon: "🛠️",
    title: "Hands-On Workshops",
    desc: "Teaching practical skills: Figma workflows, design systems, user research methods, and real-world project walkthroughs.",
  },
  {
    icon: "🚀",
    title: "Job Placement Support",
    desc: "Guiding students through interviews, design challenges, and salary negotiations — until they get the offer.",
  },
];

export function Mentorship() {
  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;
    document.querySelectorAll(".mentor-card").forEach((c) => {
      setCursor(c as HTMLElement, "");
    });
  }, []);

  return (
    <section id="mentorship" className="mentor-section">
      <div className="mentor-inner">
        {/* Header */}
        <div className="mentor-header reveal">
          <div className="stag">05 — Giving Back</div>
          <h2 className="stitle" style={{ marginBottom: "20px" }}>
            Teaching what I <em>practice</em>
          </h2>
          <p className="mentor-intro">
            Beyond building products, I actively teach and mentor aspiring
            UI/UX designers — helping them build skills, confidence, and
            careers. Several of my students are now working at product
            companies across India.
          </p>
        </div>

        {/* Stats */}
        <div className="mentor-stats reveal rd1">
          {stats.map((s) => (
            <div className="mentor-stat" key={s.label}>
              <div className="mentor-stat-num">{s.num}</div>
              <div className="mentor-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="mentor-grid">
          {highlights.map((h, i) => (
            <div
              className={`mentor-card reveal ${i > 0 ? `rd${Math.min(i, 3)}` : ""}`}
              key={h.title}
            >
              <span className="mentor-card-icon">{h.icon}</span>
              <h4 className="mentor-card-title">{h.title}</h4>
              <p className="mentor-card-desc">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mentor-quote reveal rd2">
          <blockquote>
            &ldquo;The best way to solidify what you know is to teach it.
            Every student I mentor makes me a better designer too.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
