"use client";

import { useEffect } from "react";

export function Projects() {
  useEffect(() => {
    /* ── 3D TILT (project cards) ── */
    const grid = document.querySelector(".proj-grid") as HTMLElement;
    if (!grid) return;

    let activeCard: HTMLElement | null = null;

    function resetCard(card: HTMLElement | null) {
      if (!card) return;
      card.style.transition =
        "transform .5s cubic-bezier(.23,1,.32,1), box-shadow .4s";
      card.style.transform =
        "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
    }

    const onMouseMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest(".pcard") as HTMLElement;
      if (
        !card ||
        card.classList.contains("pcard-behance")
      )
        return;
      if (activeCard && activeCard !== card) resetCard(activeCard);
      activeCard = card;
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      card.style.transition = "transform .1s ease, box-shadow .4s";
      card.style.transform = `perspective(900px) rotateY(${dx * 10}deg) rotateX(${-dy * 8}deg) translateY(-4px)`;
    };

    const onMouseLeave = () => {
      resetCard(activeCard);
      activeCard = null;
    };

    grid.addEventListener("mousemove", onMouseMove);
    grid.addEventListener("mouseleave", onMouseLeave);

    document.querySelectorAll(".pcard").forEach((c) => {
      c.addEventListener("mouseleave", () => resetCard(c as HTMLElement));
    });

    /* ── Explore cursor ── */
    const setCursor = (window as any).setCursor;
    const setExploreCursor = (window as any).setExploreCursor;

    if (setExploreCursor) {
      document
        .querySelectorAll(".pcard:not(.pcard-behance):not(.pcard-wide)")
        .forEach((c) => setExploreCursor(c as HTMLElement, "Explore \u2197"));
      document
        .querySelectorAll(".pcard-wide:not(.pcard-behance)")
        .forEach((c) => setExploreCursor(c as HTMLElement, "Case Study \u2197"));
    }

    if (setCursor) {
      document
        .querySelectorAll(".pcard-behance")
        .forEach((c) => setCursor(c as HTMLElement, "Behance \u2192"));
    }

    return () => {
      grid.removeEventListener("mousemove", onMouseMove);
      grid.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <>
      <hr className="hr-gold" />

      <section id="projects">
        <div className="stag reveal">03 — Key Projects</div>
        <h2 className="stitle reveal">
          Selected <em>work</em>
        </h2>
        <div className="proj-grid">
          {/* 01 — Wide featured card */}
          <div className="pcard pcard-wide reveal">
            <div>
              <div className="ptag">HRMS Platform</div>
              <div
                className="pnum"
                style={{
                  position: "relative" as const,
                  top: "auto",
                  right: "auto",
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                01
              </div>
              <h3 className="ptitle ptitle-lg">HRMS 24x7 | Client Hub</h3>
              <p className="pdesc">
                Full-scale HRMS for US enterprise clients covering the complete
                employee lifecycle: hiring, attendance, performance, billing,
                compliance, and reporting across multiple portals.
              </p>
              <div className="pout">
                Scalable solution enabling centralized resource tracking, reduced
                manual effort, and improved transparency.
              </div>
            </div>
            <div className="pmock">
              <div className="mbar g"></div>
              <div className="mbar s"></div>
              <div className="mgrid">
                <div className="mc"></div>
                <div className="mc"></div>
                <div className="mc"></div>
                <div className="mc"></div>
                <div className="mc"></div>
                <div className="mc"></div>
              </div>
              <div className="mbar m"></div>
              <div className="mbar s"></div>
            </div>
          </div>

          {/* 02 — Dental SaaS (tall) */}
          <div className="pcard pcard-tall pcard-accent reveal">
            <div className="pnum">02</div>
            <span className="pmock-icon">{"\uD83E\uDDB7"}</span>
            <div className="ptag">Healthcare SaaS</div>
            <h3 className="ptitle">
              Healthcare SaaS Platform
              <br />
              <span style={{ fontSize: "18px", opacity: 0.7 }}>
                (Dental Management)
              </span>
            </h3>
            <p className="pdesc">
              Comprehensive SaaS platform for dental practices covering
              appointments, patient communication, reviews, payments, and
              analytics across Customer and Admin portals.
            </p>
            <ul className="pbullets">
              <li>
                Designed end-to-end workflows for both{" "}
                <strong>patients and clinic administrators</strong>
              </li>
              <li>
                Built key modules including appointments, communication, reviews,
                and payments
              </li>
              <li>
                Simplified complex operational flows into{" "}
                <strong>clear, task-driven user journeys</strong>
              </li>
              <li>
                Improved usability through better{" "}
                <strong>
                  information hierarchy and interaction patterns
                </strong>
              </li>
            </ul>
            <div className="pout">
              Improved conversion by 25% through streamlined workflows and
              enhanced usability.
            </div>
            <div className="pmock-wireframe">
              <div className="pwf-row">
                <div className="pwf-dot"></div>
                <div className="pwf-bar" style={{ width: "60%" }}></div>
              </div>
              <div className="pwf-row">
                <div className="pwf-dot"></div>
                <div className="pwf-bar" style={{ width: "85%" }}></div>
              </div>
              <div className="pwf-row">
                <div className="pwf-dot"></div>
                <div className="pwf-bar" style={{ width: "45%" }}></div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    height: "28px",
                    background: "var(--gold)",
                    borderRadius: "2px",
                    opacity: 0.3,
                  }}
                ></div>
                <div
                  style={{
                    height: "28px",
                    background: "var(--gold)",
                    borderRadius: "2px",
                    opacity: 0.15,
                  }}
                ></div>
                <div
                  style={{
                    height: "28px",
                    background: "var(--gold)",
                    borderRadius: "2px",
                    opacity: 0.2,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 03 — AI Hiring */}
          <div className="pcard reveal">
            <div className="pnum">03</div>
            <span className="pmock-icon">{"\uD83E\uDD16"}</span>
            <div className="ptag">AI Hiring</div>
            <h3 className="ptitle">
              AI-Driven JD Generator &amp; Assessment
            </h3>
            <p className="pdesc">
              AI-powered hiring system enabling teams to generate job
              descriptions and evaluate candidates through structured video
              assessments and automated insights.
            </p>
            <div className="pout">
              Standardized evaluation and significantly reduced manual effort in
              JD creation.
            </div>
          </div>

          {/* 04 — Assessment */}
          <div className="pcard reveal rd1">
            <div className="pnum">04</div>
            <span className="pmock-icon">{"\uD83D\uDCCB"}</span>
            <div className="ptag">Assessment Platform</div>
            <h3 className="ptitle">
              MY CPE Assessment | Standalone &amp; Team
            </h3>
            <p className="pdesc">
              Structured assessment platform supporting external hiring and
              internal evaluations with configurable workflows and AI-assisted
              design iterations.
            </p>
            <div className="pout">
              Faster, data-driven hiring decisions with improved consistency.
            </div>
          </div>

          {/* 05 — E-commerce Dashboard */}
          <div className="pcard pcard-accent reveal">
            <div className="pnum">05</div>
            <span className="pmock-icon">{"\uD83D\uDCCA"}</span>
            <div className="ptag">E-Commerce</div>
            <h3 className="ptitle">
              E-Commerce Dashboard
              <br />
              <span style={{ fontSize: "18px", opacity: 0.7 }}>
                Lead &amp; Sales Management
              </span>
            </h3>
            <p className="pdesc">
              Operations dashboard to manage leads, track performance, and
              simplify workflows for a non-tech-savvy user base.
            </p>
            <div className="pout">
              Improved engagement through simplified navigation and accessible
              design.
            </div>
          </div>

          {/* 06 — Patient Monitoring */}
          <div className="pcard reveal rd1">
            <div className="pnum">06</div>
            <span className="pmock-icon">{"\uD83C\uDFE5"}</span>
            <div className="ptag">Healthcare</div>
            <h3 className="ptitle">
              Patient Monitoring &amp; Management System
            </h3>
            <p className="pdesc">
              Healthcare platform for managing patient records, doctor
              interactions, and treatment workflows across multiple user roles.
            </p>
            <div className="pout">
              Increased efficiency and user satisfaction through intuitive and
              structured interfaces.
            </div>
          </div>

          {/* 07 — Election */}
          <div className="pcard reveal">
            <div className="pnum">07</div>
            <span className="pmock-icon">{"\uD83D\uDDF3\uFE0F"}</span>
            <div className="ptag">GovTech</div>
            <h3 className="ptitle">Election Management Dashboard</h3>
            <p className="pdesc">
              Centralized platform to manage election activities including
              coordination, communication, and operational tracking.
            </p>
            <div className="pout">
              Streamlined complex processes and improved organizational
              efficiency.
            </div>
          </div>

          {/* 08 — Food Delivery */}
          <div className="pcard pcard-accent reveal rd1">
            <div className="pnum">08</div>
            <span className="pmock-icon">{"\uD83C\uDF54"}</span>
            <div className="ptag">Food Tech</div>
            <h3 className="ptitle">
              Food Delivery System
              <br />
              <span style={{ fontSize: "18px", opacity: 0.7 }}>
                Mobile, Web &amp; Admin
              </span>
            </h3>
            <p className="pdesc">
              End-to-end food delivery ecosystem covering ordering, delivery
              operations, and admin management across multiple platforms.
            </p>
            <ul className="pbullets">
              <li>
                Designed complete user flows for{" "}
                <strong>
                  ordering, delivery tracking, and admin operations
                </strong>
              </li>
              <li>
                Ensured consistency across{" "}
                <strong>mobile, web, and admin platforms</strong>
              </li>
              <li>
                Structured backend workflows for{" "}
                <strong>
                  order management, restaurant handling, and delivery
                  coordination
                </strong>
              </li>
              <li>
                Collaborated with developers to ensure accurate implementation
                and scalability
              </li>
            </ul>
            <div className="pout">
              Enhanced operational efficiency and delivered a consistent
              multi-platform user experience.
            </div>
          </div>

          {/* Behance CTA — dark two-panel */}
          <div className="pcard pcard-behance reveal">
            <div className="pbeh-left">
              <div className="pbeh-eyebrow">
                {"There\u2019s more where that came from"}
              </div>
              <h3 className="pbeh-title">
                This website has a <em>scroll limit.</em>
                <br />
                Behance does not.
              </h3>
              <p className="pbeh-sub">
                We tried fitting all <strong>46+ projects</strong> here. The
                website said no, and honestly — fair point. Nobody wants to
                scroll forever. So the full collection lives on Behance, where it
                can breathe. Fair warning: it{"'"}s a rabbit hole.
              </p>
            </div>
            <div className="pbeh-right">
              <div className="pbeh-count">
                <span className="pbeh-count-num">46+</span>
                <div className="pbeh-count-label">Projects on Behance</div>
              </div>
              <div className="pbeh-btn-wrap">
                <a
                  href="https://www.behance.net/"
                  target="_blank"
                  rel="noopener"
                  className="pbeh-btn"
                >
                  <span>View Full Portfolio</span>
                  <span className="pbeh-btn-arrow">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>
              <span className="pbeh-hint">
                {"// opens in a new tab \u00B7 no FOMO involved"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
