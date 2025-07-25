import React, { useEffect, useRef, useState } from "react";
import "./App.css";

/**
 * Retro-Style Snake Game App (CYBERPUNK view)
 * Upgrades: "realistic" snake with gradients & glow, cyberpunk display, scanlines, neon borders
 */

// GAME CONFIG
const BOARD_SIZE = 14;
const CELL_SIZE = 15;
const INIT_SNAKE = [
  { x: 6, y: 7 },
  { x: 5, y: 7 },
  { x: 4, y: 7 }
];
const INIT_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 105;

const COLORS = {
  accent: "#FFD700",
  primary: "#00FF00",
  secondary: "#000000",
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
  function pauseGame() {
    setPaused(true);
  }

  // PUBLIC_INTERFACE
  function resumeGame() {
    setPaused(false);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    startGame();
  }

  // ==== CYBERPUNK PANEL DECOR ====
  function CyberCorners() {
    // Four SVG/outline accent corners
    return (
      <>
        <span className="cyber-corner cyber-corner-tl" />
        <span className="cyber-corner cyber-corner-tr" />
        <span className="cyber-corner cyber-corner-bl" />
        <span className="cyber-corner cyber-corner-br" />
      </>
    );
  }

  return (
    <div
      className="snake-app-root"
      style={{
        background: COLORS.bg
      }}
      tabIndex={-1}
    >
      <div className="cyberpunk-panel-outer">
        <div className="cyberpunk-panel">
          <CyberCorners />
          <div className="cyberpunk-stripes" />
          <div
            className="snake-ui-panel"
            style={{
              width: BOARD_SIZE * CELL_SIZE + 32,
              maxWidth: "98vw",
              marginBottom: 20,
              background: "transparent",
              border: "none",
              borderRadius: 16,
              boxShadow: "none",
              padding: 0,
              marginTop: 0,
              marginLeft: "auto", marginRight: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <h1 className="cyberpunk-heading" style={{
              fontSize: 32,
              margin: 0,
              marginBottom: 10,
              letterSpacing: "2px",
              fontWeight: 900
            }}>
              CYBERPUNK SNAKE
            </h1>
            <div
              className="snake-score-panel"
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 9
              }}
            >
              <span
                style={{
                  fontSize: 19,
                  color: "#00fff7",
                  fontWeight: 800,
                  textShadow: "0 0 8px #0ff, 0 1px 7px #08e0d799"
                }}
                data-testid="snake-score"
              >
                Score: {score}
              </span>
              {running && !paused && (
                <span style={{
                  color: COLORS.accent,
                  fontSize: 15,
                  fontWeight: 700,
                  marginLeft: 10
                }}>
                  Playing ⏩
                </span>
              )}
              {paused && running && (
                <span style={{
                  color: COLORS.glowPink,
                  fontSize: 16,
                  fontWeight: 700,
                  marginLeft: 10
                }}>
                  Paused ⏸
                </span>
              )}
            </div>
            <div className="snake-control-panel" style={{ marginBottom: 8 }}>
              {!running && !gameOver && (
                <button
                  className="snake-btn snake-btn-accent"
                  style={buttonStyle()}

                  onClick={startGame}
                  data-testid="start-btn"
                >
                  ▶ Start
                </button>
              )}
              {running && !paused && (
                <button
                  className="snake-btn snake-btn-pause"
                  style={buttonStyle("#000", COLORS.glowCyan)}
                  onClick={pauseGame}
                  data-testid="pause-btn"
                >
                  ⏸ Pause
                </button>
              )}
              {paused && (
                <button
                  className="snake-btn snake-btn-continue"
                  style={buttonStyle("#000", COLORS.primary)}
                  onClick={resumeGame}
                  data-testid="resume-btn"
                >
                  ▶ Resume
                </button>
              )}
              {(gameOver || (paused && running)) && (
                <button
                  className="snake-btn snake-btn-restart"
                  style={buttonStyle("#fff", COLORS.glowPink)}
                  onClick={restartGame}
                  data-testid="restart-btn"
                >
                  🔄 Restart
                </button>
              )}
            </div>
            <div style={{
              margin: "6px 0 0 0",
              fontSize: 13,
              color: "#aeeaff"
            }}>
              Controls: Arrow Keys or WASD<br />
              {running ? "Press [Space] to Pause" : "Press Start to Play"}
            </div>
          </div>
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
            marginTop: 18
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
          </div>
          {gameOver && (
            <div
              className="snake-game-over"
              style={{
                background: "rgba(0,0,0,0.76)",
                color: COLORS.glowCyan,
                borderRadius: 12,
                fontSize: 26,
                fontWeight: 800,
                padding: 26,
                position: "absolute",
                top: "35%",
                left: "53%",
                transform: "translate(-50%,-38%)",
                textShadow: "0 2px 8px #000, 0 0 14px #14ffff"
              }}
            >
              GAME OVER
              <br />
              <span style={{ fontSize: 16, color: "#fff", marginTop: 8 }}>
                Your score: {score}
              </span>
            </div>
          )}
        </div>
      </div>
      <footer style={{
        color: "#97fff1e0",
        fontSize: 13,
        marginTop: 29,
        letterSpacing: 1,
        textAlign: "center"
      }}>
        <span>
          <span role="img" aria-label="snake">🐍</span> CYBERPUNK Snake Game &copy; 2024
        </span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
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

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    // BG
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, width, height);

    // GLITCHED retro grid
    drawCyberGrid(ctx, width, height, cellSize, colors);

    // SNAKE: draw body first (then head), with "rounded/gradient" effects
    snake.forEach((segment, idx) => {
      let px = segment.x * cellSize;
      let py = segment.y * cellSize;
      // --- BODY ---

      if (idx === 0) {
        // HEAD
        ctx.save();

        // Neon head "halo"
        let haloGrad = ctx.createRadialGradient(
          px + cellSize/2,
          py + cellSize/2,
          2,
          px + cellSize/2,
          py + cellSize/2,
          cellSize*0.74
        );
        haloGrad.addColorStop(0, "#fff8");
        haloGrad.addColorStop(0.2, colors.glowCyan+"cc");
        haloGrad.addColorStop(0.6, colors.glowPink+"22");
        haloGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize*0.74, 0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = haloGrad;
        ctx.filter = "blur(2px)";
        ctx.fill();
        ctx.filter = "none";
        ctx.globalAlpha = 1;

        // HEAD main fill (gradient for 3D-shaded look, neon)
        let grad = ctx.createLinearGradient(px, py, px+cellSize, py+cellSize);
        grad.addColorStop(0.02, "#fff2");
        grad.addColorStop(0.23, colors.accent);
        grad.addColorStop(0.54, "#ffe600");
        grad.addColorStop(0.73, "#e7d400");
        grad.addColorStop(1, "#00ffc6");
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.1, 0, Math.PI*2);
        ctx.closePath();
        ctx.shadowColor = colors.glowCyan;
        ctx.shadowBlur = 16;
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowBlur = 0;

        // "Shiny eye" pixel
        ctx.beginPath();
        ctx.arc(px + cellSize/2 + 3, py + cellSize/2 - 3, 2.2, 0, Math.PI*2);
        ctx.closePath();
        ctx.globalAlpha = 0.63;
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();
      } else if (idx === snake.length - 1) {
        // TAIL: rounded with neon border and subtle shadow
        ctx.save();

        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.25, 0, Math.PI*2);
        ctx.closePath();

        // Gradient for tail (darker at tip)
        let gradTail = ctx.createLinearGradient(px, py, px+cellSize, py+cellSize);
        gradTail.addColorStop(0.04, "#484b17b1");
        gradTail.addColorStop(0.55, "#00fa51");
        gradTail.addColorStop(0.83, "#00ffc666");
        gradTail.addColorStop(1, "#060");
        ctx.fillStyle = gradTail;
        ctx.shadowColor = colors.glowPink;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#23f0f9";
        ctx.globalAlpha = 0.64;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        // BODY SECTION: rounded-off squares with gradient and subtle glow
        ctx.save();
        let bodyGrad = ctx.createLinearGradient(px, py, px+cellSize, py+cellSize);
        bodyGrad.addColorStop(0.04, "#1cd0ae");
        bodyGrad.addColorStop(0.28, colors.primary);
        bodyGrad.addColorStop(0.8, "#aaffe9aa");
        bodyGrad.addColorStop(1, "#ddddff22");
        ctx.beginPath();
        ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/2.16, 0, Math.PI*2);
        ctx.closePath();
        ctx.shadowColor = "#00ffd2cc";
        ctx.shadowBlur = 7;
        ctx.fillStyle = bodyGrad;
        ctx.globalAlpha = 0.97;
        ctx.fill();

        // Add pixel border for "segment"
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#00ffc640";
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    });

    // FOOD (pixel neon apple)
    drawNeonFood(ctx, food, cellSize, colors);

    // Game over overlay
    if (gameOver) {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.fillStyle = "#1b001a";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }, [snake, food, width, height, retro, gameOver, colors]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="snake-canvas"
      style={{
        margin: "0 auto",
        background: colors.board,
        maxWidth: "min(97vw, 100%)",
        borderRadius: 13,
        outline: `3px solid ${colors.secondary}`,
        imageRendering: "pixelated"
      }}
      tabIndex={-1}
    />
  );
}

