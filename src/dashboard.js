import {
  Stack,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import Pawn from "./pieces/pawn";
import Rook from "./pieces/rook";
import Knight from "./pieces/knigth";
import Bishop from "./pieces/bishop";
import Queen from "./pieces/queen";
import King from "./pieces/king";
const ROWS = 8;
const COLS = 8;

const matrix = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => null)
);

const initializeMatrix = () => {
  // white pawns
  for (let i = 0; i < matrix[1].length; i++) {
    matrix[1][i] = new Pawn(`wp${i + 1}`, { row: 1, col: i });
  }

  // black pawns
  for (let i = 0; i < matrix[6].length; i++) {
    matrix[6][i] = new Pawn(`bp${i + 1}`, { row: 6, col: i });
  }

  // white pieces
  matrix[0][0] = new Rook("wr1", { row: 0, col: 0 });
  matrix[0][1] = new Knight("wn1", { row: 0, col: 1 });
  matrix[0][2] = new Bishop("wb1", { row: 0, col: 2 });
  matrix[0][3] = new Queen("wq", { row: 0, col: 3 });
  matrix[0][4] = new King("wk", { row: 0, col: 4 });
  matrix[0][5] = new Bishop("wb2", { row: 0, col: 5 });
  matrix[0][6] = new Knight("wn2", { row: 0, col: 6 });
  matrix[0][7] = new Rook("wr2", { row: 0, col: 7 });

  matrix[7][0] = new Rook("br1", { row: 7, col: 0 });
  matrix[7][1] = new Knight("bn1", { row: 7, col: 1 });
  matrix[7][2] = new Bishop("bb1", { row: 7, col: 2 });
  matrix[7][3] = new Queen("bq", { row: 7, col: 3 });
  matrix[7][4] = new King("bk", { row: 7, col: 4 });
  matrix[7][5] = new Bishop("bb2", { row: 7, col: 5 });
  matrix[7][6] = new Knight("bn2", { row: 7, col: 6 });
  matrix[7][7] = new Rook("br2", { row: 7, col: 7 });
};

initializeMatrix();
const isCheckMate = (matrix, king) => {
  const currentPosition = king.currentPosition;
  const { row, col } = currentPosition;
  let threatCanBeCaptured = false;
  let threatCanBeIntercepted = false;
  const allies = [];

  const allEnemyMoves = king.getAllPiecesPossibleMoves(matrix);
  const isInCheck = allEnemyMoves.some(
    (move) => move.row === row && move.col === col
  );

  if (!isInCheck) return false;

  const kingMoves = king.computePossibleMoves(currentPosition, matrix);
  if (kingMoves.length > 0) return false;

  const threats = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = matrix[r][c];
      if (piece && piece.name[0] !== king.name[0] && !(piece instanceof King)) {
        const moves = piece.computePossibleMoves({ row: r, col: c }, matrix);
        const isThreat = moves.some((m) => m.row === row && m.col === col);
        if (isThreat) {
          // console.log({ piece, from: { row: r, col: c } });
          threats.push({ piece, from: { row: r, col: c } });
        }
      }
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ally = matrix[r][c];
      if (ally && ally.name[0] === king.name[0]) {
        allies.push(ally);
        const moves = ally.computePossibleMoves({ row: r, col: c }, matrix);
        for (const move of moves) {
          if (
            threats.some(
              (threat) =>
                threat.from.row === move.row && threat.from.col === move.col
            )
          ) {
            threatCanBeCaptured = true;
          }
        }
      }
    }
  }
  const threatsPathsLeadingToKing = [];
  for (const threat of threats) {
    if (!(threat.piece instanceof Pawn) && !(threat.piece instanceof Knight)) {
      const threatPaths = threat.piece.possiblePaths;
      for (let i = 0; i < threatPaths.length; i++) {
        const path = threatPaths[i];
        if (
          path[path.length - 1].row === currentPosition.row &&
          path[path.length - 1].col === currentPosition.col
        ) {
          threatsPathsLeadingToKing.push(path);
        }
      }
    }
  }
  //bechir houwe kbar star v javascript
  //threat can be intercepted
  for (const path of threatsPathsLeadingToKing) {
    for (const ally of allies) {
      const allyPossibleMoves = ally.computePossibleMoves(
        ally.currentPosition,
        matrix
      );
      for (const move of path) {
        if (
          allyPossibleMoves.some(
            ({ row, col }) => row === move.row && col === move.col
          )
        )
          threatCanBeIntercepted = true;
      }
    }
  }
  let copyMatrix = matrix.map((row) =>
    row.map((cell) =>
      cell
        ? Object.assign(Object.create(Object.getPrototypeOf(cell)), cell)
        : null
    )
  );
  console.log(threatCanBeCaptured, threatCanBeIntercepted);

  for (const threat of threats) {
    copyMatrix[threat.piece.position.row][threat.piece.position.col] = null;
    if (
      copyMatrix[currentPosition.row][currentPosition.col].computePossibleMoves(
        currentPosition,
        copyMatrix
      ).length === 0
    ) {
    }
  }

  return !(threatCanBeCaptured || threatCanBeIntercepted);
};

