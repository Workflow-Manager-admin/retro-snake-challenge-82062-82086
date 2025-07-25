import React, { useEffect, useRef, useState } from "react";
import "./App.css";

/**
 * Retro-Style Snake Game App
 * Features:
 * - Real-time snake movement (arrow keys, WASD)
 * - Score tracking
 * - Game start/pause/restart controls
 * - Pixel-art inspired graphics
 * - Fully contained in a centered single-page layout
 * - Color scheme: accent (#FFD700), primary (#00FF00), secondary (#000000), light theme
 */

// CONFIGURABLES
const BOARD_SIZE = 20; // 20x20 grid
const CELL_SIZE = 22; // px
const INIT_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 }
];
const INIT_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 110; // ms per move

const COLORS = {
  accent: "#FFD700",
  primary: "#00FF00",
  secondary: "#000000",
  bg: "#eeeeee",
  grid: "#cccccc",
  board: "#232323"
};

// Keyboard controls (arrows + WASD)
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

  // Handle keyboard events (direction and pause)
  useEffect(() => {
    function handleKeyDown(e) {
      if (gameOver) return;
      const key = e.key;
      // Pause/Resume
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        if (running) {
          setPaused(p => !p);
        }
        return;
      }
      // Prevent reversing direction
      if (KEY_DIRECTIONS[key]) {
        const nd = KEY_DIRECTIONS[key];
        const { x, y } = directionRef.current;
        if ((x + nd.x !== 0 || y + nd.y !== 0) && (nd.x !== x || nd.y !== y)) {
          setDirection(nd);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    if (!running || paused || gameOver) return;
    const interval = setInterval(step, GAME_SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [running, paused, gameOver, direction, snake]);

  // Main step function
  function step() {
    if (!runningRef.current || pausedRef.current) return;
    const currentSnake = [...snakeRef.current];
    const head = { ...currentSnake[0] };
    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    // Collision detection
    if (
      head.x < 0 ||
      head.x >= BOARD_SIZE ||
      head.y < 0 ||
      head.y >= BOARD_SIZE ||
      collides(head, currentSnake)
    ) {
      setRunning(false);
      setGameOver(true);
      return;
    }

    // Check food
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

  return (
    <div
      className="snake-app-root"
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "monospace"
      }}
    >
      <div
        className="snake-ui-panel"
        style={{
          width: BOARD_SIZE * CELL_SIZE + 32,
          maxWidth: "98vw",
          marginBottom: 20,
          background: "#fffbe8",
          border: `4px solid ${COLORS.accent}`,
          borderRadius: 12,
          boxShadow: `0 0 0 4px ${COLORS.secondary}`,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h1
          style={{
            fontSize: 32,
            margin: 0,
            marginBottom: 8,
            letterSpacing: "2px",
            color: COLORS.accent,
            textShadow: `0 2px 0 ${COLORS.secondary}`,
            fontWeight: 900,
            fontFamily: "monospace"
          }}
        >
          RETRO SNAKE
        </h1>
        <div
          className="snake-score-panel"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10
          }}
        >
          <span
            style={{
              fontSize: 19,
              color: COLORS.primary,
              fontWeight: 700
            }}
            data-testid="snake-score"
          >
            Score: {score}
          </span>
          {running && !paused && (
            <span
              style={{
                color: COLORS.accent,
                fontSize: 15,
                fontWeight: 700,
                marginLeft: 10
              }}
            >
              Playing ⏩
            </span>
          )}
          {paused && running && (
            <span
              style={{
                color: COLORS.accent,
                fontSize: 16,
                fontWeight: 700,
                marginLeft: 10
              }}
            >
              Paused ⏸
            </span>
          )}
        </div>
        <div className="snake-control-panel" style={{ marginBottom: 7 }}>
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
              style={buttonStyle("#fff", COLORS.accent)}
              onClick={pauseGame}
              data-testid="pause-btn"
            >
              ⏸ Pause
            </button>
          )}
          {paused && (
            <button
              className="snake-btn snake-btn-continue"
              style={buttonStyle("#fff", COLORS.primary)}
              onClick={resumeGame}
              data-testid="resume-btn"
            >
              ▶ Resume
            </button>
          )}
          {(gameOver || (paused && running)) && (
            <button
              className="snake-btn snake-btn-restart"
              style={buttonStyle("#fff", COLORS.secondary)}
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
          color: "#555"
        }}>
          Controls: Arrow Keys or WASD<br />
          {running ? "Press [Space] to Pause" : "Press Start to Play"}
        </div>
      </div>
      <div
        className="snake-game-area-outer"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
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
            background: "rgba(0,0,0,0.74)",
            color: COLORS.accent,
            borderRadius: 8,
            fontSize: 28,
            fontWeight: 700,
            padding: 24,
            position: "absolute",
            top: "36%",
            left: "50%",
            transform: "translate(-50%,-40%)",
            textShadow: "0 2px 8px #000"
          }}
        >
          GAME OVER
          <br />
          <span style={{ fontSize: 16, color: "#fff", marginTop: 8 }}>
            Your score: {score}
          </span>
        </div>
      )}
      <footer
        style={{
          color: "#888",
          fontSize: 12,
          marginTop: 32,
          letterSpacing: 1
        }}
      >
        <span>
          <span role="img" aria-label="snake">🐍</span> Snake Game &copy; 2024
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

  // Paint game area as a retro pixel grid, snake, and food
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    // Clear BG
    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, width, height);

    // Grid
    drawRetroGrid(ctx, width, height, cellSize, colors.grid);

    // Snake body
    snake.forEach((segment, idx) => {
      ctx.fillStyle =
        idx === 0
          ? colors.accent // head
          : idx === snake.length - 1
            ? "#64ff00"
            : colors.primary;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      pixelRect(
        ctx,
        segment.x * cellSize,
        segment.y * cellSize,
        cellSize,
        cellSize,
        retro
      );
      ctx.fill();
      ctx.strokeRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

    // Food (pixel-art apple)
    drawFoodPixel(ctx, food, cellSize, colors);

    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, width, height);
    }
    // eslint-disable-next-line
  }, [snake, food, width, height, retro, gameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="snake-canvas"
      style={{
        margin: "0 auto",
        background: colors.board,
        maxWidth: "min(94vw, 100%)",
        borderRadius: 13,
        border: `5px solid ${colors.secondary}`,
        boxShadow: "0 8px 25px 0 rgb(40 40 50 / 0.15)",
        outline: `2px solid ${colors.primary}`
      }}
      tabIndex={-1}
    />
  );
}

