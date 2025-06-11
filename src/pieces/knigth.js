class Knight {
  constructor(name, initialPosition) {
    this.currentPosition = initialPosition;
    this.name = name;
    this.img = this.name[0] === "w" ? "/whiteKnight.svg" : "/blackKnight.svg";
  }

  Move = (moves, currentPosition, matrix) => {
    matrix[currentPosition.row][currentPosition.col] = null;
    matrix[moves.row][moves.col] = this;
  };
  computePossibleMoves = (currentPosition, matrix) => {
    const possibleMoves = [];
    const { row, col } = currentPosition;

    const directions = [
      { dr: -2, dc: 1 }, // up-right     _|           |_
      { dr: -2, dc: -1 }, // up-left     _  the knigth _
      { dr: 2, dc: 1 }, // down-right     |           |
      { dr: 2, dc: -1 }, // down-left
      { dr: 1, dc: 2 }, //right-up
      { dr: -1, dc: 2 }, //right-down
      { dr: -1, dc: -2 }, //left-up
      { dr: 1, dc: -2 }, //left-right
    ];
    for (const { dr, dc } of directions) {
      let r = row + dr;
      let c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = matrix[r][c];
        if (!target || target.name[0] !== this.name[0]) {
          possibleMoves.push({ row: r, col: c });
        }
      }
    }
    return possibleMoves;
  };
}
export default Knight;
