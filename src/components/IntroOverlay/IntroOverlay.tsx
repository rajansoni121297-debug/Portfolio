"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type IntroState = "entry" | "response" | "loading" | "done";

const LOAD_MSGS = [
  "Warming up pixels\u2026",
  "Aligning grids perfectly (as always)",
  "Good design takes a second\u2026 or 3",
  "Loading creativity\u2026",
  "Calibrating design taste\u2026",
  "Loading 5 yrs 9 mos of experience\u2026",
  "Almost there, promise!",
  "Made with love & caffeine \u2615",
  "Good UX is invisible when done right",
  "Designing your first impression\u2026",
];

const WAVE_THRESHOLD = 42;
const MOTION_DECAY = 0.86;

export function IntroOverlay() {
  const [state, setState] = useState<IntroState>("entry");
  const [motionPct, setMotionPct] = useState(0);
  const [camStatus, setCamStatus] = useState("// requesting camera\u2026");
  const [progress, setProgress] = useState(0);
  const [loadMsg, setLoadMsg] = useState(LOAD_MSGS[0]);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [alreadyVisited, setAlreadyVisited] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionAccumRef = useRef(0);
  const detectedRef = useRef(false); // Prevent double-trigger
  const analyseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyseCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
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

  // Wave detected handler
  const onWaveDetected = useCallback(() => {
    if (detectedRef.current) return;
    detectedRef.current = true;
    stopCamera();
    setState("response");
    setTimeout(() => startLoading(), 1600);
  }, [stopCamera, startLoading]);

  // Frame analysis loop
  const analyseFrame = useCallback(() => {
    const video = videoRef.current;
    const ctx = analyseCtxRef.current;
    if (!video || !ctx || detectedRef.current) return;

    // Make sure video is actually playing
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(analyseFrame);
      return;
    }

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
        onWaveDetected();
        return;
      }
    }

    prevDataRef.current = new Uint8ClampedArray(data);
    rafRef.current = requestAnimationFrame(analyseFrame);
  }, [onWaveDetected]);

  // Start camera
  useEffect(() => {
    // ?intro=reset in URL clears the visited flag (for testing)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("intro") === "reset") {
        localStorage.removeItem("rdd_portfolio_visited");
      }
    }

    // Skip intro if already visited
    if (typeof window !== "undefined" && localStorage.getItem("rdd_portfolio_visited")) {
      setAlreadyVisited(true);
      return;
    }

    // Create analysis canvas
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 30;
    analyseCanvasRef.current = canvas;
    analyseCtxRef.current = canvas.getContext("2d", { willReadFrequently: true });

    const timer = setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } })
        .then((stream) => {
          streamRef.current = stream;
          const video = videoRef.current;
          if (!video) return;

          video.srcObject = stream;

          // Wait for video to be truly ready
          const onCanPlay = () => {
            video.play().then(() => {
              setVideoReady(true);
              setCamStatus("// wave your hand! \ud83d\udc4b");
              // Start analysis after a short delay to let camera stabilize
              setTimeout(() => {
                rafRef.current = requestAnimationFrame(analyseFrame);
              }, 300);
            }).catch(() => {
              setCamStatus("// camera error \u2014 use skip \u2197");
            });
          };

          if (video.readyState >= 3) {
            onCanPlay();
          } else {
            video.addEventListener("canplay", onCanPlay, { once: true });
          }
        })
        .catch(() => {
          setCamStatus("// camera blocked \u2014 use skip \u2197");
        });
    }, 500);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    stopCamera();
    setState("loading");
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
            Hey there \ud83d\udc4b
            <br />
            Try <em>waving your hand</em> to say hi
          </h1>
          <p className="i-sub">
            Your camera will detect the gesture &mdash; or use the skip button
            &nearr;
          </p>
          <div className="i-cam-outer">
            <div className="i-cam-ring">
              <video
                ref={videoRef}
                id="intro-video"
                autoPlay
                muted
                playsInline
                className={videoReady ? "on" : ""}
              />
            </div>
            <div className="i-cam-status" id="i-cam-status">
              {camStatus}
            </div>
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
          <span className="i-wave-emoji">\ud83d\udd90\ud83c\udffb</span>
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
            <span className="i-pct" id="i-pct">
              {progress}
            </span>
            <span className="i-pct-sym">%</span>
          </div>
          <div className="i-bar-track">
            <div
              className="i-bar-fill"
              id="i-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="i-load-msg" id="i-load-msg">
            {loadMsg}
          </div>
        </div>
      </div>

      {state === "entry" && !hidden && (
        <button id="intro-skip" onClick={handleSkip}>
          No camera? Tap here instead \ud83d\ude04
        </button>
      )}
    </>
  );
}