// Helper: Draw retro grid
function drawRetroGrid(ctx, width, height, cellSize, gridColor) {
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1.2;
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

// Helper: Retro pixel rectangle
function pixelRect(ctx, x, y, w, h, retro) {
  ctx.save();
  ctx.beginPath();
  if (retro) {
    // Blocky corners
    ctx.rect(x, y, w, h);
  } else {
    ctx.roundRect(x, y, w, h, 6);
  }
  ctx.closePath();
  ctx.restore();
}

// Helper: pixel-art food
function drawFoodPixel(ctx, food, cellSize, colors) {
  const x = food.x * cellSize;
  const y = food.y * cellSize;
  ctx.save();
  // Outer square for pixel food style
  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = "#F7AD00";
  ctx.lineWidth = 2;
  ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
  ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

  // Add dot highlight (simple retro apple look)
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.55;
  ctx.fillRect(x + cellSize / 2.5, y + cellSize / 2.5, 4, 4);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Generate random food (not on the snake)
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

// Returns true if object collides with snake (any segment)
function collides(pos, arr) {
  return arr.some(seg => seg.x === pos.x && seg.y === pos.y);
}

// Button style helper
function buttonStyle(color = "#000", bg = COLORS.accent) {
  return {
    background: bg,
    color: color,
    border: "3px solid #232323",
    padding: "5px 24px",
    margin: "3px 5px",
    fontSize: 19,
    fontFamily: "monospace",
    fontWeight: 700,
    borderRadius: 8,
    boxShadow: "0 2px 0 #ECEAEC",
    letterSpacing: 1,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.08s",
    textShadow: "0 1px 0 #23232344, 0 0 4px #FFDC2299"
  };
}

export default App;
