import React, { useState, useEffect } from "react";
import "./App.css";

// Color Constants (Matching Request)
const COLORS = {
  accent: "#ffb300",
  primary: "#1976d2",
  secondary: "#424242",
  boardBg: "#f9f9f9",
  boardLine: "#dedede",
  cellHover: "#ffe0a7",
  playerX: "#1976d2",
  playerO: "#ffb300",
  draw: "#777",
  statusBg: "#fffbe9",
  btnBg: "#1976d2",
  btnText: "#fff",
};

const MODES = {
  SOLO: "Single Player",
  MULTI: "Local Multiplayer",
};

const initialBoard = () => Array(9).fill(null);

function calculateWinner(squares) {
  // Returns {winner, line} if win, {draw: true} if draw, or null
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diags
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (squares.every((sq) => sq != null)) {
    return { draw: true };
  }
  return null;
}

function getAIMove(squares) {
  // Simple computer: pick random empty cell
  const empty = squares
    .map((val, ix) => (val === null ? ix : null))
    .filter((v) => v !== null);
  if (empty.length === 0) return null;
  // For more challenge, use minimax or smarter logic.
  // For modern feel: instant, but not unbeatable
  return empty[Math.floor(Math.random() * empty.length)];
}

function StatusBar({ gameMode, current, status, score, onRestart }) {
  // PUBLIC_INTERFACE
  /** Renders the top status bar above the board. */
  let statMsg = "";
  if (status.finished) {
    if (status.draw)
      statMsg = (
        <>
          <span style={{ color: COLORS.draw, fontWeight: 600 }}>Draw!</span>
        </>
      );
    else
      statMsg = (
        <>
          <span
            style={{
              color:
                status.winner === "X"
                  ? COLORS.playerX
                  : COLORS.playerO,
              fontWeight: 700,
            }}
          >
            {status.winner === "X"
              ? "Player X"
              : gameMode === MODES.SOLO
              ? "Computer (O)"
              : "Player O"}
          </span>{" "}
          wins!
        </>
      );
  } else {
    statMsg =
      current === "X" ? (
        <span style={{ color: COLORS.playerX, fontWeight: 600 }}>
          Player X's turn
        </span>
      ) : gameMode === MODES.SOLO ? (
        <span style={{ color: COLORS.playerO, fontWeight: 600 }}>
          Computer's turn
        </span>
      ) : (
        <span style={{ color: COLORS.playerO, fontWeight: 600 }}>
          Player O's turn
        </span>
      );
  }
  return (
    <div className="ttt-status-container" style={{ background: COLORS.statusBg }}>
      <div className="ttt-status-row">
        <div className="ttt-status-title">Tic Tac Toe</div>
        <button
          className="ttt-restart-btn"
          aria-label="Restart Game"
          onClick={onRestart}
        >
          ↻ Restart
        </button>
      </div>
      <div className="ttt-status-msg">{statMsg}</div>
      <div className="ttt-scoreboard" aria-label="Game Score">
        <span style={{ color: COLORS.playerX }}>
          X&nbsp;{score.X}
        </span>
        <span style={{ margin: "0 12px", color: "#808080" }}>|</span>
        <span style={{ color: COLORS.playerO }}>
          O&nbsp;{score.O}
        </span>
        <span style={{ margin: "0 12px", color: "#808080" }}>|</span>
        <span style={{ color: COLORS.draw }}>Draw&nbsp;{score.draw}</span>
      </div>
    </div>
  );
}

function GameModePicker({ gameMode, setGameMode }) {
  // PUBLIC_INTERFACE
  /** Picker for Single/Multiplayer mode. */
  return (
    <div className="ttt-mode-picker">
      <button
        className={`ttt-mode-btn ${
          gameMode === MODES.SOLO ? "selected" : ""
        }`}
        style={
          gameMode === MODES.SOLO
            ? { borderColor: COLORS.accent, color: COLORS.accent }
            : {}
        }
        onClick={() => setGameMode(MODES.SOLO)}
      >
        VS Computer
      </button>
      <button
        className={`ttt-mode-btn ${
          gameMode === MODES.MULTI ? "selected" : ""
        }`}
        style={
          gameMode === MODES.MULTI
            ? { borderColor: COLORS.primary, color: COLORS.primary }
            : {}
        }
        onClick={() => setGameMode(MODES.MULTI)}
      >
        VS Friend
      </button>
    </div>
  );
}

