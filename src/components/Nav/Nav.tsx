"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

declare global {
  interface Window {
    setCursor?: (el: Element, label: string) => void;
    toast?: (msg: string) => void;
  }
}

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#tools", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const { showDarkModePopup } = useTheme();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    /* ── 1. Nav background on scroll ── */
    const onScroll = () => {
      if (window.scrollY > 80) {
        nav.style.background = "rgba(12,12,10,.97)";
        nav.style.borderBottom = "1px solid var(--border)";
      } else {
        nav.style.background =
          "linear-gradient(to bottom,rgba(12,12,10,.95),transparent)";
        nav.style.borderBottom = "none";
      }

      /* ── 3. Active section tracking ── */
      const allLinks = nav.querySelectorAll<HTMLAnchorElement>(
        ".nav-links a[href^='#']"
      );
      const scrollPos = window.scrollY + 120;

      let activeLink: HTMLAnchorElement | null = null;
      allLinks.forEach((link) => {
        const id = link.getAttribute("href")!;
        if (id === "#") return;
        const section = document.querySelector<HTMLElement>(id);
        if (section && scrollPos >= section.offsetTop) {
          activeLink = link;
        }
      });

      allLinks.forEach((l) => l.classList.remove("nav-active"));
      if (activeLink)
        (activeLink as HTMLAnchorElement).classList.add("nav-active");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── 2. Smooth scroll ── */
    const logo = nav.querySelector<HTMLAnchorElement>(".nav-logo");
    const handleLogoClick = (e: Event) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    logo?.addEventListener("click", handleLogoClick);

    const navLinks = nav.querySelectorAll<HTMLAnchorElement>(
      ".nav-links a[href^='#']"
    );
    const handleLinkClick = function (this: HTMLAnchorElement, e: Event) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      const target = document.querySelector<HTMLElement>(href);
      if (target) {
        const navHeight = nav.offsetHeight;
        window.scrollTo({
          top: target.offsetTop - navHeight - 8,
          behavior: "smooth",
        });
      }
    };
    navLinks.forEach((l) => l.addEventListener("click", handleLinkClick));

    /* ── 4. Magnetic effect ── */
    const cta = nav.querySelector<HTMLAnchorElement>(".nav-cta");
    const handleCtaMove = (e: MouseEvent) => {
      if (!cta) return;
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cta.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
    };
    const handleCtaLeave = () => {
      if (cta) cta.style.transform = "";
    };
    cta?.addEventListener("mousemove", handleCtaMove);
    cta?.addEventListener("mouseleave", handleCtaLeave);

    const navLinkItems = nav.querySelectorAll<HTMLElement>(".nav-links li");
    const linkMoveHandlers: Array<(e: MouseEvent) => void> = [];
    const linkLeaveHandlers: Array<() => void> = [];
    navLinkItems.forEach((li, i) => {
      const moveHandler = (e: MouseEvent) => {
        const rect = li.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        li.style.transform = `translate(${x * 0.12}px, ${y * 0.15}px)`;
      };
      const leaveHandler = () => {
        li.style.transform = "";
      };
      linkMoveHandlers[i] = moveHandler;
      linkLeaveHandlers[i] = leaveHandler;
      li.addEventListener("mousemove", moveHandler);
      li.addEventListener("mouseleave", leaveHandler);
    });

    /* ── 6. Cursor labels ── */
    if (window.setCursor) {
      if (cta) window.setCursor(cta, "Hire me");
      const toggle = nav.querySelector<HTMLElement>(".theme-toggle");
      if (toggle) window.setCursor(toggle, "");
      navLinks.forEach((l) => {
        if (window.setCursor) window.setCursor(l, "");
      });
    }

    /* cleanup */
    return () => {
      window.removeEventListener("scroll", onScroll);
      logo?.removeEventListener("click", handleLogoClick);
      navLinks.forEach((l) => l.removeEventListener("click", handleLinkClick));
      cta?.removeEventListener("mousemove", handleCtaMove);
      cta?.removeEventListener("mouseleave", handleCtaLeave);
      navLinkItems.forEach((li, i) => {
        li.removeEventListener("mousemove", linkMoveHandlers[i]);
        li.removeEventListener("mouseleave", linkLeaveHandlers[i]);
      });
    };
  }, []);

  /* ── 5. Theme toggle click ── */
  const handleThemeToggle = () => {
    showDarkModePopup();
    if (window.toast) {
      window.toast("// Nice try ☀️ — dark side is forever");
    }
  };

  return (
    <nav id="nav" ref={navRef}>
      <a href="#" className="nav-logo">
        Raj<span>.</span>
      </a>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
        <li>
          <button
            className="theme-toggle"
            id="themeToggle"
            title="Toggle light/dark"
            onClick={handleThemeToggle}
          >
            <div className="theme-toggle-knob"></div>
            <div className="theme-toggle-icons">
              <span className="ti">☀️</span>
              <span className="ti">🌙</span>
            </div>
          </button>
        </li>
      </ul>
      <a href="mailto:rajdeepdey.6359@gmail.com" className="nav-cta">
        <span>Hire Me</span>
      </a>
    </nav>
  );
}
