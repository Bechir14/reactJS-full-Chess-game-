import King from "./pieces/king";
import Knight from "./pieces/knigth";
import Pawn from "./pieces/pawn";

const isCheckMate = (matrix, king) => {
  const currentPosition = king.currentPosition;
  const { row, col } = currentPosition;

  const allEnemyMoves = king.getAllPiecesPossibleMoves(matrix);
  const isInCheck = allEnemyMoves.some(
    (move) => move.row === row && move.col === col
  );

  if (!isInCheck) return false;

  const kingMoves = king.computePossibleMoves(currentPosition, matrix);
  const safeKingMoves = kingMoves.filter((move) => {
    const tempMatrix = deepCopyMatrix(matrix);
    tempMatrix[row][col] = null;
    tempMatrix[move.row][move.col] = king;

    const enemyMovesAfterKingMove = getAllEnemyMoves(tempMatrix, king.name[0]);
    return !enemyMovesAfterKingMove.some(
      (enemyMove) => enemyMove.row === move.row && enemyMove.col === move.col
    );
  });

  if (safeKingMoves.length > 0) return false;
  const threats = findThreats(matrix, king);

  if (threats.length > 1) return true;

  const threat = threats[0];
  const allies = getAllies(matrix, king.name[0]);

  if (canCaptureThreat(allies, threat, matrix, king)) {
    return false;
  }

  if (canBlockThreat(allies, threat, king, matrix)) {
    return false;
  }

  return true;
};

const deepCopyMatrix = (matrix) => {
  return matrix.map((row) =>
    row.map((cell) => {
      if (!cell) return null;
      const copy = Object.assign(
        Object.create(Object.getPrototypeOf(cell)),
        cell
      );
      Object.keys(cell).forEach((key) => {
        if (typeof cell[key] === "object" && cell[key] !== null) {
          copy[key] = { ...cell[key] };
        } else {
          copy[key] = cell[key];
        }
      });
      return copy;
    })
  );
};

const getAllEnemyMoves = (matrix, playerColor) => {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = matrix[r][c];
      if (piece && piece.name[0] !== playerColor) {
        const pieceMoves = piece.computePossibleMoves(
          { row: r, col: c },
          matrix
        );
        moves.push(...pieceMoves);
      }
    }
  }
  return moves;
};

const findThreats = (matrix, king) => {
  const threats = [];
  const { row: kingRow, col: kingCol } = king.currentPosition;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = matrix[r][c];
      if (piece && piece.name[0] !== king.name[0] && !(piece instanceof King)) {
        const moves = piece.computePossibleMoves({ row: r, col: c }, matrix);
        const isThreat = moves.some(
          (m) => m.row === kingRow && m.col === kingCol
        );
        if (isThreat) {
          threats.push({ piece, from: { row: r, col: c } });
        }
      }
    }
  }
  return threats;
};

const getAllies = (matrix, playerColor) => {
  const allies = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = matrix[r][c];
      if (piece && piece.name[0] === playerColor) {
        allies.push({ piece, position: { row: r, col: c } });
      }
    }
  }
  return allies;
};

const canCaptureThreat = (allies, threat, matrix, king) => {
  for (const ally of allies) {
    const moves = ally.piece.computePossibleMoves(ally.position, matrix);
    const canCapture = moves.some(
      (move) => move.row === threat.from.row && move.col === threat.from.col
    );

    if (canCapture) {
      const tempMatrix = deepCopyMatrix(matrix);
      tempMatrix[ally.position.row][ally.position.col] = null;
      tempMatrix[threat.from.row][threat.from.col] = ally.piece;

      const enemyMoves = getAllEnemyMoves(tempMatrix, king.name[0]);
      const kingStillSafe = !enemyMoves.some(
        (move) =>
          move.row === king.currentPosition.row &&
          move.col === king.currentPosition.col
      );

      if (kingStillSafe) return true;
    }
  }
  return false;
};

const canBlockThreat = (allies, threat, king, matrix) => {
  if (threat.piece instanceof Pawn || threat.piece instanceof Knight) {
    return false;
  }

  const path = getPathToKing(threat, king);
  if (path.length === 0) return false;

  for (const ally of allies) {
    if (ally.piece instanceof King) continue;

    const moves = ally.piece.computePossibleMoves(ally.position, matrix);

    for (const pathSquare of path) {
      const canBlock = moves.some(
        (move) => move.row === pathSquare.row && move.col === pathSquare.col
      );

      if (canBlock) {
        const tempMatrix = deepCopyMatrix(matrix);
        tempMatrix[ally.position.row][ally.position.col] = null;
        tempMatrix[pathSquare.row][pathSquare.col] = ally.piece;

        const enemyMoves = getAllEnemyMoves(tempMatrix, king.name[0]);
        const kingStillSafe = !enemyMoves.some(
          (move) =>
            move.row === king.currentPosition.row &&
            move.col === king.currentPosition.col
        );

        if (kingStillSafe) return true;
      }
    }
  }
  return false;
};

const getPathToKing = (threat, king) => {
  const threatPaths = threat.piece.possiblePaths || [];

  for (const path of threatPaths) {
    if (
      path.length > 0 &&
      path[path.length - 1].row === king.currentPosition.row &&
      path[path.length - 1].col === king.currentPosition.col
    ) {
      return path.slice(0, -1);
    }
  }
  return [];
};

export default isCheckMate;
