"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type IntroState = "entry" | "nowave" | "response" | "loading" | "done";

const LOAD_MSGS = [
  "Warming up pixels\u2026",
  "Aligning grids perfectly (as always)",
  "Good design takes a second\u2026 or 3",
  "Loading creativity\u2026",
  "Calibrating design taste\u2026",
  "Almost there, promise!",
  "Made with love & caffeine \u2615",
  "Good UX is invisible when done right",
  "Designing your first impression\u2026",
  "Shipping pixels at lightspeed\u2026",
];

const NO_WAVE_MSGS = [
  "Guess you\u2019re not a waving person \ud83d\ude05",
  "Camera shy? That\u2019s okay too \ud83d\ude0e",
  "No wave detected\u2026 maybe later? \ud83e\udd37",
  "Your hand must be busy holding coffee \u2615",
  "Alright, we\u2019ll skip the formalities \ud83d\ude04",
  "Left on read by a camera\u2026 ouch \ud83d\ude02",
  "Plot twist: the camera waved at you instead \ud83d\udc4b",
  "That\u2019s okay, some legends enter without waving \ud83d\udc51",
  "Introvert mode: activated \ud83e\uddd1\u200d\ud83d\udcbb",
  "Hand raise? Nah. Hand vibe? Absolutely \u270c\ufe0f",
  "Waving is overrated anyway \ud83d\ude0f",
  "I\u2019ll pretend you waved. Deal? \ud83e\udd1d",
  "No wave = you\u2019re too cool for gestures \ud83d\ude0e",
  "Maybe your hand is on a coffee break \u2615\ud83d\ude34",
  "I waited, you didn\u2019t wave\u2026 but I still like you \u2764\ufe0f",
  "The camera blinked first. You win \ud83c\udfc6",
  "High-five? No? Okay, entering anyway \u270b",
  "Some people wave, some just vibe. You\u2019re a vibe person \u2728",
  "Your hand said \u201cnot today\u201d and that\u2019s valid \ud83d\ude04",
  "Alright, we respect the no-wave lifestyle \ud83d\ude4f",
];

const WAVE_THRESHOLD = 45;
const MOTION_DECAY = 0.84;
const SUSTAINED_MS = 2000;
const NO_WAVE_TIMEOUT = 15000;
const AW = 64; // analysis width
const AH = 48; // analysis height

