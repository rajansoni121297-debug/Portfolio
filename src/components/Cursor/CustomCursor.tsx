"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in window) {
      setIsTouch(true);
      return;
    }

    const cursor = document.getElementById("cursor") as HTMLDivElement;
    const ring = document.getElementById("cr") as HTMLDivElement;
    const clabel = document.getElementById("clabel") as HTMLDivElement;
    const idleMsg = document.getElementById("cursor-idle-msg") as HTMLDivElement;
    const exploreCursor = document.getElementById("cursor-explore") as HTMLDivElement;
    const exploreLabel = document.getElementById("cursor-explore-label") as HTMLSpanElement;

    if (!cursor || !ring) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    let ecx = 0, ecy = 0;
    let exploreActive = false;
    let rafId: number;

    // --- Idle cursor ---
    const idleMessages = [
      "Still exploring? \u{1F440}",
      "Try the game \u2192",
      "Psst\u2026 click something",
      "Good things take time \u2726",
      "Scroll down for more",
    ];
    let idleIndex = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    function showIdle() {
      if (!idleMsg) return;
      idleMsg.textContent = idleMessages[idleIndex % idleMessages.length];
      idleMsg.style.left = (mx + 24) + "px";
      idleMsg.style.top = (my - 12) + "px";
      idleMsg.style.opacity = "1";
      idleMsg.style.transform = "translateY(0)";
      cursor.classList.add("idle");
      idleIndex++;
    }

    function hideIdle() {
      if (!idleMsg) return;
      idleMsg.style.opacity = "0";
      idleMsg.style.transform = "translateY(4px)";
      cursor.classList.remove("idle");
    }

    function resetIdleTimer() {
      hideIdle();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(showIdle, 4500);
    }

    // --- Mouse move --- position with transform like original
    function onMouseMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      if (clabel) {
        clabel.style.transform = `translate(${mx}px,${my}px)`;
      }
      if (idleMsg) {
        idleMsg.style.left = (mx + 24) + "px";
        idleMsg.style.top = (my - 12) + "px";
      }
      if (exploreActive) {
        ecx = mx;
        ecy = my;
      }
      resetIdleTimer();
    }

    // --- Ring lerp + explore cursor lerp ---
    function animate() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;

      if (exploreActive && exploreCursor) {
        ecx += (mx - ecx) * 0.10;
        ecy += (my - ecy) * 0.10;
        exploreCursor.style.left = ecx + "px";
        exploreCursor.style.top = ecy + "px";
      }

      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    // --- Click ring effect ---
    function onMouseDown() { ring.classList.add("click"); }
    function onMouseUp() { ring.classList.remove("click"); }

    // --- setCursor ---
    (window as any).setCursor = (el: HTMLElement, label: string) => {
      if (!el || typeof el.addEventListener !== "function") return;
      el.addEventListener("mouseenter", () => {
        ring.classList.add("hover");
        if (clabel && label) {
          clabel.textContent = label;
          clabel.style.opacity = "1";
        }
      });
      el.addEventListener("mouseleave", () => {
        ring.classList.remove("hover");
        if (clabel) {
          clabel.textContent = "";
          clabel.style.opacity = "0";
        }
      });
    };

    // --- setExploreCursor ---
    (window as any).setExploreCursor = (el: HTMLElement, label: string) => {
      if (!el || typeof el.addEventListener !== "function") return;
      el.addEventListener("mouseenter", (e: Event) => {
        const me = e as MouseEvent;
        exploreActive = true;
        ecx = me.clientX;
        ecy = me.clientY;
        if (exploreCursor) {
          exploreCursor.style.left = ecx + "px";
          exploreCursor.style.top = ecy + "px";
          if (exploreLabel) exploreLabel.textContent = label;
          exploreCursor.classList.add("visible");
        }
        cursor.classList.add("hidden");
        ring.classList.add("hidden");
      });
      el.addEventListener("mousemove", (e: Event) => {
        const me = e as MouseEvent;
        ecx = me.clientX;
        ecy = me.clientY;
      });
      el.addEventListener("mouseleave", () => {
        exploreActive = false;
        if (exploreCursor) exploreCursor.classList.remove("visible", "pressed");
        cursor.classList.remove("hidden");
        ring.classList.remove("hidden");
      });
      el.addEventListener("mousedown", () => {
        if (exploreCursor) exploreCursor.classList.add("pressed");
      });
      el.addEventListener("mouseup", () => {
        if (exploreCursor) exploreCursor.classList.remove("pressed");
      });
    };

    // --- Attach listeners ---
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", resetIdleTimer);
    document.addEventListener("scroll", resetIdleTimer, { passive: true });

    resetIdleTimer();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", resetIdleTimer);
      document.removeEventListener("scroll", resetIdleTimer);
      if (idleTimer) clearTimeout(idleTimer);
      delete (window as any).setCursor;
      delete (window as any).setExploreCursor;
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cr"></div>
      <div id="clabel"></div>
      <div id="cursor-idle-msg"></div>
      <div id="cursor-explore">
        <span id="cursor-explore-label">Explore ↗</span>
      </div>
    </>
  );
}
