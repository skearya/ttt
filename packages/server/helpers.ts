// https://geoffrich.net/posts/tic-tac-toe/
function checkWinner(board: string[][]) {
    for (const row of board) {
        if (row.every((v) => v === "X") || row.every((v) => v === "O")) {
            return row[0];
        }
    }

    for (let i = 0; i < board[0].length; i++) {
        if (
            board[0][i] &&
            board[0][i] === board[1][i] &&
            board[1][i] === board[2][i]
        ) {
            return board[0][i];
        }
    }

    if (board[1][1] === "") {
        return;
    }

    if (board[0][0] === board[1][1] && board[1][1] == board[2][2]) {
        return board[0][0];
    }

    if (
        board[0][2] &&
        board[0][2] === board[1][1] &&
        board[1][1] == board[2][0]
    ) {
        return board[0][2];
    }

    let filledRowCount = 0;
    for (const row of board) {
        if (row.every((v) => v !== "")) {
            filledRowCount += 1;
        }
    }
    if (filledRowCount == 3) {
        return "Tied";
    }
}

export { checkWinner };