// Helper: Cyberpunk neon grid
function drawCyberGrid(ctx, width, height, cellSize, colors) {
  ctx.save();
  ctx.setLineDash([1.8, 5.8]); // glitchy dash
  ctx.lineWidth = 1.2;
  for (let x = 0; x <= width; x += cellSize) {
    ctx.strokeStyle = Math.random() > 0.85
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

// Helper: Neon apple
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
  grad.addColorStop(0.25, colors.accent);
  grad.addColorStop(0.54, "#ff4932");
  grad.addColorStop(1, "#ff149366");
  ctx.beginPath();
  ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize/3, 0, Math.PI*2);
  ctx.closePath();
  ctx.shadowColor = "#ff37eee8";
  ctx.shadowBlur = 13;
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;

  // Little highlight
  ctx.beginPath();
  ctx.arc(x + cellSize / 2.6, y + cellSize / 2.7, 2.8, 0, Math.PI*2);
  ctx.closePath();
  ctx.globalAlpha = 0.68;
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.globalAlpha = 1;
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
function buttonStyle(color = "#000", bg = "#00ffff") {
  return {
    background: bg,
    color: color,
    border: "3px solid #00ffff",
    padding: "5px 18px",
    margin: "3px 5px",
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: 700,
    borderRadius: "10px 7px 7px 11px",
    boxShadow: "0 0 12px #00ffc5, 0 2px 8px #23e0f9",
    letterSpacing: 1,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.09s cubic-bezier(.58,.26,.7,1.55)",
    textShadow: "0 1px 2px #11f0ff44, 0 0 9px #ff0, 0 0 2px #df00e0"
  };
}

export default App;
