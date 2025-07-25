import React, { useEffect, useRef, useState } from "react";
import "./App.css";

/**
 * CYBERPUNK SNAKE – Polished Modern Aesthetic
 * - Neon, glass, glow, and animated cyberpunk visuals
 * - Ultra-harmonized UI/UX for immersion and visual punch
 */

// --- GAME CONSTANTS ---
const BOARD_SIZE = 14;
const CELL_SIZE = 18;
const INIT_SNAKE = [
  { x: 6, y: 7 },
  { x: 5, y: 7 },
  { x: 4, y: 7 }
];
const INIT_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 99;

const COLORS = {
  accent: "#FFD700",
  primary: "#00FF00",
  secondary: "#191D22",
  bg: "#0a0e18",
  grid: "#2ccfff99",
  board: "#131727",
  glowCyan: "#00ffff",
  glowPink: "#df00e0",
};

/** KEYBOARDS */
const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 }
};

// PUBLIC_INTERFACE
function App() {
  // STATE HOOKS
  const [snake, setSnake] = useState(INIT_SNAKE);
  const [direction, setDirection] = useState(INIT_DIRECTION);
  const [food, setFood] = useState(randomFood(INIT_SNAKE));
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // Refs for game loop
  const directionRef = useRef(direction);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);
  const snakeRef = useRef(snake);

  // Keep refs in sync
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);

  // Keyboard
  useEffect(() => {
    function handleKeyDown(e) {
      if (gameOver) return;
      const key = e.key;
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        if (running) setPaused(p => !p);
        return;
      }
      if (KEY_DIRECTIONS[key]) {
        e.preventDefault();
        const nd = KEY_DIRECTIONS[key];
        const { x, y } = directionRef.current;
        if ((x + nd.x !== 0 || y + nd.y !== 0) && (nd.x !== x || nd.y !== y)) {
          setDirection(nd);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener(
      "keydown",
      e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [gameOver]);

  useEffect(() => {
    if (!running || paused || gameOver) return;
    const interval = setInterval(step, GAME_SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [running, paused, gameOver, direction, snake]);

  function step() {
    if (!runningRef.current || pausedRef.current) return;
    const currentSnake = [...snakeRef.current];
    let head = { ...currentSnake[0] };
    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    // WRAP-AROUND (torus logic)
    if (head.x < 0) head.x = BOARD_SIZE - 1;
    else if (head.x >= BOARD_SIZE) head.x = 0;
    if (head.y < 0) head.y = BOARD_SIZE - 1;
    else if (head.y >= BOARD_SIZE) head.y = 0;

    // Self-collision
    if (collides(head, currentSnake)) {
      setRunning(false);
      setGameOver(true);
      return;
    }

    // Food
    let newSnake = [head, ...currentSnake];
    let ate = head.x === food.x && head.y === food.y;
    if (!ate) {
      newSnake.pop();
    } else {
      setScore(s => s + 1);
      setFood(randomFood(newSnake));
    }
    setSnake(newSnake);
  }

  // PUBLIC_INTERFACE
  function startGame() {
    setSnake(INIT_SNAKE);
    setDirection(INIT_DIRECTION);
    setFood(randomFood(INIT_SNAKE));
    setScore(0);
    setRunning(true);
    setGameOver(false);
    setPaused(false);
  }

  // PUBLIC_INTERFACE
  function pauseGame() { setPaused(true); }

  // PUBLIC_INTERFACE
  function resumeGame() { setPaused(false); }

  // PUBLIC_INTERFACE
  function restartGame() { startGame(); }

  // ---- Panel Corners & Animated Glow
  function CyberCorners() {
    return (
      <>
        <span className="cyber-corner cyber-corner-tl" />
        <span className="cyber-corner cyber-corner-tr" />
        <span className="cyber-corner cyber-corner-bl" />
        <span className="cyber-corner cyber-corner-br" />
      </>
    );
  }

  // --- Animated dynamic highlight ring for game area
  function AnimatedGlowFrame() {
    return (
      <div className="animated-cyber-glow" aria-hidden />
    );
  }

  // ---- Score subtitle panel
  function ScorePanel() {
    return (
      <div
        className="snake-score-panel neon-text drop-shadow"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "30px",
          width: "100%",
          marginBottom: 12,
          background: "rgba(13,19,39,0.67)",
          borderRadius: "12px",
          border: "1.5px solid var(--cyber-glow-cyan)",
          boxShadow: "0 0 7px 2px #00fff822"
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: "#00fff7",
            fontWeight: 900,
            textShadow: "0 0 12px #00fffaa7, 0 1px 7px #08e0d799"
          }}
          data-testid="snake-score"
        >
          ▷ SCORE: <span style={{ color: "#FFD700", fontWeight: 900 }}>{score}</span>
        </span>
        {running && !paused &&
          (<span style={{
            color: "#0ff",
            fontSize: 18,
            marginRight: 8,
            fontWeight: 800,
            textShadow: "0 0 3px #0ff, 0 0 7px var(--cyber-glow-cyan)"
          }}>Playing</span>)
        }
        {paused && running &&
          (<span style={{
            color: "#df00e0",
            fontSize: 18,
            marginRight: 8,
            fontWeight: 800,
            textShadow: "0 0 8px #df00e0"
          }}>Paused</span>)
        }
      </div>
    );
  }

  // ---- CONTROLS
  function ControlsPanel() {
    return (
      <div className="snake-control-panel neon-frost" style={{
        padding: "5px 0 6px 0",
        margin: "0 0 9px 0",
        borderRadius: "12px",
        display: "flex",
        flexWrap: "wrap",
        gap: "9px",
        justifyContent: "center"
      }}>
        {!running && !gameOver && (
          <button
            className="snake-btn snake-btn-accent neon-btn"
            onClick={startGame}
            data-testid="start-btn"
          >
            ▶ Start
          </button>
        )}
        {running && !paused && (
          <button
            className="snake-btn snake-btn-pause neon-btn"
            onClick={pauseGame}
            data-testid="pause-btn"
          >
            ⏸ Pause
          </button>
        )}
        {paused && (
          <button
            className="snake-btn snake-btn-continue neon-btn"
            onClick={resumeGame}
            data-testid="resume-btn"
          >
            ▶ Resume
          </button>
        )}
        {(gameOver || (paused && running)) && (
          <button
            className="snake-btn snake-btn-restart neon-btn"
            onClick={restartGame}
            data-testid="restart-btn"
          >
            🔄 Restart
          </button>
        )}
      </div>
    );
  }

  // ---- HELPER: game instructions block
  function ControlsHint() {
    return (
      <div
        style={{
          margin: "12px 0 0 0",
          fontSize: 14,
          color: "#bafff7",
          background: "linear-gradient(100deg, #1c2141 30%, #331f48 94%)",
          borderRadius: "8px",
          padding: "7px 18px 7px 16px",
          boxShadow: "0 0 7px #df00e088",
          opacity: 0.90,
          border: "1px solid #2339"
        }}>
        Controls: <b style={{ color: "#fff" }}>Arrow Keys</b> / <b style={{ color: "#fff" }}>WASD</b> &nbsp; | &nbsp;
        <span style={{ color: "#f34ef3" }}>[Space]</span> {running ? <b>for Pause</b> : <b>to Start!</b>}
        <br />
        <span style={{ color: "#bfc7e9", fontSize: 12 }}>Cyber tip: Press <span style={{ color: "#0ff" }}>Restart</span> any time.</span>
      </div>
    );
  }

  // --- Ultra-styled gameover overlay
  function GameOverModal() {
    if (!gameOver) return null;
    return (
      <div
        className="snake-game-over cyberpunk-heading"
        style={{
          background: "linear-gradient(120deg,#010516ee 59%,#350d409f 100%)",
          color: "#00fff9",
          borderRadius: 16,
          border: "3.5px solid #df00e0",
          fontSize: 33,
          fontWeight: 900,
          padding: 40,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-48%)",
          textShadow: "0 2px 28px #0ff8, 0 0 44px #df00e0c4, 0 2px 6px #fff",
          letterSpacing: 2,
          zIndex: 200,
          minWidth: "284px",
          boxShadow: "0 0 22px 7px #00feff77, 0 4px 74px #000c, 0 0 10px 3px #df00e0"
        }}
      >
        GAME OVER
        <br />
        <span style={{
          fontSize: 19,
          color: "#FFD700",
          marginTop: 9,
          fontWeight: 800,
        }}>Score: {score}</span>
      </div>
    );
  }

  // --- MAIN
  return (
    <div className="snake-app-root cyberpunk-bg" tabIndex={-1}>
      <div className="cyberpunk-panel-outer">
        <div className="cyberpunk-panel">
          <CyberCorners />
          <AnimatedGlowFrame />
          <div className="cyberpunk-panel-content" style={{
            width: BOARD_SIZE * CELL_SIZE + 32,
            maxWidth: "99vw",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px"
          }}>
            <h1 className="cyberpunk-heading glow-anim"
              style={{
                fontSize: "2.7rem",
                margin: "2px 0 11px 0",
                letterSpacing: "3px",
                fontWeight: 900,
                fontFamily: `'Orbitron', 'Fira Mono', monospace, 'Consolas'`
              }}
            >
              <span style={{
                color: "#FFD700",
                textShadow: "0 0 11px #FFD700, 0 0 22px #df00e0a6",
                fontWeight: 900,
                letterSpacing: 5,
                fontFamily: 'Orbitron, monospace'
              }}>
                CYBERPUNK
              </span>
              <span style={{
                marginLeft: 12,
                color: "#0ff",
                fontWeight: 800,
                textShadow: "0 0 8px #00ffff, 0 0 18px #fffccd69",
                letterSpacing: 3,
                fontFamily: 'Orbitron, monospace'
              }}>
                SNAKE
              </span>
            </h1>
            <div className="cyberpunk-stripes" />
            <ScorePanel />
            <ControlsPanel />
            <ControlsHint />
            <div className="snake-game-area-outer" style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "100vw",
              minHeight: "0",
              minWidth: "0",
              overflow: "hidden",
              flex: "1 1 auto",
              margin: "22px 0 8px 0",
              position: "relative"
            }}>
              <SnakeCanvas
                width={BOARD_SIZE * CELL_SIZE}
                height={BOARD_SIZE * CELL_SIZE}
                snake={snake}
                food={food}
                running={running}
                retro={true}
                cellSize={CELL_SIZE}
                colors={COLORS}
                gameOver={gameOver}
              />
              <GameOverModal />
            </div>
          </div>
        </div>
      </div>
      <footer style={{
        color: "#79e9f3f0",
        fontSize: 15,
        margin: "38px auto 9px auto",
        letterSpacing: 1.2,
        textAlign: "center",
        fontWeight: 800,
        fontFamily: "Fira Mono, 'Orbitron', Consolas, monospace",
        textShadow: "0 0 8px #00fff975, 0 0 3px #0ff8"
      }}>
        <span>
          <span role="img" aria-label="snake">🐍</span>{" "}
          <span style={{ color: "#df00e0", fontWeight: 700, textShadow: "0 0 12px #fff" }}>
            CYBERPUNK SNAKE <span style={{ color: "#FFD700" }}>2024</span>
          </span>
        </span>
      </footer>
    </div>
  );
}