export function IntroOverlay() {
  const [state, setState] = useState<IntroState>("entry");
  const [camStatus, setCamStatus] = useState("// requesting camera\u2026");
  const [progress, setProgress] = useState(0);
  const [loadMsg, setLoadMsg] = useState(LOAD_MSGS[0]);
  const [loadMsgFading, setLoadMsgFading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [noWaveMsg, setNoWaveMsg] = useState("");
  const [wavePct, setWavePct] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedRef = useRef(false);
  const noWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const motionAccumRef = useRef(0);
  const sustainedStartRef = useRef(0);
  const aCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const aCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameCountRef = useRef(0);

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (noWaveTimerRef.current) { clearTimeout(noWaveTimerRef.current); noWaveTimerRef.current = null; }
  }, []);

  const startLoading = useCallback(() => {
    setState("loading");
    const DURATION = 4000;
    const t0 = performance.now();
    let lastMsgIdx = -1;
    function tick(now: number) {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / DURATION);
      let eased: number;
      if (p < 0.3) eased = Math.round((p / 0.3) * 30);
      else if (p < 0.7) eased = Math.round(30 + ((p - 0.3) / 0.4) * 40);
      else eased = Math.round(70 + ((p - 0.7) / 0.3) * 30);
      eased = Math.min(100, eased);
      setProgress(eased);
      const msgIdx = Math.min(LOAD_MSGS.length - 1, Math.floor((eased / 100) * LOAD_MSGS.length));
      if (msgIdx !== lastMsgIdx) {
        lastMsgIdx = msgIdx;
        setLoadMsgFading(true);
        setTimeout(() => { setLoadMsg(LOAD_MSGS[msgIdx]); setLoadMsgFading(false); }, 250);
      }
      if (eased < 100) requestAnimationFrame(tick);
      else setTimeout(() => { setExiting(true); setTimeout(() => { setHidden(true); setState("done"); }, 950); }, 700);
    }
    requestAnimationFrame(tick);
  }, []);

  const onWaveConfirmed = useCallback(() => {
    if (detectedRef.current) return;
    detectedRef.current = true;
    stopCamera();
    setState("response");
    setTimeout(() => startLoading(), 1600);
  }, [stopCamera, startLoading]);

  /* ── Frame analysis: draw camera + gold motion silhouette ── */
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const aCtx = aCtxRef.current;
    if (!video || !canvas || !aCtx || detectedRef.current || video.readyState < 2) {
      if (!detectedRef.current) rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    frameCountRef.current++;

    // 1. Draw mirrored camera feed
    ctx.save();
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, cw, ch);
    ctx.restore();

    // 2. Get low-res frame for analysis
    aCtx.drawImage(video, 0, 0, AW, AH);
    const data = aCtx.getImageData(0, 0, AW, AH).data;

    if (prevFrameRef.current) {
      const prev = prevFrameRef.current;
      const bw = cw / AW;
      const bh = ch / AH;
      let totalMotion = 0;
      let motionCount = 0;

      // Track motion points for drawing
      const motionPoints: { x: number; y: number; strength: number }[] = [];

      for (let y = 0; y < AH; y++) {
        for (let x = 0; x < AW; x++) {
          const i = (y * AW + x) * 4;
          const diff = (
            Math.abs(data[i] - prev[i]) +
            Math.abs(data[i + 1] - prev[i + 1]) +
            Math.abs(data[i + 2] - prev[i + 2])
          ) / 3;
          totalMotion += diff;

          if (diff > 18) {
            motionCount++;
            const drawX = cw - (x * bw) - bw / 2; // mirror X
            const drawY = y * bh + bh / 2;

            // Gold fill on motion areas
            const alpha = Math.min(0.55, (diff - 18) / 80);
            ctx.fillStyle = `rgba(200, 153, 58, ${alpha})`;
            ctx.fillRect(cw - (x + 1) * bw, y * bh, bw + 0.5, bh + 0.5);

            if (diff > 35) {
              motionPoints.push({ x: drawX, y: drawY, strength: diff });
            }
          }
        }
      }

      // 3. Draw gold edge contour around motion region
      if (motionPoints.length > 5) {
        // Sort points to form a rough outline
        const sorted = motionPoints.sort((a, b) => a.y - b.y || a.x - b.x);

        // Draw outer glow contour
        ctx.strokeStyle = "rgba(232, 184, 75, 0.5)";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < sorted.length; i += 2) {
          if (!started) { ctx.moveTo(sorted[i].x, sorted[i].y); started = true; }
          else ctx.lineTo(sorted[i].x, sorted[i].y);
        }
        ctx.stroke();

        // Draw bright dots on strong motion points
        for (const pt of motionPoints) {
          if (pt.strength > 50) {
            // Outer glow
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(232, 184, 75, 0.1)";
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(232, 184, 75, 0.8)";
            ctx.fill();
          }
        }

        // Draw connecting lines between nearby strong points (skeleton-like)
        ctx.strokeStyle = "rgba(232, 184, 75, 0.4)";
        ctx.lineWidth = 1.5;
        const strongPts = motionPoints.filter(p => p.strength > 45);
        for (let i = 0; i < strongPts.length; i++) {
          for (let j = i + 1; j < strongPts.length; j++) {
            const d = Math.hypot(strongPts[i].x - strongPts[j].x, strongPts[i].y - strongPts[j].y);
            if (d < 40 && d > 8) {
              ctx.beginPath();
              ctx.moveTo(strongPts[i].x, strongPts[i].y);
              ctx.lineTo(strongPts[j].x, strongPts[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Overall motion for wave detection
      const avgMotion = totalMotion / (AW * AH);
      motionAccumRef.current =
        avgMotion > 6
          ? Math.min(100, motionAccumRef.current + avgMotion * 1.5)
          : motionAccumRef.current * MOTION_DECAY;

      // Update status
      if (motionCount > 80) {
        if (sustainedStartRef.current === 0) setCamStatus("// motion detected! wave your hand \ud83d\udc4b");
      } else if (motionCount > 20) {
        if (sustainedStartRef.current === 0) setCamStatus("// I see movement\u2026 wave bigger! \u270b");
      }

      // Sustained wave check
      if (motionAccumRef.current >= WAVE_THRESHOLD) {
        if (sustainedStartRef.current === 0) {
          sustainedStartRef.current = performance.now();
          setCamStatus("// waving detected! keep going\u2026 \ud83d\udc4b");
        }
        const elapsed = performance.now() - sustainedStartRef.current;
        setWavePct(Math.min(100, Math.round((elapsed / SUSTAINED_MS) * 100)));
        if (elapsed >= SUSTAINED_MS) {
          setCamStatus("// wave confirmed! \u2713");
          setWavePct(100);
          onWaveConfirmed();
          return;
        }
      } else {
        if (sustainedStartRef.current > 0) {
          sustainedStartRef.current = 0;
          setWavePct(0);
          setCamStatus("// almost! keep waving\u2026");
        }
      }
    }

    prevFrameRef.current = new Uint8ClampedArray(data);
    rafRef.current = requestAnimationFrame(processFrame);
  }, [onWaveConfirmed]);

  /* ── Start camera ── */
  useEffect(() => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    if (!video || !canvas) return;

    // Offscreen analysis canvas
    const ac = document.createElement("canvas");
    ac.width = AW;
    ac.height = AH;
    aCanvasRef.current = ac;
    aCtxRef.current = ac.getContext("2d", { willReadFrequently: true });

    let mounted = true;

    const timer = setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } })
        .then((stream) => {
          if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
          video.srcObject = stream;

          const onReady = () => {
            video.play().then(() => {
              setVideoReady(true);
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 240;
              setCamStatus("// camera ready! wave your hand \ud83d\udc4b");

              setTimeout(() => {
                if (mounted && !detectedRef.current) {
                  rafRef.current = requestAnimationFrame(processFrame);

                  noWaveTimerRef.current = setTimeout(() => {
                    if (!detectedRef.current && mounted) {
                      const msg = NO_WAVE_MSGS[Math.floor(Math.random() * NO_WAVE_MSGS.length)];
                      setNoWaveMsg(msg);
                      setState("nowave");
                      setTimeout(() => {
                        if (!detectedRef.current) { detectedRef.current = true; stopCamera(); startLoading(); }
                      }, 2500);
                    }
                  }, NO_WAVE_TIMEOUT);
                }
              }, 600);
            }).catch(() => setCamStatus("// camera error \u2014 tap skip \u2197"));
          };

          if (video.readyState >= 3) onReady();
          else video.addEventListener("canplay", onReady, { once: true });
        })
        .catch(() => {
          setCamStatus("// camera not available \u2014 tap skip \u2197");
          setTimeout(() => {
            if (!detectedRef.current && mounted) { detectedRef.current = true; startLoading(); }
          }, 3000);
        });
    }, 300);

    return () => { mounted = false; clearTimeout(timer); stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => { stopCamera(); startLoading(); };

  if (hidden || state === "done") return null;

  return (
    <>
      <div id="intro-overlay" className={exiting ? "i-exit" : undefined}>
        {/* Entry */}
        <div className={`i-state${state === "entry" ? " active" : ""}`} id="i-entry">
          <div className="i-tag">first visit experience</div>
          <h1 className="i-headline">Hey there &#128075;<br/>Try <em>waving your hand</em> to say hi</h1>
          <p className="i-sub">Wave for 2 seconds — or use the skip button ↗</p>
          <div className="i-cam-outer">
            <div className="i-cam-ring">
              <video ref={videoRef} id="intro-video" autoPlay muted playsInline style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
              <canvas ref={canvasRef} className="i-hand-canvas on" />
            </div>
            <div className="i-cam-status">{camStatus}</div>
            <div className="i-motion-wrap"><div className="i-motion-fill" style={{ width: `${wavePct}%` }} /></div>
            {wavePct > 0 && wavePct < 100 && <div className="i-wave-pct">{wavePct}%</div>}
          </div>
        </div>

        {/* No Wave */}
        <div className={`i-state${state === "nowave" ? " active" : ""}`}>
          <span className="i-nowave-emoji">&#129335;</span>
          <h2 className="i-resp-title">{noWaveMsg}</h2>
          <p className="i-resp-sub">// no worries, loading anyway…</p>
        </div>

        {/* Response */}
        <div className={`i-state${state === "response" ? " active" : ""}`} id="i-response">
          <span className="i-wave-emoji">&#128400;</span>
          <h2 className="i-resp-title">Hey! Nice to<br/>meet you <em>:)</em></h2>
          <p className="i-resp-sub">// loading your experience…</p>
        </div>

        {/* Loading */}
        <div className={`i-state${state === "loading" ? " active" : ""}`} id="i-loading">
          <div className="i-load-tag">// loading portfolio</div>
          <div className="i-spinner"><div className="i-spinner-ring"/><div className="i-spinner-ring i-spinner-ring-2"/><div className="i-spinner-dot"/></div>
          <div className="i-pct-wrap"><span className="i-pct">{progress}</span><span className="i-pct-sym">%</span></div>
          <div className="i-bar-track"><div className="i-bar-fill" style={{ width: `${progress}%` }} /></div>
          <div className={`i-load-msg${loadMsgFading ? " swap" : ""}`}>{loadMsg}</div>
        </div>
      </div>

      {(state === "entry" || state === "nowave") && (
        <button id="intro-skip" onClick={handleSkip}>No camera? Tap here instead &#128516;</button>
      )}
    </>
  );
}
