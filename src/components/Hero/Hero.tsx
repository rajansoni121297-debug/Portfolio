"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { TicTacToe } from "@/components/TicTacToe/TicTacToe";

const NAMES = ["Dey", "Dev", "Designer", "Thinker"];
const TYPE_SPEED = 90;
const ERASE_SPEED = 60;
const PAUSE_AFTER = 2400;
const PAUSE_EMPTY = 220;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const nameRotateRef = useRef<HTMLElement>(null);

  const [greeting, setGreeting] = useState("");
  const [expString, setExpString] = useState("");
  const [rotatingName, setRotatingName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // Time greeting
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setGreeting("Good morning");
    else if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17 && h < 21) setGreeting("Good evening");
    else setGreeting("Working late?");
  }, []);

  // Experience calc
  useEffect(() => {
    const start = new Date(2020, 5, 1); // June 2020
    const now = new Date();
    let y = now.getFullYear() - start.getFullYear();
    let m = now.getMonth() - start.getMonth();
    if (now.getDate() < start.getDate()) m--;
    if (m < 0) {
      y--;
      m += 12;
    }
    setExpString(`${y} yrs ${m} mos`);
  }, []);

  // Hero grid glow canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0,
      ch = 0;
    function resize() {
      const r = hero!.getBoundingClientRect();
      cw = r.width;
      ch = r.height;
      canvas!.width = cw;
      canvas!.height = ch;
      canvas!.style.width = r.width + "px";
      canvas!.style.height = r.height + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = hero!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);

    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, cw, ch);
      const { x: mx, y: my } = mouseRef.current;
      if (mx > 0 && my > 0) {
        const grd = ctx!.createRadialGradient(mx, my, 0, mx, my, 220);
        grd.addColorStop(0, "rgba(200,153,58,0.09)");
        grd.addColorStop(0.5, "rgba(200,153,58,0.03)");
        grd.addColorStop(1, "rgba(200,153,58,0)");
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, 0, cw, ch);

        const gridSize = 80;
        const nearX = Math.round(mx / gridSize) * gridSize;
        const nearY = Math.round(my / gridSize) * gridSize;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const nx = nearX + dx * gridSize;
            const ny = nearY + dy * gridSize;
            const dist = Math.hypot(mx - nx, my - ny);
            const alpha = Math.max(0, 1 - dist / 200) * 0.65;
            if (alpha > 0.04) {
              ctx!.beginPath();
              ctx!.arc(nx, ny, 2.5, 0, Math.PI * 2);
              ctx!.fillStyle = `rgba(200,153,58,${alpha})`;
              ctx!.fill();
            }
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Name typewriter effect
  useEffect(() => {
    let wordIdx = 0;
    let charIdx = 0;
    let phase: "typing" | "pausing" | "erasing" | "pauseEmpty" = "typing";
    let timer: ReturnType<typeof setTimeout>;
    let hovered = false;

    const el = nameRotateRef.current;
    const onEnter = () => {
      hovered = true;
    };
    const onLeaveEl = () => {
      hovered = false;
    };
    if (el) {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeaveEl);
    }

    function tick() {
      if (hovered) {
        timer = setTimeout(tick, 100);
        return;
      }

      const word = NAMES[wordIdx];

      if (phase === "typing") {
        setIsTyping(true);
        setIsErasing(false);
        charIdx++;
        setRotatingName(word.slice(0, charIdx));
        if (charIdx >= word.length) {
          phase = "pausing";
          setIsTyping(false);
          timer = setTimeout(tick, PAUSE_AFTER);
          return;
        }
        timer = setTimeout(tick, TYPE_SPEED);
      } else if (phase === "pausing") {
        phase = "erasing";
        tick();
      } else if (phase === "erasing") {
        setIsErasing(true);
        setIsTyping(false);
        charIdx--;
        setRotatingName(word.slice(0, charIdx));
        if (charIdx <= 0) {
          phase = "pauseEmpty";
          setIsErasing(false);
          timer = setTimeout(tick, PAUSE_EMPTY);
          return;
        }
        timer = setTimeout(tick, ERASE_SPEED);
      } else if (phase === "pauseEmpty") {
        wordIdx = (wordIdx + 1) % NAMES.length;
        charIdx = 0;
        phase = "typing";
        tick();
      }
    }

    timer = setTimeout(tick, 500);

    return () => {
      clearTimeout(timer);
      if (el) {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeaveEl);
      }
    };
  }, []);

  // Parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (heroLeftRef.current) {
        heroLeftRef.current.style.transform = `translateY(${y * 0.06}px)`;
      }
      if (heroRightRef.current) {
        heroRightRef.current.style.transform = `scale(1.13) translateY(${y * 0.04}px)`;
      }
      if (bgGlowRef.current) {
        bgGlowRef.current.style.transform = `translateY(${y * 0.12}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Magnetic avail-badge
  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;

    const onMove = (e: MouseEvent) => {
      const r = badge.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      badge.style.transform = `translate(${x * 0.08}px, ${y * 0.1}px)`;
    };
    const onLeave = () => {
      badge.style.transform = "translate(0, 0)";
    };

    badge.addEventListener("mousemove", onMove);
    badge.addEventListener("mouseleave", onLeave);

    return () => {
      badge.removeEventListener("mousemove", onMove);
      badge.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Cursor labels for avail-badge
  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;

    const onEnter = () => {
      if (typeof window !== "undefined" && (window as any).setCursor) {
        (window as any).setCursor("Available");
      }
    };
    const onLeave = () => {
      if (typeof window !== "undefined" && (window as any).setCursor) {
        (window as any).setCursor("");
      }
    };

    badge.addEventListener("mouseenter", onEnter);
    badge.addEventListener("mouseleave", onLeave);

    return () => {
      badge.removeEventListener("mouseenter", onEnter);
      badge.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const nameClass = [
    isTyping ? "typing" : "",
    isErasing ? "erasing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="hero" ref={heroRef}>
      <canvas id="hero-grid-glow" ref={canvasRef} />
      <div className="hero-bg-grid" />
      <div className="hero-bg-glow" ref={bgGlowRef} />

      <div className="hero-left" ref={heroLeftRef}>
        <div className="hero-eyebrow">
          <span id="hero-greeting">{greeting}</span> &middot; UI/UX &amp;
          Product Designer &middot; Ahmedabad, India
        </div>

        <h1 className="hero-name">
          <span className="glitch" data-text="Raj Deep">
            Raj Deep
          </span>
          <br />
          <em
            id="hero-name-rotate"
            ref={nameRotateRef}
            className={nameClass}
          >
            {rotatingName}
          </em>
        </h1>

        <p className="hero-personality">
          I design products that people actually use.
        </p>

        <p className="hero-desc">
          Designing{" "}
          <strong>end-to-end digital products</strong> that balance user needs
          and business goals &mdash; backed by clear reasoning, AI-assisted
          workflows, and vibe coding. With{" "}
          <span id="hero-exp-inline">{expString}</span> of experience shipping
          real products.
        </p>

        <div className="hero-bottom-row">
          <div className="avail-badge" ref={badgeRef}>
            <span className="avail-dot" />
            <span className="avail-text">Open to work</span>
          </div>
        </div>
      </div>

      <div className="hero-right" ref={heroRightRef}>
        <TicTacToe />
      </div>

      <div className="scroll-hint">
        <span className="scroll-hint-text">Scroll to explore</span>
        <div className="scroll-arrow">
          <div className="scroll-line"></div>
        </div>
      </div>
    </section>
  );
}
