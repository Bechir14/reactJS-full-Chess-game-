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

import initializeMatrix from "./init_Matrix";
import isCheckMate from "./checkMate";

let matrix = initializeMatrix();

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
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
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
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        matrix[row][col] = null;
      }
    }

    matrix = initializeMatrix();
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
      return isLight ? "#4A4A4A" : "#2E2E2E";
    } else if (isPossibleMove) {
      return isLight ? "#1B4332" : "#081C15";
    } else {
      return isLight ? "#3C3C3C" : "#1E1E1E";
    }
  };

  const getSquareBorder = (rowIndex, colIndex) => {
    const isSelected = isSquareSelected(rowIndex, colIndex);
    const isPossibleMove =
      checkIsPossibleMove(rowIndex, colIndex) && readyToMove;

    if (isSelected) {
      return "3px solid #FFD700";
    } else if (isPossibleMove) {
      return "2px solid #40C057";
    } else {
      return "1px solid #404040";
    }
  };

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #0d1421 50%, #1a1a1a 100%)",
        color: "#ffffff",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Dialog
          open={gameOver}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "linear-gradient(145deg, #2c2c2c, #1e1e1e)",
              border: "1px solid #404040",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              color: "#ffffff",
              fontWeight: "800",
              fontSize: { xs: "20px", sm: "28px" },
              py: 3,
              borderBottom: "1px solid #404040",
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
                color: winner === "white" ? "#FFD700" : "#C0C0C0",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {winner === "white" ? "♔ WHITE WINS! ♔" : "♛ BLACK WINS! ♛"}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#b0b0b0",
                fontStyle: "italic",
                mb: 3,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Checkmate! 🎯
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#909090",
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
                background: "linear-gradient(45deg, #333333, #555555)",
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid #666666",
                boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #555555, #777777)",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
                },
              }}
            >
              🔄 Play Again
            </Button>
          </DialogActions>
        </Dialog>

        <Stack spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center">
          <Paper
            elevation={8}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: "linear-gradient(145deg, #2c2c2c, #1e1e1e)",
              border: "1px solid #404040",
              width: "100%",
              maxWidth: "800px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                color: "#ffffff",
                fontWeight: "800",
                letterSpacing: "1px",
                mb: 2,
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
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
                      playerToPlay.charAt(0).toUpperCase() +
                      playerToPlay.slice(1)
                    }'s Turn`
              }
              variant="filled"
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: "bold",
                px: 3,
                py: 1,
                borderRadius: 15,
                background: gameOver
                  ? "linear-gradient(45deg, #d32f2f, #b71c1c)"
                  : playerToPlay === "white"
                  ? "linear-gradient(45deg, #FFD700, #FFA000)"
                  : "linear-gradient(45deg, #616161, #424242)",
                color: gameOver
                  ? "#ffffff"
                  : playerToPlay === "white"
                  ? "#000000"
                  : "#ffffff",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                border: "1px solid #666666",
              }}
            />
          </Paper>

          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            justifyContent="center"
          >
            <Grid item xs={12} lg={8} xl={6}>
              <Box
                sx={{
                  position: "relative",
                  opacity: gameOver ? 0.7 : 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: -16, sm: -20, md: -24 },
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
                        color: "#b0b0b0",
                        fontWeight: "bold",
                        fontSize: { xs: "10px", sm: "12px", md: "14px" },
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
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

                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: -16, sm: -20, md: -24 },
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
                        color: "#b0b0b0",
                        fontWeight: "bold",
                        fontSize: { xs: "10px", sm: "12px", md: "14px" },
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        width: "calc(100% / 8)",
                        textAlign: "center",
                      }}
                    >
                      {file}
                    </Typography>
                  ))}
                </Box>

                <Paper
                  elevation={16}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: "linear-gradient(145deg, #1a1a1a, #2c2c2c)",
                    border: "2px solid #404040",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  <Box
                    sx={{
                      border: "2px solid #333333",
                      borderRadius: 1,
                      overflow: "hidden",
                      boxShadow: "inset 0 0 15px rgba(0,0,0,0.5)",
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
                                width: {
                                  xs: "40px",
                                  sm: "50px",
                                  md: "60px",
                                  lg: "70px",
                                },
                                height: {
                                  xs: "40px",
                                  sm: "50px",
                                  md: "60px",
                                  lg: "70px",
                                },
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
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  filter: gameOver ? "none" : "brightness(1.2)",
                                  transform: gameOver ? "none" : "scale(1.02)",
                                },
                              }}
                            >
                              {checkIsPossibleMove(rowIndex, colIndex) &&
                                readyToMove &&
                                !piece && (
                                  <Box
                                    sx={{
                                      width: { xs: "12px", sm: "16px" },
                                      height: { xs: "12px", sm: "16px" },
                                      borderRadius: "50%",
                                      backgroundColor: "#40C057",
                                      opacity: 0.8,
                                      boxShadow:
                                        "0 0 8px rgba(64, 192, 87, 0.5)",
                                    }}
                                  />
                                )}

                              {checkIsPossibleMove(rowIndex, colIndex) &&
                                readyToMove &&
                                piece && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 2,
                                      left: 2,
                                      right: 2,
                                      bottom: 2,
                                      border: "3px solid #FF6B6B",
                                      borderRadius: "8px",
                                      pointerEvents: "none",
                                      boxShadow:
                                        "0 0 12px rgba(255, 107, 107, 0.5)",
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
                                        ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.9)) brightness(1.1)"
                                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
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

            {moveHistory.length > 0 && (
              <Grid item xs={12} lg={4} xl={4}>
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    background: "linear-gradient(145deg, #2c2c2c, #1e1e1e)",
                    border: "1px solid #404040",
                    maxHeight: { xs: "300px", sm: "400px", md: "500px" },
                    overflow: "auto",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#1a1a1a",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#404040",
                      borderRadius: "4px",
                      "&:hover": {
                        background: "#555555",
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "#ffffff",
                      fontWeight: "bold",
                      borderBottom: "2px solid #404040",
                      pb: 1,
                      mb: 2,
                      fontSize: { xs: "16px", sm: "18px" },
                    }}
                  >
                    📜 Move History
                  </Typography>
                  <Stack gap={1}>
                    {moveHistory.slice(-15).map((move, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: { xs: 1, sm: 1.5 },
                          backgroundColor:
                            index % 2 === 0 ? "#2a2a2a" : "#333333",
                          borderRadius: 1,
                          border: "1px solid #404040",
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#3a3a3a",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#e0e0e0",
                            fontSize: { xs: "11px", sm: "12px" },
                            fontFamily: "'Courier New', monospace",
                            fontWeight: "500",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#FFD700",
                              fontWeight: "bold",
                              mr: 1,
                            }}
                          >
                            {moveHistory.length -
                              (moveHistory.slice(-15).length - 1) +
                              index}
                            .
                          </Box>
                          {move}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Board;
