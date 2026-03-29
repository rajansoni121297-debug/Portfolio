"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Cell = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const WIN_PATHS: Record<string, string> = {
  "012": "M 10,50 C 100,48 200,52 290,50",
  "345": "M 10,150 C 100,148 200,152 290,150",
  "678": "M 10,250 C 100,248 200,252 290,250",
  "036": "M 50,10 C 48,100 52,200 50,290",
  "147": "M 150,10 C 148,100 152,200 150,290",
  "258": "M 250,10 C 248,100 252,200 250,290",
  "048": "M 12,12 C 80,80 200,200 288,288",
  "246": "M 288,12 C 220,80 100,200 12,288",
};

const diffLabels: Record<Difficulty, string> = {
  easy: "Intern",
  medium: "Senior",
  hard: "Art Director",
};

function checkWinner(
  b: Cell[]
): { winner: "X" | "O" | "draw"; combo?: number[] } | null {
  for (const [a, b2, c] of LINES) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
      return { winner: b[a]!, combo: [a, b2, c] };
    }
  }
  if (b.every((c) => c !== null)) return { winner: "draw" };
  return null;
}

function minimax(board: Cell[], depth: number, isMax: boolean): number {
  const res = checkWinner(board);
  if (res) {
    if (res.winner === "O") return 10 - depth;
    if (res.winner === "X") return depth - 10;
    return 0;
  }
  const scores = board
    .map((c, i) => {
      if (c !== null) return null;
      const copy = [...board];
      copy[i] = isMax ? "O" : "X";
      return minimax(copy, depth + 1, !isMax);
    })
    .filter((s) => s !== null) as number[];
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

function getAIMove(board: Cell[], difficulty: Difficulty): number {
  const empty = board
    .map((c, i) => (c === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  if (difficulty === "easy") {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  if (difficulty === "medium" && Math.random() > 0.62) {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Hard: always minimax, Medium: 62% minimax
  let best = -Infinity;
  let bestMove = empty[0];
  for (const i of empty) {
    const copy = [...board];
    copy[i] = "O";
    const score = minimax(copy, 0, false);
    if (score > best) {
      best = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function drawMark(cell: HTMLElement, mark: "X" | "O") {
  const svg = cell.querySelector("svg");
  if (!svg) return;

  if (mark === "X") {
    svg.innerHTML = `
      <path d="M8,9 C16,17 36,36 53,52" class="ttt-mark" stroke="#C8993A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M7,10 C15,18 35,37 52,53" class="ttt-mark" stroke="rgba(200,153,58,0.2)" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M53,9 C45,17 25,36 8,52" class="ttt-mark2" stroke="#C8993A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M54,10 C46,18 26,37 9,53" class="ttt-mark2" stroke="rgba(200,153,58,0.2)" stroke-width="10" stroke-linecap="round" fill="none"/>
    `;
  } else {
    svg.innerHTML = `
      <path d="M30,5 C46,5 56,14 57,30 C58,46 48,57 30,57 C12,57 3,46 3,30 C3,14 13,5 28,5" class="ttt-mark" stroke="rgba(240,237,230,0.85)" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    `;
  }
}

function clearMarks(container: HTMLElement) {
  const cells = container.querySelectorAll(".ttt-cell svg");
  cells.forEach((svg) => {
    svg.innerHTML = "";
  });
}

export function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [scores, setScores] = useState({ you: 0, ai: 0 });
  const [aiThinking, setAiThinking] = useState(false);
  const [statusText, setStatusText] = useState("Your move \u2014 you\u2019re X");
  const [statusClass, setStatusClass] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const cellsRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const winLineRef = useRef<SVGPathElement>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const youScoreRef = useRef<HTMLSpanElement>(null);
  const aiScoreRef = useRef<HTMLSpanElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Keep board state in ref for async AI callbacks
  const boardStateRef = useRef(board);
  boardStateRef.current = board;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;

  const animateWinLine = useCallback((combo: number[]) => {
    const key = combo.join("");
    const path = WIN_PATHS[key];
    if (!path || !winLineRef.current) return;

    const el = winLineRef.current;
    el.setAttribute("d", path);
    el.style.display = "block";
    const len = el.getTotalLength?.() || 400;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 0.5s ease";
      el.style.strokeDashoffset = "0";
    });
  }, []);

  const hideWinLine = useCallback(() => {
    if (winLineRef.current) {
      winLineRef.current.style.display = "none";
      winLineRef.current.style.transition = "none";
      winLineRef.current.removeAttribute("d");
    }
  }, []);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setAiThinking(false);
    setStatusText("Your move \u2014 you\u2019re X");
    setStatusClass("");
    setCountdown(null);
    hideWinLine();
    if (boardRef.current) {
      boardRef.current.classList.remove("win-shake");
    }
    if (cellsRef.current) {
      clearMarks(cellsRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [hideWinLine]);

  const startCountdown = useCallback(() => {
    let c = 3;
    setCountdown(c);
    countdownTimerRef.current = setInterval(() => {
      c--;
      if (c <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        reset();
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [reset]);

  const bumpScore = useCallback((ref: React.RefObject<HTMLSpanElement | null>) => {
    if (ref.current) {
      ref.current.classList.add("bump");
      setTimeout(() => ref.current?.classList.remove("bump"), 400);
    }
  }, []);

  const burstConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#C8993A", "#E8B84B", "rgba(240,237,230,0.8)", "#A0751E"];
    const count = 40 + Math.floor(Math.random() * 21); // 40-60
    const particles = Array.from({ length: count }, () => ({
      x: 150 + (Math.random() - 0.5) * 40,
      y: 150 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 8,
      vy: -2 - Math.random() * 6,
      gravity: 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
    }));

    let frame = 0;
    const maxFrames = 60;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, 300, 300);

      if (frame > maxFrames) {
        ctx.clearRect(0, 0, 300, 300);
        return;
      }

      const alpha = 1 - frame / maxFrames;

      for (const p of particles) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life++;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const endGame = useCallback(
    (
      msg: string,
      result: "" | "win" | "lose" | "draw",
      combo: number[] | null
    ) => {
      setGameOver(true);
      setStatusText(msg);
      setStatusClass(result);

      if (combo) {
        animateWinLine(combo);
        if (boardRef.current) {
          boardRef.current.classList.add("win-shake");
        }
      }

      startCountdown();
    },
    [animateWinLine, startCountdown]
  );

  const aiMove = useCallback(
    (currentBoard: Cell[]) => {
      setAiThinking(true);
      setStatusText("AI is thinking\u2026");
      const delay = 400 + Math.random() * 600;

      setTimeout(() => {
        if (!gameOverRef.current) {
          const idx = getAIMove(currentBoard, difficulty);
          if (idx === -1) {
            setAiThinking(false);
            return;
          }

          const newBoard = [...currentBoard];
          newBoard[idx] = "O";
          setBoard(newBoard);

          // Draw mark via DOM
          if (cellsRef.current) {
            const cell = cellsRef.current.querySelector(
              `.ttt-cell[data-i="${idx}"]`
            ) as HTMLElement;
            if (cell) drawMark(cell, "O");
          }

          const res = checkWinner(newBoard);
          if (res) {
            if (res.winner === "draw") {
              endGame("Draw \u2014 rematch starting\u2026", "draw", null);
            } else {
              setScores((s) => ({ ...s, ai: s.ai + 1 }));
              bumpScore(aiScoreRef);
              endGame("AI wins. Rematch in\u2026", "lose", res.combo || null);
            }
          } else {
            setStatusText("Your move \u2014 you\u2019re X");
          }
        }
        setAiThinking(false);
      }, delay);
    },
    [difficulty, endGame, bumpScore]
  );

  const handleCell = useCallback(
    (idx: number) => {
      if (gameOver || board[idx] || aiThinking) return;

      const newBoard = [...board];
      newBoard[idx] = "X";
      setBoard(newBoard);

      // Draw mark via DOM
      if (cellsRef.current) {
        const cell = cellsRef.current.querySelector(
          `.ttt-cell[data-i="${idx}"]`
        ) as HTMLElement;
        if (cell) drawMark(cell, "X");
      }

      const res = checkWinner(newBoard);
      if (res) {
        if (res.winner === "draw") {
          endGame("Draw \u2014 rematch starting\u2026", "draw", null);
        } else {
          setScores((s) => ({ ...s, you: s.you + 1 }));
          bumpScore(youScoreRef);
          burstConfetti();
          endGame("You win! Rematch in\u2026", "win", res.combo || null);
        }
        return;
      }
      aiMove(newBoard);
    },
    [board, gameOver, aiThinking, endGame, aiMove, bumpScore, burstConfetti]
  );

  // Cursor labels for cells, reset button, diff buttons
  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;

    const elements: HTMLElement[] = [];

    // Cells
    if (cellsRef.current) {
      const cells = cellsRef.current.querySelectorAll<HTMLElement>(".ttt-cell");
      cells.forEach((el) => elements.push(el));
    }

    // Reset button + diff buttons
    const resetBtn = document.getElementById("ttt-reset");
    if (resetBtn) elements.push(resetBtn);

    const diffBtns = document.querySelectorAll<HTMLElement>(".ttt-diff-btn");
    diffBtns.forEach((el) => elements.push(el));

    elements.forEach((el) => {
      setCursor(el, "");
    });
  }, [board, difficulty]);

  // Difficulty button magnetic effect
  useEffect(() => {
    const btns = document.querySelectorAll<HTMLElement>(".ttt-diff-btn");

    const handlers: Array<{
      el: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }> = [];

    btns.forEach((btn) => {
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.12}px)`;
      };
      const onLeave = () => {
        btn.style.transform = "translate(0, 0)";
      };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      handlers.push({ el: btn, move: onMove, leave: onLeave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleDiffChange = (d: Difficulty) => {
    setDifficulty(d);
    reset();
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast("// Difficulty: " + diffLabels[d]);
    }
  };

  return (
    <div className="ttt">
      {/* Header with difficulty buttons */}
      <div className="ttt-header">
        <div className="ttt-diff">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={`ttt-diff-btn${difficulty === d ? " active" : ""}`}
              data-diff={d}
              onClick={() => handleDiffChange(d)}
            >
              {diffLabels[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Scene */}
      <div className="ttt-scene">
        <canvas
          ref={confettiCanvasRef}
          width={300}
          height={300}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 300,
            height: 300,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
        <div
          className="ttt-board-3d"
          id="ttt-board-3d"
          ref={boardRef}
        >
          <svg
            className="ttt-grid-svg"
            viewBox="0 0 300 300"
            fill="none"
          >
            {/* Hand-drawn grid lines */}
            <path
              d="M100,6 C101,80 99,180 100,294"
              stroke="var(--gold-line)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M200,6 C199,80 201,180 200,294"
              stroke="var(--gold-line)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M6,100 C80,99 180,101 294,100"
              stroke="var(--gold-line)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M6,200 C80,201 180,199 294,200"
              stroke="var(--gold-line)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Win line */}
            <path
              id="ttt-win-line"
              ref={winLineRef}
              stroke="var(--gold)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{ display: "none" }}
            />
          </svg>
        </div>

        <div className="ttt-cells" id="ttt-cells" ref={cellsRef}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="ttt-cell"
              data-i={i}
              onClick={() => handleCell(i)}
            >
              <svg viewBox="0 0 60 60" fill="none" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="ttt-footer">
        <span
          id="ttt-status"
          className={`ttt-status${statusClass ? " " + statusClass : ""}`}
        >
          {statusText}
        </span>
        <button
          id="ttt-reset"
          className="ttt-reset"
          onClick={() => {
            setScores({ you: 0, ai: 0 });
            reset();
          }}
        >
          &#8634; Reset
        </button>
        {countdown !== null && (
          <span className="ttt-countdown">
            <svg viewBox="0 0 30 30" width="30" height="30">
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="none"
                stroke="var(--gold-line)"
                strokeWidth="2"
                opacity="0.3"
              />
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeDasharray="75"
                strokeDashoffset={75 - (75 * countdown) / 3}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 1s linear",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>
            <span className="ttt-countdown-num">{countdown}</span>
          </span>
        )}
      </div>

      {/* Score */}
      <div className="ttt-score">
        <div className="ttt-score-item you">
          <span className="ttt-score-num" ref={youScoreRef}>
            {scores.you}
          </span>
          <span className="ttt-score-label">You</span>
        </div>
        <span className="ttt-score-vs">vs</span>
        <div className="ttt-score-item ai">
          <span className="ttt-score-num" ref={aiScoreRef}>
            {scores.ai}
          </span>
          <span className="ttt-score-label">AI</span>
        </div>
      </div>
    </div>
  );
}
