"use client";

import { useEffect, useState, useCallback } from "react";

interface Certificate {
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

const certificates: Certificate[] = [
  {
    title: "Google UX Design Professional Certificate",
    issuer: "Google · Coursera",
    date: "2023",
    link: "#",
  },
  {
    title: "Interaction Design Specialization",
    issuer: "UC San Diego · Coursera",
    date: "2022",
    link: "#",
  },
];

const video = {
  title: "Design Thinking Workshop",
  subtitle: "A quick session on my design process",
  youtubeId: "-F-HnG7Ooxs",
  thumbnail: "", // Will use YouTube thumbnail
};

export function Credentials() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modalOpen, closeModal]);

  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;
    document.querySelectorAll(".cred-card").forEach((c) => {
      setCursor(c as HTMLElement, "");
    });
    const vidCard = document.querySelector(".cred-video");
    if (vidCard) setCursor(vidCard as HTMLElement, "Play ▶");
  }, []);

  const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <>
      <section id="credentials" className="cred-section">
        <div className="cred-inner">
          {/* Header */}
          <div className="cred-header reveal">
            <div className="cred-tag">
              <span className="cred-tag-line" />
              Also explored
            </div>
            <p className="cred-sub">
              A couple of certifications and a quick session clip
            </p>
          </div>

          {/* Grid */}
          <div className="cred-grid">
            {/* Certificate cards */}
            {certificates.map((cert, i) => (
              <a
                key={cert.title}
                href={cert.link || "#"}
                className={`cred-card reveal ${i > 0 ? "rd1" : ""}`}
                target={cert.link && cert.link !== "#" ? "_blank" : undefined}
                rel="noopener"
                onClick={(e) => {
                  if (!cert.link || cert.link === "#") {
                    e.preventDefault();
                    if ((window as any).toast) {
                      (window as any).toast("// Certificate link coming soon");
                    }
                  }
                }}
              >
                <div className="cred-card-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 15l-2 5l2-1l2 1l-2-5z" />
                    <circle cx="12" cy="9" r="6" />
                    <path d="M9 9h.01M15 9h.01" />
                  </svg>
                </div>
                <div className="cred-card-content">
                  <h4 className="cred-card-title">{cert.title}</h4>
                  <div className="cred-card-issuer">{cert.issuer}</div>
                  <div className="cred-card-date">{cert.date}</div>
                </div>
                <div className="cred-card-view">View &nearr;</div>
              </a>
            ))}

            {/* YouTube video card */}
            <div
              className="cred-video reveal rd2"
              onClick={openModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openModal();
              }}
            >
              <div className="cred-video-thumb">
                <img
                  src={thumbUrl}
                  alt={video.title}
                  loading="lazy"
                />
                <div className="cred-video-overlay" />
                <div className="cred-play-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--bg)" stroke="none">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </div>
              </div>
              <div className="cred-video-info">
                <h4 className="cred-video-title">{video.title}</h4>
                <p className="cred-video-sub">{video.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {modalOpen && (
        <div className="cred-modal" onClick={closeModal}>
          <div
            className="cred-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="cred-modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="cred-modal-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
