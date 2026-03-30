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
];

/* ── Detection config ── */
const WAVE_THRESHOLD = 50;       // Higher threshold = less sensitive
const MOTION_DECAY = 0.82;
const SUSTAINED_MS = 2000;       // Must sustain motion for 2 seconds
const NO_WAVE_TIMEOUT = 12000;   // Show funny message after 12s of no wave
const CAMERA_STABILIZE_MS = 800; // Wait for camera to stabilize

export function IntroOverlay() {
  const [state, setState] = useState<IntroState>("entry");
  const [motionPct, setMotionPct] = useState(0);
  const [camStatus, setCamStatus] = useState("// requesting camera\u2026");
  const [progress, setProgress] = useState(0);
  const [loadMsg, setLoadMsg] = useState(LOAD_MSGS[0]);
  const [loadMsgFading, setLoadMsgFading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [noWaveMsg, setNoWaveMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionAccumRef = useRef(0);
  const detectedRef = useRef(false);
  const analyseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyseCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sustainedStartRef = useRef<number>(0);   // When sustained motion started
  const noWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (noWaveTimerRef.current) {
      clearTimeout(noWaveTimerRef.current);
      noWaveTimerRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    setState("loading");
    const DURATION = 4000; // Slightly longer for more playful feel
    const t0 = performance.now();
    let lastMsgIdx = -1;

    function tick(now: number) {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / DURATION);
      // More playful easing — fast start, slow middle, fast end
      let eased: number;
      if (p < 0.3) {
        eased = Math.round((p / 0.3) * 30); // 0-30% quick
      } else if (p < 0.7) {
        eased = Math.round(30 + ((p - 0.3) / 0.4) * 40); // 30-70% slow
      } else {
        eased = Math.round(70 + ((p - 0.7) / 0.3) * 30); // 70-100% quick
      }
      eased = Math.min(100, eased);
      setProgress(eased);

      const msgIdx = Math.min(
        LOAD_MSGS.length - 1,
        Math.floor((eased / 100) * LOAD_MSGS.length)
      );
      if (msgIdx !== lastMsgIdx) {
        lastMsgIdx = msgIdx;
        // Fade out old message, then fade in new one
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

  // Frame analysis loop with sustained motion requirement
  const analyseFrame = useCallback(() => {
    const video = videoRef.current;
    const ctx = analyseCtxRef.current;
    if (!video || !ctx || detectedRef.current) return;

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
          ? Math.min(100, motionAccumRef.current + diff * 1.4) // Slower accumulation
          : motionAccumRef.current * MOTION_DECAY;

      const pct = Math.round(motionAccumRef.current);
      setMotionPct(pct);

      // Check sustained motion above threshold
      if (motionAccumRef.current >= WAVE_THRESHOLD) {
        if (sustainedStartRef.current === 0) {
          // Motion just crossed threshold — start timing
          sustainedStartRef.current = performance.now();
          setCamStatus("// keep waving! hold it\u2026 \ud83d\udc4b");
        } else if (performance.now() - sustainedStartRef.current >= SUSTAINED_MS) {
          // Sustained for 2+ seconds — wave confirmed!
          onWaveDetected();
          return;
        }
      } else {
        // Motion dropped below threshold — reset sustained timer
        if (sustainedStartRef.current > 0) {
          sustainedStartRef.current = 0;
          setCamStatus("// almost! wave a bit longer \ud83d\udc4b");
        }
      }
    }

    prevDataRef.current = new Uint8ClampedArray(data);
    rafRef.current = requestAnimationFrame(analyseFrame);
  }, [onWaveDetected]);

  // Start camera
  useEffect(() => {
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

          const onCanPlay = () => {
            video.play().then(() => {
              setVideoReady(true);
              setCamStatus("// wave your hand! \ud83d\udc4b");
              // Wait for camera to stabilize before starting detection
              setTimeout(() => {
                rafRef.current = requestAnimationFrame(analyseFrame);

                // No-wave timeout: funny message after 12s
                noWaveTimerRef.current = setTimeout(() => {
                  if (!detectedRef.current) {
                    const msg = NO_WAVE_MSGS[Math.floor(Math.random() * NO_WAVE_MSGS.length)];
                    setNoWaveMsg(msg);
                    setState("nowave");
                    // Auto-continue to loading after showing the message
                    setTimeout(() => {
                      if (!detectedRef.current) {
                        detectedRef.current = true;
                        stopCamera();
                        startLoading();
                      }
                    }, 2500);
                  }
                }, NO_WAVE_TIMEOUT);
              }, CAMERA_STABILIZE_MS);
            }).catch((err) => {
              console.warn("Video play failed:", err);
              setCamStatus("// camera error — tap skip to continue ↗");
            });
          };

          if (video.readyState >= 3) {
            onCanPlay();
          } else {
            video.addEventListener("canplay", onCanPlay, { once: true });
            // Fallback if canplay never fires
            setTimeout(() => {
              if (!videoReady) {
                setCamStatus("// camera taking too long — tap skip ↗");
              }
            }, 5000);
          }
        })
        .catch((err) => {
          console.warn("Camera access failed:", err);
          setCamStatus("// camera not available — tap skip to enter ↗");
          // Auto-skip after 3s if camera fails
          setTimeout(() => {
            if (!detectedRef.current) {
              detectedRef.current = true;
              startLoading();
            }
          }, 3000);
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
    startLoading();
  };

  if (hidden || state === "done") return null;

  return (
    <>
      <div
        id="intro-overlay"
        className={exiting ? "i-exit" : undefined}
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
            Wave for 2 seconds — or use the skip button ↗
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

        {/* No Wave State — funny message */}
        <div
          className={`i-state${state === "nowave" ? " active" : ""}`}
          id="i-nowave"
        >
          <span className="i-nowave-emoji">\ud83e\udd37</span>
          <h2 className="i-resp-title">{noWaveMsg}</h2>
          <p className="i-resp-sub">// no worries, loading anyway\u2026</p>
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

        {/* Loading State — enhanced */}
        <div
          className={`i-state${state === "loading" ? " active" : ""}`}
          id="i-loading"
        >
          <div className="i-load-tag">// loading portfolio</div>

          {/* Playful spinner */}
          <div className="i-spinner">
            <div className="i-spinner-ring" />
            <div className="i-spinner-ring i-spinner-ring-2" />
            <div className="i-spinner-dot" />
          </div>

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
          <div
            className={`i-load-msg${loadMsgFading ? " swap" : ""}`}
            id="i-load-msg"
          >
            {loadMsg}
          </div>
        </div>
      </div>

      {(state === "entry" || state === "nowave") && (
        <button id="intro-skip" onClick={handleSkip}>
          No camera? Tap here instead \ud83d\ude04
        </button>
      )}
    </>
  );
}