function Board({ squares, onClick, winLine, disabled }) {
  // PUBLIC_INTERFACE
  /** Tic Tac Toe board (3x3). */
  return (
    <div className="ttt-board" aria-label="Tic Tac Toe Board">
      {squares.map((v, ix) => {
        const isWinning =
          winLine && winLine.includes(ix);
        let cellColor = undefined;
        if (v === "X") cellColor = COLORS.playerX;
        if (v === "O") cellColor = COLORS.playerO;

        return (
          <button
            key={ix}
            className={`ttt-cell${isWinning ? " win" : ""}`}
            style={{
              color: cellColor,
              borderColor: isWinning ? COLORS.accent : COLORS.boardLine,
              background: isWinning ? "#fffbe9" : COLORS.boardBg,
              cursor:
                !v && !disabled
                  ? "pointer"
                  : "default",
            }}
            aria-label={`Cell ${ix + 1}: ${
              v ? (v === "X" ? "Player X" : "Player O") : "Empty"
            }`}
            tabIndex={0}
            onClick={() => {
              if (!v && !disabled) onClick(ix);
            }}
            disabled={!!v || disabled}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  // PUBLIC_INTERFACE
  /**
   * Main app. Handles game logic, status, mode switching, score, and rendering.
   */
  const [gameMode, setGameMode] = useState(MODES.SOLO);
  const [squares, setSquares] = useState(initialBoard());
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState({
    finished: false,
    winner: null,
    draw: false,
    winLine: null,
  });
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });

  // Reset game state for new game/mode
  const resetGame = () => {
    setSquares(initialBoard());
    setIsXNext(true);
    setStatus({ finished: false, winner: null, draw: false, winLine: null });
  };

  // When gameMode changes, reset
  useEffect(() => {
    resetGame();
  }, [gameMode]);

  // On every board update, check for winner
  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      if (result.winner) {
        setStatus({
          finished: true,
          winner: result.winner,
          draw: false,
          winLine: result.line,
        });
        setScore((s) => ({
          ...s,
          [result.winner]: s[result.winner] + 1,
        }));
      } else if (result.draw) {
        setStatus({
          finished: true,
          winner: null,
          draw: true,
          winLine: null,
        });
        setScore((s) => ({
          ...s,
          draw: s.draw + 1,
        }));
      }
    } else {
      setStatus((stat) => ({
        finished: false,
        winner: null,
        draw: false,
        winLine: null,
      }));
    }
    // eslint-disable-next-line
  }, [squares]); // ignore exhaustive-deps

  // AI Move (when in solo mode and it's O's turn and not finished)
  useEffect(() => {
    if (
      gameMode === MODES.SOLO &&
      !isXNext &&
      !status.finished
    ) {
      const computerTimeout = setTimeout(() => {
        // Find AI move and play
        const move = getAIMove(squares);
        if (move != null) {
          setSquares((sq) => {
            if (sq[move] !== null) return sq;
            const newSq = sq.slice();
            newSq[move] = "O";
            return newSq;
          });
          setIsXNext(true);
        }
      }, 480); // ~half-second delay for realism
      return () => clearTimeout(computerTimeout);
    }
  }, [gameMode, isXNext, squares, status.finished]);

  // Handle click on board
  const handleCellClick = (ix) => {
    if (squares[ix] || status.finished) return;
    // Only allow move if it's current player's turn
    if (gameMode === MODES.SOLO) {
      if (!isXNext) return; // Human is always X
      setSquares((sq) => {
        if (sq[ix] !== null) return sq;
        const newSq = sq.slice();
        newSq[ix] = "X";
        return newSq;
      });
      setIsXNext(false);
    } else {
      // Local multiplayer
      setSquares((sq) => {
        if (sq[ix] !== null) return sq;
        const newSq = sq.slice();
        newSq[ix] = isXNext ? "X" : "O";
        return newSq;
      });
      setIsXNext((prev) => !prev);
    }
  };

  // Handle full game reset/score clear
  const handleFullReset = () => {
    resetGame();
    setScore({ X: 0, O: 0, draw: 0 });
  };

  // Accessibility: focus state resets on restart
  useEffect(() => {
    const el = document.querySelector(".ttt-cell");
    if (el) el.focus();
  }, [squares]);

  return (
    <main className="ttt-main">
      <header className="ttt-header" role="banner">
        <div className="ttt-header-left">
          <span className="ttt-logo" aria-label="Minimalist Tic Tac Toe Logo">
            <svg width="28" height="28" viewBox="0 0 28 28" style={{ verticalAlign: "middle" }}>
              <g fill="none" stroke={COLORS.primary} strokeWidth="2">
                <line x1="8" y1="2" x2="8" y2="26" />
                <line x1="20" y1="2" x2="20" y2="26" />
                <line x1="2" y1="8" x2="26" y2="8" />
                <line x1="2" y1="20" x2="26" y2="20" />
              </g>
            </svg>
          </span>
          <span className="ttt-header-title">Tic Tac Toe</span>
        </div>
        <div>
          <button className="ttt-reset-total-btn" onClick={handleFullReset}>Clear Score</button>
        </div>
      </header>
      <section className="ttt-centerpiece">
        <StatusBar
          gameMode={gameMode}
          current={isXNext ? "X" : "O"}
          status={status}
          score={score}
          onRestart={resetGame}
        />
        <GameModePicker
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
        <Board
          squares={squares}
          onClick={handleCellClick}
          winLine={status.winLine}
          disabled={
            (gameMode === MODES.SOLO && !isXNext) || status.finished
          }
        />
        {status.finished && (
          <div className="ttt-again-row">
            <button
              className="ttt-restart-btn-big"
              onClick={resetGame}
            >
              <span role="img" aria-label="Play Again">▶</span> Play Again
            </button>
          </div>
        )}
      </section>
      <footer className="ttt-footer">
        <span>
          <a
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.secondary, textDecoration: "none" }}
          >
            React
          </a>{" "}
          &middot; Minimal UI &middot;{" "}
          <span
            style={{
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            KAVIA Demo
          </span>
        </span>
      </footer>
    </main>
  );
}

export default App;
