"use client";

import { useEffect } from "react";

export function Contact() {
  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;

    document
      .querySelectorAll(".cta-primary")
      .forEach((c) => setCursor(c as HTMLElement, "Let\u2019s go \u2709"));
    document
      .querySelectorAll(".cta-secondary")
      .forEach((c) => setCursor(c as HTMLElement, "Open \u2197"));
    document
      .querySelectorAll(".cinfo")
      .forEach((c) => setCursor(c as HTMLElement, ""));
  }, []);

  return (
    <>
      <hr className="hr-gold" />

      <section id="contact">
        <div className="contact-bg-lines"></div>
        <div className="contact-glow"></div>

        <div className="contact-inner">
          {/* LEFT: Headline + tagline */}
          <div className="contact-left reveal">
            <div className="cpre">{"05 \u2014 Let\u2019s build something"}</div>
            <h2 className="ctitle">
              Start a
              <br />
              <em>conversation</em>
            </h2>
            <p className="contact-tagline">
              {"Whether it\u2019s a "}
              <strong>product redesign</strong>
              {", a "}
              <strong>new SaaS platform</strong>
              {", or a "}
              <strong>design system from scratch</strong>
              {" \u2014 I bring both the thinking and the execution."}
              <br />
              <br />
              Currently open to senior product design roles and select freelance
              collaborations.
            </p>
          </div>

          {/* RIGHT: Actions + info */}
          <div className="contact-right reveal rd2">
            {/* Email block */}
            <div className="cemail-wrap">
              <div className="cemail-label">Drop a line</div>
              <a
                href="mailto:rajdeepdey.6359@gmail.com"
                className="cemail"
              >
                rajdeepdey.6359@gmail.com
              </a>
            </div>

            {/* CTAs */}
            <div className="contact-ctas">
              {/* Primary CTA */}
              <a
                href="mailto:rajdeepdey.6359@gmail.com"
                className="cta-primary"
              >
                <div className="cta-primary-inner">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {"Let\u2019s Work Together"}
                </div>
                <div className="cta-primary-arrow">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Resume / Design DNA CTA */}
              <a
                href="#"
                className="cta-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  if ((window as any).toast) {
                    (window as any).toast(
                      "// Design DNA PDF coming soon \u2726"
                    );
                  }
                }}
              >
                <div className="cta-secondary-inner">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Download Design DNA
                </div>
                <span className="cta-badge">{"PDF \u00B7 Resume"}</span>
              </a>
            </div>

            {/* Quick info grid */}
            <div className="contact-info-grid">
              <div className="cinfo">
                <div className="cinfo-label">Location</div>
                <div className="cinfo-val">{"Ahmedabad, Gujarat \uD83C\uDDEE\uD83C\uDDF3"}</div>
              </div>
              <div className="cinfo">
                <div className="cinfo-label">Timezone</div>
                <div className="cinfo-val">{"IST \u00B7 GMT+5:30"}</div>
              </div>
              <div className="cinfo">
                <div className="cinfo-label">Phone</div>
                <div className="cinfo-val">+91 635 959 3154</div>
              </div>
              <div className="cinfo">
                <div className="cinfo-label">Response time</div>
                <div className="cinfo-val">Usually within 24h</div>
              </div>
            </div>

            {/* Social */}
            <div className="social-row">
              <a
                href="https://linkedin.com/in/6359raj"
                className="soc-link"
                target="_blank"
              >
                LinkedIn
              </a>
              <a
                href="https://behance.net/raj_uiux"
                className="soc-link"
                target="_blank"
              >
                Behance
              </a>
              <a
                href="https://dribbble.com/raj_uiux_"
                className="soc-link"
                target="_blank"
              >
                Dribbble
              </a>
              <a
                href="https://bento.me/rajuiux"
                className="soc-link"
                target="_blank"
              >
                Bento
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
