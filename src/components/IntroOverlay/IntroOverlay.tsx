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

const WAVE_THRESHOLD = 50;
const MOTION_DECAY = 0.82;
const SUSTAINED_MS = 2000;
const NO_WAVE_TIMEOUT = 15000;
const ANALYSIS_W = 80;
const ANALYSIS_H = 60;

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
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionAccumRef = useRef(0);
  const sustainedStartRef = useRef<number>(0);
  const analyseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyseCtxRef = useRef<CanvasRenderingContext2D | null>(null);

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

      if (eased < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => { setHidden(true); setState("done"); }, 950);
        }, 700);
      }
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

  /* ── Analyse frame: motion detection + visual heatmap overlay ── */
  const analyseFrame = useCallback(() => {
    const video = videoRef.current;
    const displayCanvas = canvasRef.current;
    const analyseCtx = analyseCtxRef.current;
    if (!video || !displayCanvas || !analyseCtx || detectedRef.current) return;
    if (video.readyState < 2) { rafRef.current = requestAnimationFrame(analyseFrame); return; }

    const dCtx = displayCanvas.getContext("2d");
    if (!dCtx) { rafRef.current = requestAnimationFrame(analyseFrame); return; }

    // Draw mirrored video to display canvas
    const cw = displayCanvas.width;
    const ch = displayCanvas.height;
    dCtx.save();
    dCtx.translate(cw, 0);
    dCtx.scale(-1, 1);
    dCtx.drawImage(video, 0, 0, cw, ch);
    dCtx.restore();

    // Analyse at lower resolution
    analyseCtx.drawImage(video, 0, 0, ANALYSIS_W, ANALYSIS_H);
    const data = analyseCtx.getImageData(0, 0, ANALYSIS_W, ANALYSIS_H).data;

    if (prevDataRef.current) {
      // Calculate per-pixel motion and draw heatmap
      const blockW = cw / ANALYSIS_W;
      const blockH = ch / ANALYSIS_H;
      let totalDiff = 0;
      let motionPixels = 0;

      for (let y = 0; y < ANALYSIS_H; y++) {
        for (let x = 0; x < ANALYSIS_W; x++) {
          const i = (y * ANALYSIS_W + x) * 4;
          const diff =
            Math.abs(data[i] - prevDataRef.current[i]) +
            Math.abs(data[i + 1] - prevDataRef.current[i + 1]) +
            Math.abs(data[i + 2] - prevDataRef.current[i + 2]);
          const pixDiff = diff / 3;
          totalDiff += pixDiff;

          // Draw motion heatmap on display canvas (only where motion is significant)
          if (pixDiff > 20) {
            motionPixels++;
            const alpha = Math.min(0.7, (pixDiff - 20) / 100);
            // Mirror X for display
            const drawX = cw - (x * blockW) - blockW;
            const drawY = y * blockH;

            // Gold glow for high motion areas
            if (pixDiff > 50) {
              dCtx.fillStyle = `rgba(232, 184, 75, ${alpha * 0.8})`;
              dCtx.fillRect(drawX, drawY, blockW + 1, blockH + 1);
            } else {
              dCtx.fillStyle = `rgba(200, 153, 58, ${alpha * 0.5})`;
              dCtx.fillRect(drawX, drawY, blockW + 1, blockH + 1);
            }
          }
        }
      }

      // Draw motion outline/contour around active areas
      if (motionPixels > 30) {
        // Draw connecting dots on high-motion regions
        dCtx.strokeStyle = "rgba(232, 184, 75, 0.6)";
        dCtx.lineWidth = 1.5;
        dCtx.setLineDash([3, 3]);
        let firstPoint = true;
        dCtx.beginPath();
        for (let y = 0; y < ANALYSIS_H; y += 3) {
          for (let x = 0; x < ANALYSIS_W; x += 3) {
            const i = (y * ANALYSIS_W + x) * 4;
            const diff = (
              Math.abs(data[i] - prevDataRef.current[i]) +
              Math.abs(data[i + 1] - prevDataRef.current[i + 1]) +
              Math.abs(data[i + 2] - prevDataRef.current[i + 2])
            ) / 3;
            if (diff > 40) {
              const drawX = cw - (x * blockW) - blockW / 2;
              const drawY = y * blockH + blockH / 2;
              if (firstPoint) { dCtx.moveTo(drawX, drawY); firstPoint = false; }
              else dCtx.lineTo(drawX, drawY);
            }
          }
        }
        dCtx.stroke();
        dCtx.setLineDash([]);

        // Draw dots on peak motion points
        for (let y = 0; y < ANALYSIS_H; y += 4) {
          for (let x = 0; x < ANALYSIS_W; x += 4) {
            const i = (y * ANALYSIS_W + x) * 4;
            const diff = (
              Math.abs(data[i] - prevDataRef.current[i]) +
              Math.abs(data[i + 1] - prevDataRef.current[i + 1]) +
              Math.abs(data[i + 2] - prevDataRef.current[i + 2])
            ) / 3;
            if (diff > 60) {
              const drawX = cw - (x * blockW) - blockW / 2;
              const drawY = y * blockH + blockH / 2;
              dCtx.beginPath();
              dCtx.arc(drawX, drawY, 3, 0, Math.PI * 2);
              dCtx.fillStyle = "rgba(232, 184, 75, 0.9)";
              dCtx.fill();
              // Glow
              dCtx.beginPath();
              dCtx.arc(drawX, drawY, 7, 0, Math.PI * 2);
              dCtx.fillStyle = "rgba(232, 184, 75, 0.15)";
              dCtx.fill();
            }
          }
        }
      }

      // Overall motion calculation
      const avgDiff = totalDiff / (ANALYSIS_W * ANALYSIS_H);
      motionAccumRef.current =
        avgDiff > 7
          ? Math.min(100, motionAccumRef.current + avgDiff * 1.4)
          : motionAccumRef.current * MOTION_DECAY;

      const pct = Math.round(motionAccumRef.current);

      // Update status based on motion
      if (motionPixels > 50) {
        setCamStatus("// motion detected! wave your hand \ud83d\udc4b");
      } else if (motionPixels > 15) {
        setCamStatus("// I can see movement\u2026 wave bigger! \u270b");
      }

      // Sustained wave detection
      if (motionAccumRef.current >= WAVE_THRESHOLD) {
        if (sustainedStartRef.current === 0) {
          sustainedStartRef.current = performance.now();
          setCamStatus("// waving detected! keep going\u2026 \ud83d\udc4b");
        }
        const elapsed = performance.now() - sustainedStartRef.current;
        const wavePctVal = Math.min(100, Math.round((elapsed / SUSTAINED_MS) * 100));
        setWavePct(wavePctVal);

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
    } else {
      // First frame — just draw mirrored video, no analysis yet
      setCamStatus("// camera ready! wave your hand \ud83d\udc4b");
    }

    prevDataRef.current = new Uint8ClampedArray(data);
    rafRef.current = requestAnimationFrame(analyseFrame);
  }, [onWaveConfirmed]);

  /* ── Start camera ── */
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Create offscreen analysis canvas
    const aCanvas = document.createElement("canvas");
    aCanvas.width = ANALYSIS_W;
    aCanvas.height = ANALYSIS_H;
    analyseCanvasRef.current = aCanvas;
    analyseCtxRef.current = aCanvas.getContext("2d", { willReadFrequently: true });

    let mounted = true;

    const timer = setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } })
        .then((stream) => {
          if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
          video.srcObject = stream;

          const onCanPlay = () => {
            video.play().then(() => {
              setVideoReady(true);
              // Set display canvas size
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 240;
              setCamStatus("// camera ready! wave your hand \ud83d\udc4b");

              // Start analysis after camera stabilizes
              setTimeout(() => {
                if (mounted && !detectedRef.current) {
                  rafRef.current = requestAnimationFrame(analyseFrame);

                  // No-wave timeout
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
              }, 800);
            }).catch(() => {
              setCamStatus("// camera error \u2014 tap skip ↗");
            });
          };

          if (video.readyState >= 3) onCanPlay();
          else video.addEventListener("canplay", onCanPlay, { once: true });
        })
        .catch(() => {
          setCamStatus("// camera not available \u2014 tap skip ↗");
          setTimeout(() => {
            if (!detectedRef.current && mounted) { detectedRef.current = true; startLoading(); }
          }, 3000);
        });
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => { stopCamera(); startLoading(); };

  if (hidden || state === "done") return null;

  return (
    <>
      <div id="intro-overlay" className={exiting ? "i-exit" : undefined}>
        {/* Entry State */}
        <div className={`i-state${state === "entry" ? " active" : ""}`} id="i-entry">
          <div className="i-tag">first visit experience</div>
          <h1 className="i-headline">Hey there &#128075;<br/>Try <em>waving your hand</em> to say hi</h1>
          <p className="i-sub">Wave for 2 seconds \u2014 or use the skip button \u2197</p>
          <div className="i-cam-outer">
            <div className="i-cam-ring">
              {/* Hidden video element for camera stream */}
              <video ref={videoRef} id="intro-video" autoPlay muted playsInline className={videoReady ? "on" : ""} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
              {/* Visible canvas showing mirrored feed + motion overlay */}
              <canvas ref={canvasRef} className="i-hand-canvas on" />
            </div>
            <div className="i-cam-status" id="i-cam-status">{camStatus}</div>
            <div className="i-motion-wrap">
              <div className="i-motion-fill" style={{ width: `${wavePct}%` }} />
            </div>
            {wavePct > 0 && wavePct < 100 && <div className="i-wave-pct">{wavePct}%</div>}
          </div>
        </div>

        {/* No Wave State */}
        <div className={`i-state${state === "nowave" ? " active" : ""}`} id="i-nowave">
          <span className="i-nowave-emoji">&#129335;</span>
          <h2 className="i-resp-title">{noWaveMsg}</h2>
          <p className="i-resp-sub">// no worries, loading anyway\u2026</p>
        </div>

        {/* Response State */}
        <div className={`i-state${state === "response" ? " active" : ""}`} id="i-response">
          <span className="i-wave-emoji">&#128400;</span>
          <h2 className="i-resp-title">Hey! Nice to<br/>meet you <em>:)</em></h2>
          <p className="i-resp-sub">// loading your experience\u2026</p>
        </div>

        {/* Loading State */}
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
