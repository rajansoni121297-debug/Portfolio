"use client";

import { useEffect } from "react";
import { ToastProvider } from "@/components/Toast/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CustomCursor } from "@/components/Cursor/CustomCursor";
import { Particles } from "@/components/Particles/Particles";
import { IntroOverlay } from "@/components/IntroOverlay/IntroOverlay";
import { Nav } from "@/components/Nav/Nav";
import { Hero } from "@/components/Hero/Hero";
import { Marquee } from "@/components/Marquee/Marquee";
import { NumbersBand } from "@/components/NumbersBand/NumbersBand";
import { SkillsBand } from "@/components/SkillsBand/SkillsBand";
import { About } from "@/components/About/About";
import { Experience } from "@/components/Experience/Experience";
import { Projects } from "@/components/Projects/Projects";
import { Tools } from "@/components/Tools/Tools";
import { Mentorship } from "@/components/Mentorship/Mentorship";
import { Credentials } from "@/components/Credentials/Credentials";
import { Contact } from "@/components/Contact/Contact";
import { EasterEgg } from "@/components/EasterEgg/EasterEgg";

export default function Home() {
  // Scroll reveal observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    // Staggered child animations
    const childObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            const el = child as HTMLElement;
            el.style.opacity = "0";
            el.style.transform = "translateY(18px)";
            el.style.transition = `opacity .5s cubic-bezier(.23,1,.32,1) ${i * 70}ms,transform .5s cubic-bezier(.23,1,.32,1) ${i * 70}ms`;
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, 50 + i * 70);
          });
          childObs.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    document
      .querySelectorAll(
        ".tool-rack,.skill-orbs,.skills-band-gauges,.contact-info-grid,.mentor-grid,.cred-grid"
      )
      .forEach((el) => childObs.observe(el));

    // Safety fallback
    const fallback = setTimeout(() => {
      document
        .querySelectorAll(".reveal:not(.visible)")
        .forEach((el) => el.classList.add("visible"));
    }, 2000);

    return () => {
      obs.disconnect();
      childObs.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <ToastProvider>
      <ThemeProvider>
        <IntroOverlay />
        <CustomCursor />
        <Particles />
        <Nav />

        <main>
          <Hero />
          <Marquee />
          <NumbersBand />
          <SkillsBand />
          <About />
          <hr className="hr-gold" />
          <Experience />
          <Projects />
          <Tools />
          <Mentorship />
          <hr className="hr-gold" />
          <Credentials />
          <Contact />
        </main>

        <EasterEgg />
      </ThemeProvider>
    </ToastProvider>
  );
}