/**
 * Render a segmented, mechanical cyberpunk snake with neon joints, metallic effects, cables, and pulsing digital panels.
 */
function SnakeCanvas({
  width,
  height,
  snake,
  food,
  running,
  retro,
  cellSize,
  colors,
  gameOver
}) {
  const canvasRef = useRef();

  // Animate pulse for joints (cyberpunk glowing ping)
  const [animT, setAnimT] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf;
    const update = t => {
      setAnimT(Date.now() % 1800 / 1800); // 0-1
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => raf && cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, width, height);
    drawCyberGrid(ctx, width, height, cellSize, colors);

    // --- DRAW SNAKE SEGMENTS WITH CYBER EFFECTS (tail → head) ---
    for (let idx = snake.length - 1; idx >= 0; idx--) {
      const segment = snake[idx];
      const px = segment.x * cellSize;
      const py = segment.y * cellSize;

      ctx.save();

      // --- CYBERPUNK SEGMENT: metallic steel, panel lines, circuit patterns, inner digital glow ---
      // Base metallic gradient
      let baseGrad = ctx.createLinearGradient(px, py, px + cellSize, py + cellSize);
      baseGrad.addColorStop(0, "#28323a");
      baseGrad.addColorStop(0.18, "#23272c");
      baseGrad.addColorStop(0.4, idx % 2 === 0 ? "#555873" : "#272a36");
      baseGrad.addColorStop(0.55, "#7d8b96");
      baseGrad.addColorStop(0.77, "#5ee6ff36");
      baseGrad.addColorStop(0.98, "#232944");

      ctx.beginPath();
      ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.08, 0, Math.PI*2);
      ctx.closePath();
      ctx.fillStyle = baseGrad;
      ctx.shadowColor = "#19b8fb22";
      ctx.shadowBlur = 9;
      ctx.fill();

      // Steel cyber-circuit lines
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = "#dff3ff71";
      ctx.lineWidth = 2.2;
      for (let l=1; l<=2; l++) {
        ctx.beginPath();
        ctx.moveTo(px + 4, py + l*cellSize/3.5);
        ctx.lineTo(px + cellSize - 5, py + l*cellSize/3.35);
        ctx.stroke();
      }
      ctx.restore();

      // Panel rectangle/circuit display with moving "digital effect"
      ctx.save();
      ctx.globalAlpha = 0.16 + 0.17 * Math.sin(animT * 2 * Math.PI + idx);
      ctx.fillStyle = idx % 3 === 0 ? "#00ffea19" : "#56ffe726";
      ctx.fillRect(px + cellSize/4, py + cellSize/2.7, cellSize/2.2, cellSize/4.3);
      if (idx % 2 === 1) {
        ctx.globalAlpha = 0.17 + 0.18*(1-Math.abs(Math.sin(animT * Math.PI + idx)));
        ctx.strokeStyle = "#91f8ff54";
        ctx.lineWidth = 1.15;
        ctx.strokeRect(px + cellSize/4, py + cellSize/2.7, cellSize/2.2, cellSize/4.3);
      }
      ctx.restore();

      // Cable accents (visual cable-line overlays)
      ctx.save();
      ctx.globalAlpha = 0.23;
      ctx.beginPath();
      ctx.strokeStyle = idx % 2 === 0 ? "#88fbff" : "#00fbff";
      ctx.moveTo(px+cellSize*0.24, py+cellSize*0.22);
      ctx.bezierCurveTo(px+cellSize*0.32, py+cellSize*0.57, px+cellSize*0.85, py+cellSize*0.30, px+cellSize*0.76, py+cellSize*0.78);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // --- SEGMENT JOINT: glowing neon ring at front edge (unless it's head) ---
      if (idx !== 0) {
        ctx.save();
        let jointPulse = 0.36 + 0.39 * Math.abs(Math.sin(animT * 2 * Math.PI + idx * 0.66));
        let jointGlowGrad = ctx.createRadialGradient(
          px + cellSize/2, py + cellSize/2, cellSize/4 - 2,
          px + cellSize/2, py + cellSize/2, cellSize/2.24
        );
        jointGlowGrad.addColorStop(0, idx % 2 === 0 ? colors.glowCyan : colors.glowPink);
        jointGlowGrad.addColorStop(0.55, "#0000");
        ctx.globalAlpha = 0.74 * jointPulse;
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.16, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = jointGlowGrad;
        ctx.lineWidth = 4.6 + 2.1 * jointPulse;
        ctx.shadowColor = idx % 2 === 0 ? colors.glowCyan : colors.glowPink;
        ctx.shadowBlur = 13+13*jointPulse;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Precise steel segment rim
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = "#b8e6fd";
      ctx.beginPath();
      ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.06, 0, Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();

      // Cyber steel glint
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(px + cellSize/2 + 2, py + cellSize/2 - 3, cellSize/5, Math.PI*0.15, Math.PI*1.3);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.restore();

      // PULSING GLOW AT TIP, if it's the tail
      if (idx === snake.length-1) {
        ctx.save();
        let pulse = 0.4 + 0.25*Math.abs(Math.sin(animT*2*Math.PI));
        let neonPulse = ctx.createRadialGradient(
          px+cellSize/2, py+cellSize/2, 2,
          px+cellSize/2, py+cellSize/2, cellSize/2+2
        );
        neonPulse.addColorStop(0, "#00fdffdb");
        neonPulse.addColorStop(0.17, idx%2===0?colors.glowCyan:colors.glowPink);
        neonPulse.addColorStop(0.55, "#07073231");
        neonPulse.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.36 + 0.23 * pulse;
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2 + 4 +2*pulse, 0, Math.PI*2);
        ctx.fillStyle = neonPulse;
        ctx.shadowColor = "#00fff884";
        ctx.shadowBlur = 13+11*pulse;
        ctx.filter = "blur(1.3px)";
        ctx.fill();
        ctx.filter = "none";
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // If it's head, cyberpunk head with glowing neon aura & LED panels
      if (idx === 0) {
        // Neon head "aura"
        ctx.save();
        let haloGrad = ctx.createRadialGradient(
          px + cellSize/2, py + cellSize/2, 2,
          px + cellSize/2, py + cellSize/2, cellSize*0.82
        );
        haloGrad.addColorStop(0, "#fff9");
        haloGrad.addColorStop(0.17, colors.glowCyan+"b3");
        haloGrad.addColorStop(0.49, colors.glowPink+"31");
        haloGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.62;
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize*0.80, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = haloGrad;
        ctx.filter = "blur(2.2px)";
        ctx.fill();
        ctx.filter = "none";
        ctx.globalAlpha = 1;
        ctx.restore();

        // Head metallic
        ctx.save();
        let grad = ctx.createLinearGradient(px, py, px+cellSize, py+cellSize);
        grad.addColorStop(0.01, "#fff2");
        grad.addColorStop(0.13, "#afd1ff");
        grad.addColorStop(0.4, "#0feeff");
        grad.addColorStop(0.93, "#333f55");
        grad.addColorStop(1, "#0ef6c6");
        ctx.beginPath();
        ctx.arc(px+cellSize/2, py+cellSize/2, cellSize/2.04, 0, Math.PI*2);
        ctx.closePath();
        ctx.shadowColor = "#2afcff";
        ctx.shadowBlur = 15;
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Robo mouth grill
        ctx.save();
        ctx.globalAlpha = 0.34;
        ctx.strokeStyle = "#b8e3fd";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + cellSize/2.6, py + cellSize/1.38);
        ctx.lineTo(px + cellSize/1.45, py + cellSize/1.38);
        ctx.stroke();
        ctx.restore();

        // Robo face stripe
        ctx.save();
        ctx.globalAlpha = 0.49;
        ctx.fillStyle = "#00dfff52";
        ctx.fillRect(px + cellSize*0.34, py + cellSize*0.59, cellSize*0.39, cellSize*0.17);
        ctx.restore();

        // Neon eye
        ctx.save();
        let epx = px + cellSize/2 + 3, epy = py + cellSize/2 - 4;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(epx,epy,2.1,0,Math.PI*2);
        ctx.closePath();
        ctx.fillStyle="#ffffff";
        ctx.shadowColor = "#00eaff";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();

        // Side cyber panel
        ctx.save();
        ctx.globalAlpha = 0.46;
        ctx.fillStyle = "#15ffe590";
        ctx.fillRect(px + 0.30*cellSize, py + 0.39*cellSize, cellSize*0.11, cellSize*0.30);
        ctx.restore();

        ctx.restore();
      }
    }

    // Food (neon apple)
    drawNeonFood(ctx, food, cellSize, colors);

    // Game over overlay
    if (gameOver) {
      ctx.save();
      ctx.globalAlpha = 0.64;
      ctx.fillStyle = "#1b001a";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }, [snake, food, width, height, retro, gameOver, colors, animT, running]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="snake-canvas snake-cyber-snake"
      style={{
        margin: "0 auto",
        background: colors.board,
        maxWidth: "min(97vw, 100%)",
        borderRadius: 16,
        outline: `3px solid ${colors.secondary}`,
        imageRendering: "pixelated",
        boxShadow: "0 0 44px 2px #00fff954, 0 0 206px 7px #df00e09b inset"
      }}
      tabIndex={-1}
      aria-label="Snake Game Area"
    />
  );
}

