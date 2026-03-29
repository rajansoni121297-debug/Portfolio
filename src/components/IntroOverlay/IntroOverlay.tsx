"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type IntroState = "entry" | "response" | "loading" | "done";

const LOAD_MSGS = [
  "Warming up pixels…",
  "Aligning grids perfectly (as always)",
  "Good design takes a second… or 3",
  "Loading creativity…",
  "Calibrating design taste…",
  "Loading 5 yrs 9 mos of experience…",
  "Almost there, promise!",
  "Made with love & caffeine ☕",
  "Good UX is invisible when done right",
  "Designing your first impression…",
];

const WAVE_THRESHOLD = 42;
const MOTION_DECAY = 0.86;

export function IntroOverlay() {
  const [state, setState] = useState<IntroState>("entry");
  const [motionPct, setMotionPct] = useState(0);
  const [camStatus, setCamStatus] = useState("// requesting camera…");
  const [progress, setProgress] = useState(0);
  const [loadMsg, setLoadMsg] = useState(LOAD_MSGS[0]);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [alreadyVisited, setAlreadyVisited] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionAccumRef = useRef(0);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    setState("loading");
    const DURATION = 3200;
    const t0 = performance.now();
    let lastMsgIdx = -1;

    function tick(now: number) {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / DURATION);
      const eased = Math.round(100 * (1 - Math.pow(1 - p, 2.6)));
      setProgress(eased);

      const msgIdx = Math.min(
        LOAD_MSGS.length - 1,
        Math.floor((eased / 100) * LOAD_MSGS.length)
      );
      if (msgIdx !== lastMsgIdx) {
        lastMsgIdx = msgIdx;
        setLoadMsg(LOAD_MSGS[msgIdx]);
      }

      if (eased < 100) {
        requestAnimationFrame(tick);
      } else {
        localStorage.setItem("rdd_portfolio_visited", "1");
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            setHidden(true);
            setState("done");
          }, 950);
        }, 700);
      }
    }
    requestAnimationFrame(tick);
  }, []);

  const analyseFrame = useCallback(() => {
    const video = videoRef.current;
    const ctx = ctxRef.current;
    if (!video || !ctx) return;

    ctx.drawImage(video, 0, 0, 40, 30);
    const data = ctx.getImageData(0, 0, 40, 30).data;

    if (prevDataRef.current) {
      let diff = 0;
      for (let i = 0; i < data.length; i += 4) {
        diff +=
          Math.abs(data[i] - prevDataRef.current[i]) +
          Math.abs(data[i + 1] - prevDataRef.current[i + 1]) +
          Math.abs(data[i + 2] - prevDataRef.current[i + 2]);
      }
      diff /= 40 * 30 * 3;

      motionAccumRef.current =
        diff > 7
          ? Math.min(100, motionAccumRef.current + diff * 1.8)
          : motionAccumRef.current * MOTION_DECAY;

      setMotionPct(Math.round(motionAccumRef.current));

      if (motionAccumRef.current >= WAVE_THRESHOLD) {
        stopCamera();
        setState("response");
        setTimeout(startLoading, 1600);
        return;
      }
    }

    prevDataRef.current = new Uint8ClampedArray(data);
    rafRef.current = requestAnimationFrame(analyseFrame);
  }, [stopCamera, startLoading]);

  const startCamera = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      })
      .then((s) => {
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.addEventListener(
            "loadeddata",
            () => {
              setCamStatus("// wave your hand! 👋");
              rafRef.current = requestAnimationFrame(analyseFrame);
            },
            { once: true }
          );
        }
      })
      .catch(() => {
        setCamStatus("// camera blocked — use skip ↗");
      });
  }, [analyseFrame]);

  useEffect(() => {
    if (localStorage.getItem("rdd_portfolio_visited")) {
      setAlreadyVisited(true);
      return;
    }

    canvasRef.current = document.createElement("canvas");
    canvasRef.current.width = 40;
    canvasRef.current.height = 30;
    ctxRef.current = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });

    const timer = setTimeout(startCamera, 500);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleSkip = () => {
    stopCamera();
    startLoading();
  };

  if (alreadyVisited) return null;

  return (
    <>
      <div
        id="intro-overlay"
        className={exiting ? "i-exit" : undefined}
        style={{ display: hidden || state === "done" ? "none" : undefined }}
      >
        {/* Entry State */}
        <div
          className={`i-state${state === "entry" ? " active" : ""}`}
          id="i-entry"
        >
          <div className="i-tag">first visit experience</div>
          <h1 className="i-headline">
            Hey there 👋
            <br />
            Try <em>waving your hand</em> to say hi
          </h1>
          <p className="i-sub">
            Your camera will detect the gesture &mdash; or use the skip button
            ↗
          </p>
          <div className="i-cam-outer">
            <div className="i-cam-ring">
              <video ref={videoRef} id="intro-video" autoPlay muted playsInline />
            </div>
            <div className="i-cam-status" id="i-cam-status">{camStatus}</div>
            <div className="i-motion-wrap">
              <div
                className="i-motion-fill"
                id="i-motion-fill"
                style={{ width: `${motionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Response State */}
        <div
          className={`i-state${state === "response" ? " active" : ""}`}
          id="i-response"
        >
          <span className="i-wave-emoji">🖐🏻</span>
          <h2 className="i-resp-title">
            Hey! Nice to
            <br />
            meet you <em>:)</em>
          </h2>
          <p className="i-resp-sub">// loading your experience&hellip;</p>
        </div>

        {/* Loading State */}
        <div
          className={`i-state${state === "loading" ? " active" : ""}`}
          id="i-loading"
        >
          <div className="i-load-tag">// loading portfolio</div>
          <div className="i-pct-wrap">
            <span className="i-pct" id="i-pct">{progress}</span>
            <span className="i-pct-sym">%</span>
          </div>
          <div className="i-bar-track">
            <div
              className="i-bar-fill"
              id="i-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="i-load-msg" id="i-load-msg">{loadMsg}</div>
        </div>
      </div>

      {state === "entry" && !hidden && (
        <button id="intro-skip" onClick={handleSkip}>
          No camera? Tap here instead 😄
        </button>
      )}
    </>
  );
}
