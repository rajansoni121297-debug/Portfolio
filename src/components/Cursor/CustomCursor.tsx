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

    let mx = -100,
      my = -100;
    let rx = -100,
      ry = -100;
    let ex = -100,
      ey = -100;
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
      idleMsg.textContent = idleMessages[idleIndex % idleMessages.length];
      idleMsg.style.left = mx + 18 + "px";
      idleMsg.style.top = my - 12 + "px";
      idleMsg.style.opacity = "1";
      cursor.classList.add("idle");
      idleIndex++;
    }

    function hideIdle() {
      idleMsg.style.opacity = "0";
      cursor.classList.remove("idle");
    }

    function resetIdleTimer() {
      hideIdle();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(showIdle, 4500);
    }

    // --- Mouse move ---
    function onMouseMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
      resetIdleTimer();
    }

    // --- Click ring effect ---
    function onMouseDown() {
      ring.classList.add("click");
    }
    function onMouseUp() {
      ring.classList.remove("click");
    }

    // --- Activity listeners for idle ---
    function onActivity() {
      resetIdleTimer();
    }

    // --- Animation loop ---
    function animate() {
      // Ring lerp
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";

      // Explore cursor lerp
      ex += (mx - ex) * 0.1;
      ey += (my - ey) * 0.1;
      exploreCursor.style.left = ex + "px";
      exploreCursor.style.top = ey + "px";

      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    // --- setCursor ---
    (window as any).setCursor = (el: HTMLElement, label: string) => {
      el.addEventListener("mouseenter", () => {
        ring.classList.add("hover");
        clabel.textContent = label;
        clabel.style.opacity = "1";
      });
      el.addEventListener("mouseleave", () => {
        ring.classList.remove("hover");
        clabel.textContent = "";
        clabel.style.opacity = "0";
      });
    };

    // --- setExploreCursor ---
    (window as any).setExploreCursor = (el: HTMLElement, label: string) => {
      el.addEventListener("mouseenter", () => {
        exploreLabel.textContent = label;
        exploreCursor.classList.add("visible");
        cursor.classList.add("hidden");
        ring.classList.add("hidden");
      });
      el.addEventListener("mouseleave", () => {
        exploreCursor.classList.remove("visible");
        cursor.classList.remove("hidden");
        ring.classList.remove("hidden");
      });
      el.addEventListener("mousedown", () => {
        exploreCursor.classList.add("pressed");
      });
      el.addEventListener("mouseup", () => {
        exploreCursor.classList.remove("pressed");
      });
    };

    // --- Attach listeners ---
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity);

    // Start idle timer
    resetIdleTimer();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
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
        <span id="cursor-explore-label">Explore &#x2197;</span>
      </div>
    </>
  );
}
