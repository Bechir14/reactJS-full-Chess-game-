class King {
  constructor(name, initialPosition) {
    this.currentPosition = initialPosition;
    this.name = name;
    this.hasMoved = false;
    this.img = this.name[0] === "w" ? "/whiteKing.svg" : "/blackKing.svg";
  }

  isInCheck = (matrix, position) => {
    const enemyMoves = this.getAllPiecesPossibleMoves(matrix);
    return enemyMoves.some(
      (move) => move.row === position.row && move.col === position.col
    );
  };

  Move = (moves, currentPosition, matrix) => {
    matrix[currentPosition.row][currentPosition.col] = null;
    matrix[moves.row][moves.col] = this;

    // Handle castling
    if (moves.castling === "kingside") {
      const rook = matrix[moves.row][7];
      matrix[moves.row][5] = rook;
      matrix[moves.row][7] = null;
      rook.currentPosition = { row: moves.row, col: 5 };
      rook.hasMoved = true;
    } else if (moves.castling === "queenside") {
      const rook = matrix[moves.row][0];
      matrix[moves.row][3] = rook;
      matrix[moves.row][0] = null;
      rook.currentPosition = { row: moves.row, col: 3 };
      rook.hasMoved = true;
    }

    this.currentPosition = { row: moves.row, col: moves.col };
    this.hasMoved = true;
  };

  computePossibleMoves = (currentPosition, matrix) => {
    const possibleMoves = [];
    const { row, col } = currentPosition;

    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 }, // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 }, // right
      { dr: -1, dc: 1 }, // up-right
      { dr: -1, dc: -1 }, // up-left
      { dr: 1, dc: 1 }, // down-right
      { dr: 1, dc: -1 }, // down-left
    ];

    const possibleEnemyMoves = this.getAllPiecesPossibleMoves(matrix);

    for (const { dr, dc } of directions) {
      let r = row + dr;
      let c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = matrix[r][c];
        if (!target || target.name[0] !== this.name[0]) {
          let isCheckPosition = false;
          for (const move of possibleEnemyMoves) {
            if (move.row === r && move.col === c) isCheckPosition = true;
          }
          if (!isCheckPosition) possibleMoves.push({ row: r, col: c });
        }
      }
    }

    // === CASTLING ===
    if (!this.hasMoved && !this.isInCheck(matrix, currentPosition)) {
      const sameColor = this.name[0];

      // Kingside castling
      const kingsideRook = matrix[row][7];
      if (
        kingsideRook &&
        !kingsideRook.hasMoved &&
        matrix[row][5] === null &&
        matrix[row][6] === null
      ) {
        const passingSquares = [
          { row: row, col: 5 },
          { row: row, col: 6 },
        ];
        const safe = passingSquares.every(
          (square) =>
            !possibleEnemyMoves.some(
              (move) => move.row === square.row && move.col === square.col
            )
        );
        if (safe) {
          possibleMoves.push({ row, col: 6, castling: "kingside" });
        }
      }

      // Queenside castling
      const queensideRook = matrix[row][0];
      if (
        queensideRook &&
        !queensideRook.hasMoved &&
        matrix[row][1] === null &&
        matrix[row][2] === null &&
        matrix[row][3] === null
      ) {
        const passingSquares = [
          { row: row, col: 3 },
          { row: row, col: 2 },
        ];
        const safe = passingSquares.every(
          (square) =>
            !possibleEnemyMoves.some(
              (move) => move.row === square.row && move.col === square.col
            )
        );
        if (safe) {
          possibleMoves.push({ row, col: 2, castling: "queenside" });
        }
      }
    }

    return possibleMoves;
  };

  getAllPiecesPossibleMoves = (matrix) => {
    const allPossibleMoves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = matrix[row][col];
        if (piece && piece !== null) {
          if (piece.name[0] !== this.name[0] && !(piece instanceof King)) {
            const potentialMoves = piece.computePossibleMoves(
              { row, col },
              matrix
            );
            for (const move of potentialMoves) {
              allPossibleMoves.push(move);
            }
          }
        }
      }
    }
    return allPossibleMoves;
  };
}

export default King;
