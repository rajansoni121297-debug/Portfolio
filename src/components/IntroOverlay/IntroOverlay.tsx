"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type IntroState = "entry" | "wavedetected" | "nowave" | "response" | "loading" | "done";

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
];

const SUSTAINED_MS = 2000;
const NO_WAVE_TIMEOUT = 15000;

/* ── Hand landmark connections for drawing lines ── */
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],       // thumb
  [0,5],[5,6],[6,7],[7,8],       // index
  [0,9],[9,10],[10,11],[11,12],  // middle
  [0,13],[13,14],[14,15],[15,16],// ring
  [0,17],[17,18],[18,19],[19,20],// pinky
  [5,9],[9,13],[13,17],          // palm
];

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
  const handsRef = useRef<any>(null);
  const waveStartRef = useRef<number>(0);
  const lastWristYRef = useRef<number[]>([]);
  const animFrameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (noWaveTimerRef.current) {
      clearTimeout(noWaveTimerRef.current);
      noWaveTimerRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
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
        setTimeout(() => {
          setLoadMsg(LOAD_MSGS[msgIdx]);
          setLoadMsgFading(false);
        }, 250);
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

  /* ── Draw hand landmarks on canvas ── */
  const drawHand = useCallback((landmarks: { x: number; y: number }[], ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Draw connections (lines between joints)
    ctx.strokeStyle = "rgba(200, 153, 58, 0.7)";
    ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      const pa = landmarks[a];
      const pb = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(pa.x * w, pa.y * h);
      ctx.lineTo(pb.x * w, pb.y * h);
      ctx.stroke();
    }

    // Draw joints (dots on each landmark)
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const isTip = [4, 8, 12, 16, 20].includes(i); // fingertips
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, isTip ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? "#E8B84B" : "rgba(200, 153, 58, 0.9)";
      ctx.fill();

      // Glow on fingertips
      if (isTip) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 184, 75, 0.15)";
        ctx.fill();
      }
    }
  }, []);

  /* ── Detect wave gesture from wrist Y oscillation ── */
  const detectWave = useCallback((landmarks: { x: number; y: number }[]) => {
    const wristY = landmarks[0].y;
    const history = lastWristYRef.current;
    history.push(wristY);
    if (history.length > 30) history.shift(); // Keep last 30 frames (~1 second)

    // Count direction changes (oscillations) — a wave goes up-down-up-down
    let dirChanges = 0;
    let lastDir = 0;
    for (let i = 1; i < history.length; i++) {
      const diff = history[i] - history[i - 1];
      const dir = diff > 0.003 ? 1 : diff < -0.003 ? -1 : 0;
      if (dir !== 0 && dir !== lastDir) {
        dirChanges++;
        lastDir = dir;
      }
    }

    // Need at least 3 direction changes (up-down-up = wave) to start counting
    return dirChanges >= 3;
  }, []);

  /* ── Initialize MediaPipe Hands ── */
  useEffect(() => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let mounted = true;

    async function init() {
      try {
        // Request camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setVideoReady(true);
        setCamStatus("// detecting hand\u2026 show your palm \u270b");

        // Set canvas size to match video
        if (!canvas) return;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;

        // Load MediaPipe Hands
        const { Hands } = await import("@mediapipe/hands");

        if (!mounted) return;

        const hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Fastest
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!mounted || detectedRef.current) return;

          // Clear and draw mirrored video
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw hand skeleton (mirrored)
            const mirrored = landmarks.map((lm: any) => ({
              x: 1 - lm.x, // Mirror X
              y: lm.y,
            }));
            drawHand(mirrored, ctx, canvas.width, canvas.height);

            setCamStatus("// hand detected! wave to say hi \ud83d\udc4b");

            // Check for wave gesture
            const isWaving = detectWave(landmarks);

            if (isWaving) {
              if (waveStartRef.current === 0) {
                waveStartRef.current = performance.now();
                setCamStatus("// waving detected! keep going\u2026");
              }

              const elapsed = performance.now() - waveStartRef.current;
              const pct = Math.min(100, Math.round((elapsed / SUSTAINED_MS) * 100));
              setWavePct(pct);

              if (elapsed >= SUSTAINED_MS) {
                setCamStatus("// wave confirmed! \u2713");
                setWavePct(100);
                onWaveConfirmed();
                return;
              }
            } else {
              // Reset if wave stops
              if (waveStartRef.current > 0) {
                waveStartRef.current = 0;
                setWavePct(0);
                setCamStatus("// keep waving! almost there\u2026");
              }
            }
          } else {
            // No hand — reset
            waveStartRef.current = 0;
            setWavePct(0);
            lastWristYRef.current = [];
            setCamStatus("// show your hand to the camera \u270b");
          }
        });

        handsRef.current = hands;

        // Send video frames to MediaPipe
        async function processFrame() {
          if (!mounted || detectedRef.current || !video || video.readyState < 2) {
            if (mounted && !detectedRef.current) {
              animFrameRef.current = requestAnimationFrame(processFrame);
            }
            return;
          }
          try {
            await hands.send({ image: video });
          } catch {
            // Ignore frame processing errors
          }
          if (mounted && !detectedRef.current) {
            animFrameRef.current = requestAnimationFrame(processFrame);
          }
        }

        // Wait a bit for camera to stabilize
        setTimeout(() => {
          if (mounted) {
            animFrameRef.current = requestAnimationFrame(processFrame);

            // No-wave timeout
            noWaveTimerRef.current = setTimeout(() => {
              if (!detectedRef.current && mounted) {
                const msg = NO_WAVE_MSGS[Math.floor(Math.random() * NO_WAVE_MSGS.length)];
                setNoWaveMsg(msg);
                setState("nowave");
                setTimeout(() => {
                  if (!detectedRef.current) {
                    detectedRef.current = true;
                    stopCamera();
                    startLoading();
                  }
                }, 2500);
              }
            }, NO_WAVE_TIMEOUT);
          }
        }, 800);

      } catch (err) {
        console.warn("Camera/MediaPipe init failed:", err);
        setCamStatus("// camera not available \u2014 tap skip to enter \u2197");
        setTimeout(() => {
          if (!detectedRef.current && mounted) {
            detectedRef.current = true;
            startLoading();
          }
        }, 3000);
      }
    }

    init();

    return () => {
      mounted = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    stopCamera();
    startLoading();
  };

  if (hidden || state === "done") return null;

  return (
    <>
      <div id="intro-overlay" className={exiting ? "i-exit" : undefined}>
        {/* Entry State */}
        <div className={`i-state${state === "entry" ? " active" : ""}`} id="i-entry">
          <div className="i-tag">first visit experience</div>
          <h1 className="i-headline">
            Hey there &#128075;<br />
            Try <em>waving your hand</em> to say hi
          </h1>
          <p className="i-sub">Wave for 2 seconds — or use the skip button ↗</p>
          <div className="i-cam-outer">
            <div className="i-cam-ring">
              <video
                ref={videoRef}
                id="intro-video"
                autoPlay
                muted
                playsInline
                className={videoReady ? "on" : ""}
                style={{ display: videoReady ? "none" : "block" }}
              />
              <canvas
                ref={canvasRef}
                className={`i-hand-canvas${videoReady ? " on" : ""}`}
              />
            </div>
            <div className="i-cam-status" id="i-cam-status">{camStatus}</div>
            {/* Wave progress bar */}
            <div className="i-motion-wrap">
              <div className="i-motion-fill" style={{ width: `${wavePct}%` }} />
            </div>
            {wavePct > 0 && wavePct < 100 && (
              <div className="i-wave-pct">{wavePct}%</div>
            )}
          </div>
        </div>

        {/* No Wave State */}
        <div className={`i-state${state === "nowave" ? " active" : ""}`} id="i-nowave">
          <span className="i-nowave-emoji">&#129335;</span>
          <h2 className="i-resp-title">{noWaveMsg}</h2>
          <p className="i-resp-sub">// no worries, loading anyway&#8230;</p>
        </div>

        {/* Response State */}
        <div className={`i-state${state === "response" ? " active" : ""}`} id="i-response">
          <span className="i-wave-emoji">&#128400;</span>
          <h2 className="i-resp-title">Hey! Nice to<br />meet you <em>:)</em></h2>
          <p className="i-resp-sub">// loading your experience&#8230;</p>
        </div>

        {/* Loading State */}
        <div className={`i-state${state === "loading" ? " active" : ""}`} id="i-loading">
          <div className="i-load-tag">// loading portfolio</div>
          <div className="i-spinner">
            <div className="i-spinner-ring" />
            <div className="i-spinner-ring i-spinner-ring-2" />
            <div className="i-spinner-dot" />
          </div>
          <div className="i-pct-wrap">
            <span className="i-pct" id="i-pct">{progress}</span>
            <span className="i-pct-sym">%</span>
          </div>
          <div className="i-bar-track">
            <div className="i-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className={`i-load-msg${loadMsgFading ? " swap" : ""}`}>{loadMsg}</div>
        </div>
      </div>

      {(state === "entry" || state === "nowave") && (
        <button id="intro-skip" onClick={handleSkip}>
          No camera? Tap here instead &#128516;
        </button>
      )}
    </>
  );
}
