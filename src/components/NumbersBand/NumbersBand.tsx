"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── SlotDisplay — Original digit-level slot machine ─────────── */
class SlotDisplay {
  container: HTMLElement;
  value: number;
  cols: { type: string; col?: HTMLElement; track?: HTMLElement; el?: HTMLElement }[];
  h: number;

  constructor(container: HTMLElement, value: number) {
    this.container = container;
    this.value = Math.floor(value);
    this.cols = [];
    this.h = 0;
    this._build(this._fmt(this.value));
  }

  _fmt(n: number) {
    return Math.floor(n).toLocaleString("en-US");
  }

  _build(str: string) {
    this.container.innerHTML = "";
    this.cols = [];
    for (const ch of str) {
      if (/\d/.test(ch)) {
        const col = document.createElement("span");
        col.className = "slot-col";
        const track = document.createElement("span");
        track.className = "slot-track";
        const digit = document.createElement("span");
        digit.className = "slot-digit";
        digit.textContent = ch;
        track.appendChild(digit);
        col.appendChild(track);
        this.container.appendChild(col);
        this.cols.push({ type: "digit", col, track });
      } else {
        const sep = document.createElement("span");
        sep.className = "slot-sep";
        sep.textContent = ch;
        this.container.appendChild(sep);
        this.cols.push({ type: "sep", el: sep });
      }
    }
    requestAnimationFrame(() => {
      const dEl = this.container.querySelector(".slot-digit") as HTMLElement;
      if (!dEl) return;
      this.h = dEl.offsetHeight || dEl.getBoundingClientRect().height || 72;
      this.cols
        .filter((c) => c.type === "digit")
        .forEach((c) => {
          c.col!.style.height = this.h + "px";
          c.col!.style.lineHeight = this.h + "px";
        });
    });
  }

  update(newValue: number) {
    const oldStr = this._fmt(this.value);
    const newStr = this._fmt(Math.floor(newValue));
    this.value = Math.floor(newValue);

    if (oldStr.length !== newStr.length) {
      this._build(newStr);
      return;
    }

    const h = this.h || 72;
    let delay = 0;

    for (let i = 0; i < newStr.length; i++) {
      if (newStr[i] === oldStr[i]) continue;
      const col = this.cols[i];
      if (!col || col.type !== "digit") continue;
      const { track } = col;
      if (!track) continue;

      const next = document.createElement("span");
      next.className = "slot-digit";
      next.textContent = newStr[i];
      next.style.cssText = `display:block;flex-shrink:0;height:${h}px;line-height:${h}px;`;
      track.appendChild(next);

      const localDelay = delay;
      setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateY(0)";
        void track.offsetHeight;
        track.style.transition = `transform 480ms cubic-bezier(.4,0,.15,1)`;
        track.style.transform = `translateY(-${h}px)`;
        setTimeout(() => {
          const old = track.querySelector(".slot-digit");
          if (old) track.removeChild(old);
          track.style.transition = "none";
          track.style.transform = "translateY(0)";
        }, 510);
      }, localDelay);

      delay += 55;
    }
  }
}

/* ── Experience calc ─────────────────────────────────────────── */
function calcExperience() {
  const start = new Date(2020, 0, 1); // January 2020
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
  const coffeeRef = useRef<HTMLDivElement>(null);
  const apprRef = useRef<HTMLDivElement>(null);
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
      apprSlotRef.current?.update(next);
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
          coffeeSlotRef.current = new SlotDisplay(coffeeRef.current, 0);
          // Count up
          const cofDur = 1400;
          const cofStart = performance.now();
          let lastCoffeeVal = 0;
          function animCoffee(now: number) {
            const p = Math.min((now - cofStart) / cofDur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(eased * coffeeBase);
            if (val !== lastCoffeeVal) {
              coffeeSlotRef.current?.update(val);
              lastCoffeeVal = val;
            }
            if (p < 1) requestAnimationFrame(animCoffee);
          }
          requestAnimationFrame(animCoffee);

          // Increment every 15 minutes
          const coffeeInterval = setInterval(() => {
            setCoffeeValue((prev) => {
              const next = prev + 1;
              coffeeSlotRef.current?.update(next);
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
          apprSlotRef.current = new SlotDisplay(apprRef.current, 0);
          // Count up
          const apprDur = 1400;
          const apprStartTime = performance.now();
          let lastApprVal = 0;
          function animAppr(now: number) {
            const p = Math.min((now - apprStartTime) / apprDur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(eased * apprBase);
            if (val !== lastApprVal) {
              apprSlotRef.current?.update(val);
              lastApprVal = val;
            }
            if (p < 1) requestAnimationFrame(animAppr);
          }
          requestAnimationFrame(animAppr);

          // Auto-increment at random intervals
          function scheduleAutoIncrement() {
            const delay = (45 + Math.random() * 35) * 1000;
            const tid = setTimeout(() => {
              setApprValue((prev) => {
                const next = prev + 1;
                apprSlotRef.current?.update(next);
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
        <div className="nb-num" id="exp-num">{expStr}</div>
        <div className="nb-label">Years of Experience</div>
        <div className="nb-sub"><div className="live-micro-dot"></div><span id="exp-days">+{days}d and counting</span></div>
      </div>

      <div className="numbers-band-div"></div>

      <div className="numbers-band-item">
        <div className="nb-num" id="proj-num">{projCount}+</div>
        <div className="nb-label">Projects Delivered</div>
        <div className="nb-sub">Service &amp; Product</div>
      </div>

      <div className="numbers-band-div"></div>

      <div className="numbers-band-item">
        <div className="slot-display" id="coffee-display" ref={coffeeRef}></div>
        <div className="nb-label">Coffees Consumed ☕</div>
        <div className="nb-sub">and counting…</div>
      </div>

      <div className="numbers-band-div"></div>

      <div
        className="numbers-band-item nb-appr-wrap"
        id="nb-appr-wrap"
        onClick={handleApprClick}
      >
        <div className="nb-appr-inner">
          <div className="slot-display" id="appr-display" ref={apprRef}></div>
        </div>
        <div className="nb-label">Appreciations <span className="nb-appr-star">✦</span></div>
        <div className="nb-sub nb-appr-hint">// click to appreciate</div>
      </div>
    </div>
  );
}
