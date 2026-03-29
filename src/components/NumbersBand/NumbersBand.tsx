"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── SlotDisplay ─────────────────────────────────────────────── */
class SlotDisplay {
  private el: HTMLElement;
  private digits: HTMLSpanElement[] = [];

  constructor(el: HTMLElement) {
    this.el = el;
    this.el.style.display = "inline-flex";
    this.el.style.overflow = "hidden";
  }

  setValue(val: string | number, animate = true) {
    const str = String(val);
    // reconcile digit spans
    while (this.digits.length < str.length) {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.transition = animate ? "transform 0.45s cubic-bezier(.23,1,.32,1)" : "none";
      span.style.minWidth = "0.58em";
      span.style.textAlign = "center";
      this.el.appendChild(span);
      this.digits.push(span);
    }
    while (this.digits.length > str.length) {
      const removed = this.digits.pop();
      removed?.remove();
    }
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const span = this.digits[i];
      if (span.textContent !== ch) {
        if (animate && /\d/.test(ch)) {
          span.style.transform = "translateY(-100%)";
          span.style.opacity = "0";
          requestAnimationFrame(() => {
            span.textContent = ch;
            requestAnimationFrame(() => {
              span.style.transition =
                "transform 0.45s cubic-bezier(.23,1,.32,1), opacity 0.3s ease";
              span.style.transform = "translateY(0)";
              span.style.opacity = "1";
            });
          });
        } else {
          span.textContent = ch;
        }
      }
    }
  }
}

/* ── Experience calc ─────────────────────────────────────────── */
function calcExperience() {
  const start = new Date(2020, 5, 1); // June 2020
  const now = new Date();
  let y = now.getFullYear() - start.getFullYear();
  let m = now.getMonth() - start.getMonth();
  let d = now.getDate() - start.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { expStr: `${y}y ${m}m`, days: d };
}

