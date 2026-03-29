"use client";

import { useEffect, useRef } from "react";

interface TrailDot {
  x: number;
  y: number;
  alpha: number;
  radius: number;
  life: number;
}

const MAX_DOTS = 25;
const LIFE_DECAY = 0.025;
const RADIUS_DECAY = 0.04;
const INITIAL_ALPHA = 0.6;
const INITIAL_RADIUS = 3;

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999995";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d")!;
    const dots: TrailDot[] = [];
    let rafId: number;

    function onMouseMove(e: MouseEvent) {
      dots.push({
        x: e.clientX,
        y: e.clientY,
        alpha: INITIAL_ALPHA,
        radius: INITIAL_RADIUS,
        life: 1,
      });
      if (dots.length > MAX_DOTS) {
        dots.shift();
      }
    }

    function onResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(dot.radius, 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,153,58,${dot.alpha * 0.5})`;
        ctx.fill();

        dot.life -= LIFE_DECAY;
        dot.alpha = Math.max(dot.life * INITIAL_ALPHA, 0);
        dot.radius = Math.max(dot.radius - RADIUS_DECAY, 0);

        if (dot.life <= 0) {
          dots.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

  return null;
}
