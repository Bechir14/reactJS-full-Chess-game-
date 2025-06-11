class Pawn {
  constructor(name, initialPosition) {
    this.currentPosition = initialPosition;
    this.name = name;
    this.hasMoved = false;
    this.img = name.startsWith("w") ? "/whitePawn.svg" : "/blackPawn.svg";
  }

  Move = (move, currentPosition, matrix) => {
    matrix[currentPosition.row][currentPosition.col] = null;
    matrix[move.row][move.col] = this;
    this.hasMoved = true;
  };

  computePossibleMoves = (currentPosition, matrix) => {
    const possibleMoves = [];
    const direction = this.name.startsWith("w") ? 1 : -1;
    const { row, col } = currentPosition;

    const oneStepForward = matrix[row + direction]?.[col];
    if (!oneStepForward) {
      possibleMoves.push({ row: row + direction, col });

      if (!this.hasMoved) {
        const twoStepsForward = matrix[row + direction * 2]?.[col];
        if (!twoStepsForward) {
          possibleMoves.push({ row: row + direction * 2, col });
        }
      }
    }

    const captureLeft = matrix[row + direction]?.[col - 1];
    if (captureLeft) {
      possibleMoves.push({ row: row + direction, col: col - 1 });
    }

    const captureRight = matrix[row + direction]?.[col + 1];
    if (captureRight) {
      possibleMoves.push({ row: row + direction, col: col + 1 });
    }

    return possibleMoves;
  };
}

export default Pawn;