/* ── Component ───────────────────────────────────────────────── */
export function NumbersBand() {
  const bandRef = useRef<HTMLDivElement>(null);
  const coffeeRef = useRef<HTMLSpanElement>(null);
  const apprRef = useRef<HTMLSpanElement>(null);
  const projRef = useRef<HTMLSpanElement>(null);
  const initRef = useRef(false);

  const [expStr, setExpStr] = useState("");
  const [days, setDays] = useState(0);
  const [projCount, setProjCount] = useState(0);
  const [coffeeValue, setCoffeeValue] = useState(0);
  const [apprValue, setApprValue] = useState(0);

  // Imperative SlotDisplay instances
  const coffeeSlotRef = useRef<SlotDisplay | null>(null);
  const apprSlotRef = useRef<SlotDisplay | null>(null);

  const handleApprClick = useCallback(() => {
    setApprValue((prev) => {
      const next = prev + 1;
      apprSlotRef.current?.setValue(next.toLocaleString());
      return next;
    });
    // bump animation
    const wrap = document.querySelector(".nb-appr-wrap");
    if (wrap) {
      wrap.classList.add("bump");
      setTimeout(() => wrap.classList.remove("bump"), 400);
    }
    // ripple
    const ripple = document.createElement("span");
    ripple.className = "appr-ripple";
    document.querySelector(".nb-appr-wrap")?.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }, []);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || initRef.current) return;
        initRef.current = true;

        // 1. Experience
        const { expStr: exp, days: d } = calcExperience();
        setExpStr(exp);
        setDays(d);
        const expEl = band.querySelector(".exp-num");
        if (expEl) {
          expEl.classList.add("flash");
          setTimeout(() => expEl.classList.remove("flash"), 600);
        }

        // 2. Projects count-up to 46+
        const projDur = 1000;
        const projStart = performance.now();
        function animProj(now: number) {
          const p = Math.min((now - projStart) / projDur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(eased * 46);
          setProjCount(val);
          if (p < 1) requestAnimationFrame(animProj);
        }
        requestAnimationFrame(animProj);

        // 3. Coffee SlotDisplay
        const startDate = new Date(2020, 5, 1);
        const coffeeBase = Math.floor(
          (Date.now() - startDate.getTime()) / 86400000
        ) * 2;
        setCoffeeValue(coffeeBase);
        if (coffeeRef.current) {
          coffeeSlotRef.current = new SlotDisplay(coffeeRef.current);
          // Count up
          const cofDur = 1400;
          const cofStart = performance.now();
          function animCoffee(now: number) {
            const p = Math.min((now - cofStart) / cofDur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(eased * coffeeBase);
            coffeeSlotRef.current?.setValue(val.toLocaleString(), p > 0.05);
            if (p < 1) requestAnimationFrame(animCoffee);
          }
          requestAnimationFrame(animCoffee);

          // Increment every 15 minutes
          const coffeeInterval = setInterval(() => {
            setCoffeeValue((prev) => {
              const next = prev + 1;
              coffeeSlotRef.current?.setValue(next.toLocaleString());
              return next;
            });
          }, 15 * 60 * 1000);
          // store for cleanup
          (band as any).__coffeeInterval = coffeeInterval;
        }

        // 4. Appreciation SlotDisplay
        const apprBase = 23664 + Math.floor(Math.random() * 200);
        setApprValue(apprBase);
        if (apprRef.current) {
          apprSlotRef.current = new SlotDisplay(apprRef.current);
          // Count up
          const apprDur = 1400;
          const apprStart = performance.now();
          function animAppr(now: number) {
            const p = Math.min((now - apprStart) / apprDur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(eased * apprBase);
            apprSlotRef.current?.setValue(val.toLocaleString(), p > 0.05);
            if (p < 1) requestAnimationFrame(animAppr);
          }
          requestAnimationFrame(animAppr);

          // Auto-increment at random intervals
          function scheduleAutoIncrement() {
            const delay = (45 + Math.random() * 35) * 1000;
            const tid = setTimeout(() => {
              setApprValue((prev) => {
                const next = prev + 1;
                apprSlotRef.current?.setValue(next.toLocaleString());
                return next;
              });
              scheduleAutoIncrement();
            }, delay);
            (band as any).__apprTimeout = tid;
          }
          scheduleAutoIncrement();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(band);

    // Cursor
    const apprWrap = band.querySelector(".nb-appr-wrap");
    if (apprWrap && typeof (window as any).setCursor === "function") {
      (window as any).setCursor(apprWrap as HTMLElement, "\u2726 Appreciate");
    }

    return () => {
      observer.disconnect();
      clearInterval((band as any).__coffeeInterval);
      clearTimeout((band as any).__apprTimeout);
    };
  }, []);

  return (
    <div className="numbers-band reveal" ref={bandRef}>
      <div className="numbers-band-item">
        <span className="exp-num">{expStr}</span>
        <div className="nb-label">Experience</div>
        <div className="nb-sub">
          <span className="live-micro-dot"></span>
          <span className="exp-days">+{days}d and counting</span>
        </div>
      </div>

      <div className="numbers-band-div"></div>

      <div className="numbers-band-item">
        <span className="proj-num">{projCount}+</span>
        <div className="nb-label">Projects Shipped</div>
        <div className="nb-sub">across 4 companies</div>
      </div>

      <div className="numbers-band-div"></div>

      <div className="numbers-band-item">
        <span className="coffee-num" ref={coffeeRef}></span>
        <div className="nb-label">Cups of Coffee</div>
        <div className="nb-sub">fuelling every pixel</div>
      </div>

      <div className="numbers-band-div"></div>

      <div
        className="numbers-band-item nb-appr-wrap"
        onClick={handleApprClick}
      >
        <span className="appr-num" ref={apprRef}></span>
        <div className="nb-label">Appreciations</div>
        <div className="nb-sub">tap to appreciate</div>
      </div>
    </div>
  );
}
