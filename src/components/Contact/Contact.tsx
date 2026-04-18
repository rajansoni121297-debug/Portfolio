"use client";

import { useEffect, useState } from "react";

export function Contact() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;
    document.querySelectorAll(".cta-primary").forEach((c) => setCursor(c as HTMLElement, "Let\u2019s go \u2709"));
    document.querySelectorAll(".cta-secondary").forEach((c) => setCursor(c as HTMLElement, "Open \u2197"));
    document.querySelectorAll(".cinfo").forEach((c) => setCursor(c as HTMLElement, ""));
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!formOpen) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setFormOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [formOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("sent");
        setFormData({ name: "", email: "", subject: "", message: "" });
        if ((window as any).toast) {
          (window as any).toast("// Message sent! Raj will get back to you soon \u2713");
        }
        setTimeout(() => {
          setStatus("idle");
          setFormOpen(false);
        }, 2500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <hr className="hr-gold" />

      <section id="contact">
        <div className="contact-bg-lines"></div>
        <div className="contact-glow"></div>

        <div className="contact-inner">
          {/* LEFT */}
          <div className="contact-left reveal">
            <div className="cpre">05 &mdash; Let&apos;s build something</div>
            <h2 className="ctitle">Start a<br /><em>conversation</em></h2>
            <p className="contact-tagline">
              Whether it&apos;s a <strong>product redesign</strong>, a <strong>new SaaS platform</strong>, or a <strong>design system from scratch</strong> &mdash; I bring both the thinking and the execution.<br /><br />
              Currently open to senior product design roles and select freelance collaborations.
            </p>
          </div>

          {/* RIGHT */}
          <div className="contact-right reveal rd2">
            {/* Email */}
            <div className="cemail-wrap">
              <div className="cemail-label">Drop a line</div>
              <a href="mailto:rajdeepdey.6359@gmail.com" className="cemail">rajdeepdey.6359@gmail.com</a>
            </div>

            {/* CTAs */}
            <div className="contact-ctas">
              <button className="cta-primary" onClick={() => setFormOpen(true)} type="button">
                <div className="cta-primary-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Let&apos;s Work Together
                </div>
                <div className="cta-primary-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <a href="#" className="cta-secondary" onClick={(e) => {
                e.preventDefault();
                if ((window as any).toast) (window as any).toast("// Design DNA PDF coming soon \u2726");
              }}>
                <div className="cta-secondary-inner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Download Design DNA
                </div>
                <span className="cta-badge">PDF &middot; Resume</span>
              </a>
            </div>

            {/* Info grid */}
            <div className="contact-info-grid">
              <div className="cinfo"><div className="cinfo-label">Location</div><div className="cinfo-val">Ahmedabad, Gujarat &#127470;&#127475;</div></div>
              <div className="cinfo"><div className="cinfo-label">Timezone</div><div className="cinfo-val">IST &middot; GMT+5:30</div></div>
              <div className="cinfo"><div className="cinfo-label">Phone</div><div className="cinfo-val">+91 635 959 3154</div></div>
              <div className="cinfo"><div className="cinfo-label">Response time</div><div className="cinfo-val">Usually within 24h</div></div>
            </div>

            {/* Social */}
            <div className="social-row">
              <a href="https://linkedin.com/in/6359raj" className="soc-link" target="_blank">LinkedIn</a>
              <a href="https://www.behance.net/raj_ui-ux" className="soc-link" target="_blank">Behance</a>
              <a href="https://dribbble.com/raj_uiux_" className="soc-link" target="_blank">Dribbble</a>
              <a href="https://www.instagram.com/raj_uiux_/" className="soc-link" target="_blank">Instagram</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT FORM MODAL ══ */}
      {formOpen && (
        <div className="cform-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="cform-modal">
            <button className="cform-close" onClick={() => setFormOpen(false)}>&times;</button>

            <div className="cform-header">
              <div className="cform-tag">
                <span className="cform-tag-line" />
                let&apos;s connect
              </div>
              <h3 className="cform-title">Send a message</h3>
              <p className="cform-sub">Fill in the details and Raj will get back to you within 24 hours.</p>
            </div>

            <form className="cform" onSubmit={handleSubmit}>
              <div className="cform-row">
                <div className="cform-field">
                  <label className="cform-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="cform-input"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="cform-field">
                  <label className="cform-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="cform-input"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="cform-field">
                <label className="cform-label">Subject</label>
                <select name="subject" className="cform-input cform-select" value={formData.subject} onChange={handleChange}>
                  <option value="">Select a topic</option>
                  <option value="Full-time Opportunity">Full-time Opportunity</option>
                  <option value="Freelance Project">Freelance Project</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Just Saying Hi">Just Saying Hi</option>
                </select>
              </div>

              <div className="cform-field">
                <label className="cform-label">Message *</label>
                <textarea
                  name="message"
                  className="cform-input cform-textarea"
                  placeholder="Tell me about your project, role, or just say hi..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="cform-submit"
                disabled={status === "sending" || status === "sent"}
              >
                {status === "sending" && "Sending\u2026"}
                {status === "sent" && "Sent! \u2713"}
                {status === "error" && "Try Again"}
                {status === "idle" && (
                  <>
                    Send Message
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="cform-error">Something went wrong. You can also email directly at rajdeepdey.6359@gmail.com</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
