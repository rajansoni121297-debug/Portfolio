"use client";

import { useEffect } from "react";

export function Experience() {
  useEffect(() => {
    /* ── Progressive word-by-word reveal ── */
    document.querySelectorAll(".exp-ul li").forEach((li) => {
      const text = li.textContent!.trim();
      li.innerHTML = [...text]
        .map((ch) => {
          if (ch === " ") return '<span class="w" data-space="1"> </span>';
          const safe = ch.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<span class="w">${safe}</span>`;
        })
        .join("");
    });

    document.querySelectorAll(".exp-ul").forEach((ul) => {
      const lis = [...ul.querySelectorAll("li")];
      const allChars = [...ul.querySelectorAll(".w")];
      let rafId: number | null = null;
      let lastIdx = -1;

      function resetChar(ch: Element) { ch.className = "w"; }

      function updateReveal(cx: number, cy: number) {
        let bestIdx = -1, bestDist = Infinity;
        allChars.forEach((ch, i) => {
          const r = ch.getBoundingClientRect();
          const wx = r.left + r.width * 0.5;
          const wy = r.top + r.height * 0.5;
          const dist = Math.hypot(cx - wx, (cy - wy) * 0.45);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        if (bestIdx === lastIdx) return;
        lastIdx = bestIdx;
        allChars.forEach((ch, i) => {
          resetChar(ch);
          if (i < bestIdx) ch.classList.add("lit");
          else if (i === bestIdx) ch.classList.add("cursor-word");
          else ch.classList.add("dim");
        });
        lis.forEach((li) => li.classList.remove("li-active"));
        const cursorCh = allChars[bestIdx];
        if (cursorCh) {
          const parentLi = cursorCh.closest("li");
          if (parentLi) parentLi.classList.add("li-active");
        }
      }

      ul.addEventListener("mousemove", (e) => {
        ul.classList.add("active");
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => updateReveal((e as MouseEvent).clientX, (e as MouseEvent).clientY));
      });

      ul.addEventListener("mouseleave", () => {
        ul.classList.remove("active");
        lastIdx = -1;
        allChars.forEach(resetChar);
        lis.forEach((li) => li.classList.remove("li-active"));
        if (rafId) cancelAnimationFrame(rafId);
      });
    });

    /* ── Cursor ── */
    const setCursor = (window as any).setCursor;
    if (setCursor) {
      document.querySelectorAll(".exp-ul li").forEach((li) => setCursor(li as HTMLElement, ""));
    }
  }, []);

  return (
    <>
      <section id="experience">
        <div className="stag reveal">02 — Experience</div>
        <h2 className="stitle reveal">Where I&apos;ve <em>worked</em></h2>

        {/* ── Job 01 ── */}
        <div className="exp-item reveal">
          <div>
            <div className="exp-period">Dec 2024 — Present</div>
            <div className="exp-idx">01</div>
          </div>
          <div>
            <div className="exp-co">MYCPE One <span style={{fontSize:"13px",fontWeight:400,color:"var(--text-muted)"}}>(formerly Entigrity)</span></div>
            <div className="exp-role">Product Designer</div>
            <ul className="exp-ul">
              <li>Leading end-to-end product design for HRMS, ERP, and AI-driven hiring tools across internal and client-facing platforms.</li>
              <li>Translated complex business requirements into scalable workflows, improving usability across multi-role systems (Admin, Manager, Staff, Candidates).</li>
              <li>Designed role-based experiences that reduced task friction and improved navigation clarity in enterprise dashboards.</li>
              <li>Collaborated with product, engineering, and QA to ensure smooth delivery from concept to implementation.</li>
              <li>Introduced AI-assisted workflows for faster ideation, flow generation, and design iteration.</li>
              <li>Contributed to improved design-to-development handoff with structured documentation and reusable patterns.</li>
            </ul>
          </div>
          <div className="exp-tsig">
            <div className="exp-tsig-idle">
              <span className="exp-tsig-dur" id="exp-dur-01">1 yr 5 mos</span>
              <span className="exp-tsig-unit">At MYCPE One</span>
            </div>
            <div className="exp-tsig-hover">
              <span className="exp-tsig-tag">Impact</span>
              <div className="exp-tsig-metric">
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">Handoff Friction <em>↓30%</em></span>
                  <span className="exp-tsig-lbl">via AI-assisted workflows</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val"><em>5+</em> Enterprise Modules</span>
                  <span className="exp-tsig-lbl">Designed end-to-end</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">Multi-role Systems</span>
                  <span className="exp-tsig-lbl">Admin · Manager · Staff · Candidates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Job 02 ── */}
        <div className="exp-item reveal">
          <div>
            <div className="exp-period">Jul 2023 — Oct 2024</div>
            <div className="exp-idx">02</div>
          </div>
          <div>
            <div className="exp-co">MediaNV</div>
            <div className="exp-role">Product Designer</div>
            <ul className="exp-ul">
              <li>Redesigned a dental SaaS dashboard, increasing user engagement by <strong>25%</strong> through simplified task flows and improved information hierarchy.</li>
              <li>Reduced user errors by <strong>15%</strong> and increased satisfaction by <strong>10%</strong> through usability testing and iterative design improvements.</li>
              <li>Built and scaled a <strong>design system and component library</strong>, improving consistency across products by <strong>30%</strong>.</li>
              <li>Collaborated closely with PMs and developers to align business requirements with user needs.</li>
              <li>Conducted user interviews and translated insights into actionable product improvements.</li>
              <li>Used AI tools to accelerate design exploration and validate interaction patterns early.</li>
            </ul>
          </div>
          <div className="exp-tsig">
            <div className="exp-tsig-idle">
              <span className="exp-tsig-dur">1 yr 4 mos</span>
              <span className="exp-tsig-unit">At MediaNV</span>
            </div>
            <div className="exp-tsig-hover">
              <span className="exp-tsig-tag">Growth</span>
              <div className="exp-tsig-metric">
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">User Engagement <em>↑25%</em></span>
                  <span className="exp-tsig-lbl">Dental SaaS redesign</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">Error Rate <em>↓15%</em></span>
                  <span className="exp-tsig-lbl">via usability testing</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">Consistency <em>↑30%</em></span>
                  <span className="exp-tsig-lbl">Design system &amp; component library</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Job 03 ── */}
        <div className="exp-item reveal">
          <div>
            <div className="exp-period">Sep 2021 — Jun 2023</div>
            <div className="exp-idx">03</div>
          </div>
          <div>
            <div className="exp-co">Rewaa Tech Verge Pvt. Ltd.</div>
            <div className="exp-role">UI/UX &amp; Product Designer</div>
            <ul className="exp-ul">
              <li>Designed web and mobile experiences across multiple domains including PowerApps, BI dashboards, and CMS platforms.</li>
              <li>Created end-to-end UX flows, wireframes, high-fidelity UI, and interactive prototypes for client projects.</li>
              <li>Delivered data-driven dashboards and enterprise tools with a focus on usability and clarity.</li>
              <li>Worked directly with clients and project managers to define requirements and deliver solutions.</li>
              <li>Built reusable UI patterns and improved design consistency across multiple projects.</li>
              <li>Gained strong foundation in system thinking, user journeys, and scalable design practices.</li>
            </ul>
          </div>
          <div className="exp-tsig">
            <div className="exp-tsig-idle">
              <span className="exp-tsig-dur">1 yr 10 mos</span>
              <span className="exp-tsig-unit">At Rewaa Tech</span>
            </div>
            <div className="exp-tsig-hover">
              <span className="exp-tsig-tag">Created</span>
              <div className="exp-tsig-metric">
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val"><em>520+</em> Screens Designed</span>
                  <span className="exp-tsig-lbl">Across web &amp; mobile</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val"><em>42+</em> Projects Delivered</span>
                  <span className="exp-tsig-lbl">Client &amp; internal products</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val"><em>16+</em> Domains Explored</span>
                  <span className="exp-tsig-lbl">Fintech · Health · E-com · Gov</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Job 04 ── */}
        <div className="exp-item reveal">
          <div>
            <div className="exp-period">Jan 2020 — Aug 2021</div>
            <div className="exp-idx">04</div>
          </div>
          <div>
            <div className="exp-co">Freelance</div>
            <div className="exp-role">UI/UX Designer</div>
            <ul className="exp-ul">
              <li>Designed conversion-focused web and mobile interfaces using a responsive, mobile-first approach.</li>
              <li>Conducted user research, heuristic evaluations, and usability testing to drive iterative design improvements.</li>
              <li>Created end-to-end UX artifacts including user flows, journey maps, wireframes, and interactive prototypes.</li>
              <li>Delivered high-fidelity UI, design systems, and reusable component libraries.</li>
              <li>Collaborated directly with clients and developers to ensure pixel-perfect implementation.</li>
              <li>Utilized tools like Figma, Adobe XD, and Photoshop to accelerate the design process.</li>
            </ul>
          </div>
          <div className="exp-tsig">
            <div className="exp-tsig-idle">
              <span className="exp-tsig-dur">1 yr 8 mos</span>
              <span className="exp-tsig-unit">Freelance</span>
            </div>
            <div className="exp-tsig-hover">
              <span className="exp-tsig-tag">Explore</span>
              <div className="exp-tsig-metric">
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val"><em>10+</em> Clients</span>
                  <span className="exp-tsig-lbl">Global collaboration</span>
                </div>
                <div className="exp-tsig-divider"></div>
                <div className="exp-tsig-row">
                  <span className="exp-tsig-val">Startups</span>
                  <span className="exp-tsig-lbl">Diverse industries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
