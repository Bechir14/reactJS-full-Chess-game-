import Bishop from "./pieces/bishop";
import King from "./pieces/king";
import Knight from "./pieces/knigth";
import Pawn from "./pieces/pawn";
import Queen from "./pieces/queen";
import Rook from "./pieces/rook";

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

  return matrix;
};

export default initializeMatrix;
