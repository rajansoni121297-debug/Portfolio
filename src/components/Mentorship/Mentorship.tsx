"use client";

import { useEffect } from "react";

const stats = [
  { num: "30+", label: "Students Mentored" },
  { num: "20+", label: "Placed in Jobs" },
  { num: "16+", label: "Sessions Conducted" },
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

        {/* Seminars / Certifications */}
        <div className="mentor-cert reveal rd2" style={{ marginTop: "48px", padding: "32px", background: "var(--card-bg)", borderRadius: "var(--rad)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "500" }}>Guest Speaker</div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: "600", color: "var(--text)" }}>Pixel Perfect – UI/UX Workshop with Figma</h4>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>Conducted a hands-on seminar sharing practical insights, workflows, and deep UI/UX knowledge for the Rotaract Club of Delhi Midtown Maitreyi.</p>
          </div>
          <a href="https://drive.google.com/file/d/1oCbP3-rNaLZ0Npbijp4A7P4-ZAmnlO_n/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="nav-cta" style={{ flexShrink: 0, textDecoration: "none" }}>
             <span>View Certificate ↗</span>
          </a>
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