const Board = () => {
  const [readyToMove, setReadyToMove] = useState(false);
  const [pieceToBeMoved, setPieceToBeMoved] = useState(null);
  const [board, setBoard] = useState(matrix);
  const [playerToPlay, setPlayerToPlay] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const findKing = (color) => {
    const kingId = color === "white" ? "wk" : "bk";
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (matrix[row][col] && matrix[row][col].name === kingId) {
          return matrix[row][col];
        }
      }
    }
    return null;
  };

  const checkForCheckmate = () => {
    const currentKing = findKing(playerToPlay);
    const opponentKing = findKing(playerToPlay === "white" ? "black" : "white");

    if (currentKing && isCheckMate(matrix, currentKing)) {
      setGameOver(true);
      setWinner(playerToPlay === "white" ? "black" : "white");
      return true;
    }

    if (opponentKing && isCheckMate(matrix, opponentKing)) {
      setGameOver(true);
      setWinner(playerToPlay);
      return true;
    }

    return false;
  };

  const resetGame = () => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        matrix[row][col] = null;
      }
    }

    initializeMatrix();
    setBoard([...matrix]);
    setPlayerToPlay("white");
    setReadyToMove(false);
    setPieceToBeMoved(null);
    setSelectedSquare(null);
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
  };

  const isPieceOwnedByCurrentPlayer = (piece) => {
    if (!piece) return false;
    const pieceColor = piece.name[0] === "w" ? "white" : "black";
    return pieceColor === playerToPlay;
  };

  const handleMove = (clicked) => {
    if (gameOver) return;

    if (readyToMove) {
      const { row, col } = clicked.position;
      if (checkIsPossibleMove(row, col) === false) {
        setReadyToMove(false);
        setPieceToBeMoved(null);
        setSelectedSquare(null);
      } else {
        const capturedPiece = matrix[row][col];
        pieceToBeMoved.Move(clicked.position, pieceToBeMoved.position, board);

        const moveNotation = `${pieceToBeMoved.name} ${String.fromCharCode(
          97 + pieceToBeMoved.position.col
        )}${8 - pieceToBeMoved.position.row} → ${String.fromCharCode(
          97 + col
        )}${8 - row}${capturedPiece ? " (captured)" : ""}`;
        setMoveHistory((prev) => [...prev, moveNotation]);

        setPlayerToPlay((prev) => (prev === "white" ? "black" : "white"));
        setReadyToMove(false);
        setPieceToBeMoved(null);
        setSelectedSquare(null);

        setBoard([...matrix]);

        setTimeout(() => {
          checkForCheckmate();
        }, 5000);
      }
    } else {
      if (clicked.piece && isPieceOwnedByCurrentPlayer(clicked.piece)) {
        clicked.piece.position = clicked.position;
        setPieceToBeMoved(clicked.piece);
        setSelectedSquare(clicked.position);
        setReadyToMove(true);
      } else if (clicked.piece && !isPieceOwnedByCurrentPlayer(clicked.piece)) {
        setReadyToMove(false);
        setPieceToBeMoved(null);
        setSelectedSquare(null);
      }
    }
  };

  const checkIsPossibleMove = (row, col) => {
    if (pieceToBeMoved === null) {
      return false;
    } else {
      const possibleMoves = pieceToBeMoved.computePossibleMoves(
        pieceToBeMoved.position,
        matrix
      );
      return possibleMoves.some((move) => move.row === row && move.col === col);
    }
  };

  const isSquareSelected = (row, col) => {
    return (
      selectedSquare && selectedSquare.row === row && selectedSquare.col === col
    );
  };

  const getSquareColor = (rowIndex, colIndex) => {
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const isSelected = isSquareSelected(rowIndex, colIndex);
    const isPossibleMove =
      checkIsPossibleMove(rowIndex, colIndex) && readyToMove;

    if (isSelected) {
      return isLight ? "#FFE5B4" : "#DEB887";
    } else if (isPossibleMove) {
      return isLight ? "#E8F5E8" : "#C8E6C9";
    } else {
      return isLight ? "#FAEBD7" : "#8B7355";
    }
  };

  const getSquareBorder = (rowIndex, colIndex) => {
    const isSelected = isSquareSelected(rowIndex, colIndex);
    const isPossibleMove =
      checkIsPossibleMove(rowIndex, colIndex) && readyToMove;

    if (isSelected) {
      return "3px solid #FF8C00";
    } else if (isPossibleMove) {
      return "2px solid #4CAF50";
    } else {
      return "1px solid #8B7355";
    }
  };

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <Container maxWidth="xl" sx={{ minHeight: "100vh", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundAttachment: "fixed",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Dialog
          open={gameOver}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              background: "linear-gradient(45deg, #2c3e50, #34495e)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              fontSize: "28px",
              py: 3,
            }}
          >
            🏆 GAME OVER! 🏆
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: winner === "white" ? "#2196F3" : "#424242",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {winner === "white" ? "♔ WHITE WINS! ♔" : "♛ BLACK WINS! ♛"}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#666",
                fontStyle: "italic",
                mb: 3,
              }}
            >
              Checkmate! 🎯
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#888",
                mb: 2,
              }}
            >
              Total moves played: {moveHistory.length}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={resetGame}
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 25,
                background: "linear-gradient(45deg, #2196F3, #1976d2)",
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 8px 25px rgba(33, 150, 243, 0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976d2, #1565c0)",
                  boxShadow: "0 12px 35px rgba(33, 150, 243, 0.6)",
                },
              }}
            >
              🔄 Play Again
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
            width: "100%",
            maxWidth: "600px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              background: "linear-gradient(45deg, #2c3e50, #34495e)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              letterSpacing: "1px",
              mb: 1,
            }}
          >
            ♔ BECHIR'S CHESS ♛
          </Typography>
          <Chip
            label={
              gameOver
                ? `Game Over - ${
                    winner?.charAt(0).toUpperCase() + winner?.slice(1)
                  } Wins!`
                : `${
                    playerToPlay.charAt(0).toUpperCase() + playerToPlay.slice(1)
                  }'s Turn`
            }
            color={
              gameOver
                ? "error"
                : playerToPlay === "white"
                ? "default"
                : "primary"
            }
            variant="filled"
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              px: 2,
              py: 1,
              borderRadius: 15,
              background: gameOver
                ? "linear-gradient(45deg, #f44336, #d32f2f)"
                : playerToPlay === "white"
                ? "linear-gradient(45deg, #f5f5f5, #e0e0e0)"
                : "linear-gradient(45deg, #1976d2, #1565c0)",
              color: gameOver
                ? "white"
                : playerToPlay === "white"
                ? "#333"
                : "white",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          />
        </Paper>

        {/* Main Game Area */}
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* Chess Board */}
          <Grid item xs={12} md={8} lg={6}>
            <Box sx={{ position: "relative", opacity: gameOver ? 0.7 : 1 }}>
              {/* Rank Numbers (Left Side) */}
              <Box
                sx={{
                  position: "absolute",
                  left: -20,
                  top: 8,
                  height: "calc(100% - 16px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                {ranks.map((rank) => (
                  <Typography
                    key={rank}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                      lineHeight: 1,
                      height: "calc(100% / 8)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {rank}
                  </Typography>
                ))}
              </Box>

              {/* File Letters (Bottom) */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  left: 8,
                  width: "calc(100% - 16px)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                {files.map((file) => (
                  <Typography
                    key={file}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                      width: "calc(100% / 8)",
                      textAlign: "center",
                    }}
                  >
                    {file}
                  </Typography>
                ))}
              </Box>

              <Paper
                elevation={12}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(145deg, #8B4513, #A0522D)",
                  boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
                }}
              >
                <Box
                  sx={{
                    border: "2px solid #654321",
                    borderRadius: 1,
                    overflow: "hidden",
                    boxShadow: "inset 0 0 15px rgba(0,0,0,0.3)",
                  }}
                >
                  <Stack gap={0}>
                    {board.map((row, rowIndex) => (
                      <Stack direction="row" key={rowIndex} gap={0}>
                        {row.map((piece, colIndex) => (
                          <Box
                            key={colIndex}
                            onClick={() =>
                              handleMove({
                                piece: piece,
                                position: { row: rowIndex, col: colIndex },
                              })
                            }
                            sx={{
                              width: { xs: "45px", sm: "55px", md: "60px" },
                              height: { xs: "45px", sm: "55px", md: "60px" },
                              backgroundColor: getSquareColor(
                                rowIndex,
                                colIndex
                              ),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: gameOver ? "not-allowed" : "pointer",
                              border: getSquareBorder(rowIndex, colIndex),
                              position: "relative",
                              "&:hover": {
                                filter: gameOver ? "none" : "brightness(1.1)",
                              },
                            }}
                          >
                            {checkIsPossibleMove(rowIndex, colIndex) &&
                              readyToMove &&
                              !piece && (
                                <Box
                                  sx={{
                                    width: "16px",
                                    height: "16px",
                                    borderRadius: "50%",
                                    backgroundColor: "#4CAF50",
                                    opacity: 0.7,
                                  }}
                                />
                              )}

                            {checkIsPossibleMove(rowIndex, colIndex) &&
                              readyToMove &&
                              piece && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    border: "3px solid #FF5722",
                                    borderRadius: "6px",
                                    pointerEvents: "none",
                                  }}
                                />
                              )}

                            {piece && (
                              <img
                                src={piece.img}
                                alt={piece.id}
                                style={{
                                  width: "85%",
                                  height: "85%",
                                  objectFit: "contain",
                                  filter:
                                    isPieceOwnedByCurrentPlayer(piece) &&
                                    !readyToMove &&
                                    !gameOver
                                      ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"
                                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Move History */}
          {moveHistory.length > 0 && (
            <Grid item xs={12} md={4} lg={4}>
              <Paper
                elevation={6}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
                  maxHeight: "400px",
                  overflow: "auto",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "#2c3e50",
                    fontWeight: "bold",
                    borderBottom: "2px solid #e0e0e0",
                    pb: 1,
                    mb: 2,
                    fontSize: "18px",
                  }}
                >
                  📜 Move History
                </Typography>
                <Stack gap={1}>
                  {moveHistory.slice(-10).map((move, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1,
                        backgroundColor:
                          index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                        borderRadius: 1,
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#495057",
                          fontSize: "12px",
                          fontFamily: "Consolas, monospace",
                          fontWeight: "500",
                        }}
                      >
                        <strong>{moveHistory.length - 9 + index}.</strong>{" "}
                        {move}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Board;