// Helper: Draw cyberpunk neon grid (with some animated color flicker in pinks/cyan)
function drawCyberGrid(ctx, width, height, cellSize, colors) {
  ctx.save();
  ctx.setLineDash([1.7, 5.7]); // glitchy dash
  ctx.lineWidth = 1.1;
  for (let x = 0; x <= width; x += cellSize) {
    ctx.strokeStyle = Math.random() > 0.83
      ? colors.glowPink : colors.grid;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += cellSize) {
    ctx.strokeStyle = Math.random() > 0.82
      ? colors.glowCyan : colors.grid;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

// Helper: Neon apple/food rendering
function drawNeonFood(ctx, food, cellSize, colors) {
  const x = food.x * cellSize;
  const y = food.y * cellSize;
  ctx.save();
  // Main dot
  let grad = ctx.createRadialGradient(
    x + cellSize/2, y + cellSize/2, 2,
    x + cellSize/2, y + cellSize/2, cellSize/2
  );
  grad.addColorStop(0, "#fffcc1");
  grad.addColorStop(0.23, colors.accent);
  grad.addColorStop(0.48, "#ff4932");
  grad.addColorStop(1, "#ff149366");
  ctx.beginPath();
  ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize/3, 0, Math.PI*2);
  ctx.closePath();
  ctx.shadowColor = "#ff37eee8";
  ctx.shadowBlur = 18;
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.97;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;

  // Highlight
  ctx.beginPath();
  ctx.arc(x + cellSize / 2.7, y + cellSize / 2.7, 2.7, 0, Math.PI*2);
  ctx.closePath();
  ctx.globalAlpha = 0.68;
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.globalAlpha = 1;

  // Subtle glowing drop shadow
  ctx.shadowColor="#FFD700cc";
  ctx.shadowBlur=6;
  ctx.globalAlpha = 0.34;
  ctx.fillRect(x + cellSize/2-2, y + cellSize/2-2, 5, 5);
  ctx.globalAlpha=1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

// PUBLIC_INTERFACE
function randomFood(snake) {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
  } while (collides(newFood, snake));
  return newFood;
}
function collides(pos, arr) {
  return arr.some(seg => seg.x === pos.x && seg.y === pos.y);
}

export default App;
