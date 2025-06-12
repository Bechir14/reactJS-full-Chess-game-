import King from "./pieces/king";
import Knight from "./pieces/knigth";
import Pawn from "./pieces/pawn";

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

export default isCheckMate;
