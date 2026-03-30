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

/* Finger joint connections for drawing skeleton */
const FINGER_JOINTS: Record<string, number[]> = {
  thumb: [0, 1, 2, 3, 4],
  index: [0, 5, 6, 7, 8],
  middle: [0, 9, 10, 11, 12],
  ring: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
  palm: [5, 9, 13, 17],
};

const SUSTAINED_MS = 2000;
const NO_WAVE_TIMEOUT = 20000;

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
  const [modelLoading, setModelLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedRef = useRef(false);
  const noWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const sustainedStartRef = useRef<number>(0);
  const wristHistoryRef = useRef<number[]>([]);
  const detectorRef = useRef<any>(null);

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

  /* ── Draw hand skeleton with gold lines ── */
  const drawHand = useCallback((keypoints: { x: number; y: number }[], ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Draw finger bones (lines between joints)
    for (const finger of Object.values(FINGER_JOINTS)) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(200, 153, 58, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      for (let i = 0; i < finger.length; i++) {
        const pt = keypoints[finger[i]];
        if (!pt) continue;
        // Mirror X
        const px = w - pt.x;
        const py = pt.y;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw glow line on top
      ctx.beginPath();
      ctx.strokeStyle = "rgba(232, 184, 75, 0.25)";
      ctx.lineWidth = 6;
      for (let i = 0; i < finger.length; i++) {
        const pt = keypoints[finger[i]];
        if (!pt) continue;
        const px = w - pt.x;
        const py = pt.y;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Draw joints (dots)
    const tips = [4, 8, 12, 16, 20];
    for (let i = 0; i < keypoints.length; i++) {
      const pt = keypoints[i];
      if (!pt) continue;
      const px = w - pt.x;
      const py = pt.y;
      const isTip = tips.includes(i);

      // Glow halo on fingertips
      if (isTip) {
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 184, 75, 0.12)";
        ctx.fill();
      }

      // Joint dot
      ctx.beginPath();
      ctx.arc(px, py, isTip ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? "#E8B84B" : "rgba(200, 153, 58, 0.9)";
      ctx.fill();

      // Bright center on tips
      if (isTip) {
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
    }
  }, []);

  /* ── Detect wave from wrist Y oscillation ── */
  const detectWave = useCallback((keypoints: { x: number; y: number }[]) => {
    const wrist = keypoints[0];
    if (!wrist) return false;
    const history = wristHistoryRef.current;
    history.push(wrist.y);
    if (history.length > 30) history.shift();
    if (history.length < 10) return false;

    let dirChanges = 0;
    let lastDir = 0;
    for (let i = 1; i < history.length; i++) {
      const diff = history[i] - history[i - 1];
      const dir = diff > 2 ? 1 : diff < -2 ? -1 : 0;
      if (dir !== 0 && dir !== lastDir) { dirChanges++; lastDir = dir; }
    }
    return dirChanges >= 3;
  }, []);

  /* ── Main detection loop ── */
  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector || detectedRef.current) return;
    if (video.readyState < 2) { rafRef.current = requestAnimationFrame(detectLoop); return; }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Draw mirrored video
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    try {
      const hands = await detector.estimateHands(video);
      if (hands && hands.length > 0) {
        const hand = hands[0];
        const keypoints = hand.keypoints || hand.landmarks;
        if (keypoints && keypoints.length >= 21) {
          drawHand(keypoints, ctx, w, h);

          setCamStatus("// hand detected! wave to say hi \ud83d\udc4b");

          const isWaving = detectWave(keypoints);
          if (isWaving) {
            if (sustainedStartRef.current === 0) {
              sustainedStartRef.current = performance.now();
              setCamStatus("// waving! keep going\u2026 \ud83d\udc4b");
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
      } else {
        wristHistoryRef.current = [];
        sustainedStartRef.current = 0;
        setWavePct(0);
      }
    } catch {
      // Frame estimation error — skip
    }

    if (!detectedRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop);
    }
  }, [drawHand, detectWave, onWaveConfirmed]);

  /* ── Init camera + load model ── */
  useEffect(() => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    if (!video || !canvas) return;

    let mounted = true;

    async function init() {
      try {
        // 1. Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setVideoReady(true);
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        setCamStatus("// loading hand detection model\u2026");
        setModelLoading(true);

        // 2. Load TF.js hand detection model
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();

        const handPoseDetection = await import("@tensorflow-models/hand-pose-detection");
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detector = await handPoseDetection.createDetector(model, {
          runtime: "tfjs",
          maxHands: 1,
          modelType: "lite",
        });

        if (!mounted) return;
        detectorRef.current = detector;
        setModelLoading(false);
        setCamStatus("// show your hand to the camera \u270b");

        // 3. Start detection loop
        setTimeout(() => {
          if (mounted && !detectedRef.current) {
            rafRef.current = requestAnimationFrame(detectLoop);

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
        }, 500);

      } catch (err) {
        console.warn("Init failed:", err);
        setCamStatus("// camera not available \u2014 tap skip \u2197");
        setModelLoading(false);
        setTimeout(() => {
          if (!detectedRef.current && mounted) { detectedRef.current = true; startLoading(); }
        }, 3000);
      }
    }

    const timer = setTimeout(init, 500);
    return () => { mounted = false; clearTimeout(timer); stopCamera(); };
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
              <video ref={videoRef} id="intro-video" autoPlay muted playsInline className={videoReady ? "on" : ""} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
              <canvas ref={canvasRef} className="i-hand-canvas on" />
            </div>
            <div className="i-cam-status" id="i-cam-status">
              {modelLoading && <span className="i-model-spinner" />}
              {camStatus}
            </div>
            <div className="i-motion-wrap">
              <div className="i-motion-fill" style={{ width: `${wavePct}%` }} />
            </div>
            {wavePct > 0 && wavePct < 100 && <div className="i-wave-pct">{wavePct}%</div>}
          </div>
        </div>

        {/* No Wave */}
        <div className={`i-state${state === "nowave" ? " active" : ""}`}>
          <span className="i-nowave-emoji">&#129335;</span>
          <h2 className="i-resp-title">{noWaveMsg}</h2>
          <p className="i-resp-sub">// no worries, loading anyway\u2026</p>
        </div>

        {/* Response */}
        <div className={`i-state${state === "response" ? " active" : ""}`} id="i-response">
          <span className="i-wave-emoji">&#128400;</span>
          <h2 className="i-resp-title">Hey! Nice to<br/>meet you <em>:)</em></h2>
          <p className="i-resp-sub">// loading your experience\u2026</p>
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
