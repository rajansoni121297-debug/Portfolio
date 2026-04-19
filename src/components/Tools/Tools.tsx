"use client";

import { useEffect } from "react";

export function Tools() {
  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;

    document
      .querySelectorAll(".tcard")
      .forEach((c) => setCursor(c as HTMLElement, ""));
    document
      .querySelectorAll(".tcat-item")
      .forEach((c) => setCursor(c as HTMLElement, ""));
  }, []);

  return (
    <>
      <hr className="hr-gold" />

      <section id="tools" style={{ paddingBottom: "40px" }}>
        <div className="stag reveal">04 — Skills &amp; Tools</div>
        <h2 className="stitle reveal">
          My <em>toolkit</em>
        </h2>
        <div className="tool-rack reveal">
          <div className="tcard">
            <span className="tcard-icon">{"\uD83C\uDFA8"}</span>
            <div className="tcard-name">Figma</div>
            <div className="tcard-type">{"Design \u00B7 Prototype"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83E\uDD16"}</span>
            <div className="tcard-name">Figma AI</div>
            <div className="tcard-type">{"AI \u00B7 Generative"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\u26A1"}</span>
            <div className="tcard-name">Vibe Coding</div>
            <div className="tcard-type">{"Build \u00B7 Ship"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83E\uDDE0"}</span>
            <div className="tcard-name">Google AI Studio</div>
            <div className="tcard-type">{"AI \u00B7 Research"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83D\uDCD0"}</span>
            <div className="tcard-name">Adobe XD</div>
            <div className="tcard-type">{"Design \u00B7 UI"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83D\uDDFA\uFE0F"}</span>
            <div className="tcard-name">Miro</div>
            <div className="tcard-type">{"Whiteboard \u00B7 Flow"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83D\uDCCB"}</span>
            <div className="tcard-name">Jira</div>
            <div className="tcard-type">{"Agile \u00B7 Delivery"}</div>
            <div className="tcard-bar"></div>
          </div>
          <div className="tcard">
            <span className="tcard-icon">{"\uD83D\uDE80"}</span>
            <div className="tcard-name">Figma Make</div>
            <div className="tcard-type">{"Build \u00B7 Publish"}</div>
            <div className="tcard-bar"></div>
          </div>
        </div>
      </section>
      <div className="tgrid reveal">
        <div className="tcat">
          <div className="tcat-label">Design Tools &amp; Tech</div>
          <div className="tcat-item">Figma</div>
          <div className="tcat-item">Miro</div>
          <div className="tcat-item">Frontend Fundamentals</div>
          <div className="tcat-item">WCAG Accessibility</div>
          <div className="tcat-item">Responsive Design</div>
          <div className="tcat-item">Component Libraries</div>
        </div>
        <div className="tcat">
          <div className="tcat-label">AI &amp; Emerging</div>
          <div className="tcat-item">Figma AI</div>
          <div className="tcat-item">Google AI Studio</div>
          <div className="tcat-item">ChatGPT / Claude</div>
          <div className="tcat-item">AI-Assisted Workflows</div>
          <div className="tcat-item">AI UX Research</div>
          <div className="tcat-item">Vibe Coding</div>
        </div>
        <div className="tcat">
          <div className="tcat-label">Core Competencies</div>
          <div className="tcat-item">Product &amp; UI/UX Design</div>
          <div className="tcat-item">Design Systems</div>
          <div className="tcat-item">Information Architecture</div>
          <div className="tcat-item">Wireframe &amp; Prototyping</div>
          <div className="tcat-item">User Research</div>
          <div className="tcat-item">Usability Testing</div>
        </div>
        <div className="tcat">
          <div className="tcat-label">Workflow &amp; Delivery</div>
          <div className="tcat-item">Agile / Scrum</div>
          <div className="tcat-item">Developer Handoff</div>
          <div className="tcat-item">Jira</div>
          <div className="tcat-item">Slack &amp; Teams</div>
          <div className="tcat-item">Design Documentation</div>
          <div className="tcat-item">PRD &amp; BRD Analysis</div>
        </div>
      </div>
      <div style={{ height: "80px", background: "var(--bg)" }}></div>
    </>
  );
}
