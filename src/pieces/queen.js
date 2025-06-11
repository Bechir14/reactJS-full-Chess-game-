class Queen {
  constructor(name, initialPosition) {
    this.name = name;
    this.hasMoved = false;
    this.img = this.name[0] === "w" ? "/whiteQueen.svg" : "/blackQueen.svg";
    this.currentPosition = initialPosition;
    this.possiblePaths = [];
  }

  Move = (moves, currentPosition, matrix) => {
    matrix[currentPosition.row][currentPosition.col] = null;
    matrix[moves.row][moves.col] = this;
    this.hasMoved = true;
  };

  computePossibleMoves = (currentPosition, matrix) => {
    const possibleMoves = [];
    const { row, col } = currentPosition;
    this.possiblePaths = [];

    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 }, // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 }, // right
      { dr: -1, dc: 1 }, //up-right
      { dr: -1, dc: -1 }, //up-left
      { dr: 1, dc: 1 }, //down-right
      { dr: 1, dc: -1 }, //down-left
    ];
    let pathIndex = 0;
    for (const { dr, dc } of directions) {
      let r = row + dr;
      let c = col + dc;
      this.possiblePaths[pathIndex] = [];
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = matrix[r][c];
        this.possiblePaths[pathIndex].push({ row: r, col: c });
        if (!target) {
          possibleMoves.push({ row: r, col: c });
        } else {
          if (target.name[0] !== this.name[0]) {
            possibleMoves.push({ row: r, col: c });
          }
          break;
        }
        r += dr;
        c += dc;
      }
      pathIndex++;
    }
    this.possiblePaths = this.possiblePaths.filter((path) => path.length !== 0);
    return possibleMoves;
  };
}
export default Queen;
