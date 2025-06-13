import isCheckMate from "./checkMate";
import Bishop from "./pieces/bishop";
import King from "./pieces/king";
import Queen from "./pieces/queen";
import Pawn from "./pieces/pawn";

const createEmptyMatrix = () =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

test("King is in checkmate (Fool's Mate)", () => {
  const matrix = createEmptyMatrix();

  // Set up the actual Fool's Mate position
  // After 1.f3 e5 2.g4 Qh4#
  const whiteKing = new King("wk", { row: 7, col: 4 }); // e1
  const blackQueen = new Queen("bq", { row: 4, col: 7 }); // h4

  // Add the pawns that create the weakness
  const whitePawnF = new Pawn("wp", { row: 5, col: 5 }); // f3
  const whitePawnG = new Pawn("wp", { row: 4, col: 6 }); // g4
  const blackPawnE = new Pawn("bp", { row: 3, col: 4 }); // e5

  // Place pieces on the board
  matrix[7][4] = whiteKing; // White king on e1
  matrix[4][7] = blackQueen; // Black queen on h4
  matrix[5][5] = whitePawnF; // White pawn on f3
  matrix[4][6] = whitePawnG; // White pawn on g4
  matrix[3][4] = blackPawnE; // Black pawn on e5

  console.log("Testing Fool's Mate position:");
  console.log("White King at e1:", whiteKing.currentPosition);
  console.log("Black Queen at h4:", blackQueen.currentPosition);

  expect(isCheckMate(matrix, whiteKing)).toBe(true);
});

test("King is in checkmate (Back rank mate)", () => {
  const matrix = createEmptyMatrix();

  // Set up a back rank mate scenario
  const whiteKing = new King("wk", { row: 7, col: 6 }); // g1
  const blackQueen = new Queen("bq", { row: 7, col: 0 }); // a1

  // Add pawns that trap the king
  const whitePawnF = new Pawn("wp", { row: 6, col: 5 }); // f2
  const whitePawnG = new Pawn("wp", { row: 6, col: 6 }); // g2
  const whitePawnH = new Pawn("wp", { row: 6, col: 7 }); // h2

  matrix[7][6] = whiteKing; // White king on g1
  matrix[7][0] = blackQueen; // Black queen on a1
  matrix[6][5] = whitePawnF; // Pawn on f2
  matrix[6][6] = whitePawnG; // Pawn on g2
  matrix[6][7] = whitePawnH; // Pawn on h2

  console.log("Testing Back Rank Mate:");
  expect(isCheckMate(matrix, whiteKing)).toBe(true);
});

test("King is NOT in checkmate (can escape)", () => {
  const matrix = createEmptyMatrix();

  const whiteKing = new King("wk", { row: 4, col: 4 }); // e4 (center of board)
  const blackQueen = new Queen("bq", { row: 0, col: 4 }); // e8

  matrix[4][4] = whiteKing;
  matrix[0][4] = blackQueen;

  // King should be in check but not checkmate (can move to adjacent squares)
  expect(isCheckMate(matrix, whiteKing)).toBe(false);
});

test("King is NOT in checkmate (threat can be captured)", () => {
  const matrix = createEmptyMatrix();

  const whiteKing = new King("wk", { row: 7, col: 4 }); // e1
  const blackQueen = new Queen("bq", { row: 7, col: 0 }); // a1
  const whiteBishop = new Bishop("wb", { row: 6, col: 3 }); // d2

  matrix[7][4] = whiteKing;
  matrix[7][0] = blackQueen; // Attacking king
  matrix[6][3] = whiteBishop; // Can capture queen

  // Bishop can capture the attacking queen
  expect(isCheckMate(matrix, whiteKing)).toBe(false);
});

test("King is NOT in checkmate (threat can be blocked)", () => {
  const matrix = createEmptyMatrix();

  const whiteKing = new King("wk", { row: 7, col: 4 }); // e1
  const blackQueen = new Queen("bq", { row: 0, col: 4 }); // e8
  const whiteBishop = new Bishop("wb", { row: 6, col: 3 }); // d2

  matrix[7][4] = whiteKing;
  matrix[0][4] = blackQueen; // Attacking king along e-file
  matrix[6][3] = whiteBishop; // Can block at e2, e3, e4, e5, e6, or e7

  // Bishop can block the attack
  expect(isCheckMate(matrix, whiteKing)).toBe(false);
});
