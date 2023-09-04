interface ServerToClientEvents {
    players: (map: Array<string>) => void;
    data: (game: GameData) => void;
}

interface ClientToServerEvents {
    boardUpdate: (update: { row: number; col: number }) => void;
    rematch: () => void;
}

interface InterServerEvents {}

interface SocketData {
    username: string;
    playerType: "X" | "O" | undefined;
    hasVoted: boolean;
}

interface GameData {
    public: boolean;
    board: Array<Array<string>>;
    startingTurn: "X" | "O";
    currentTurn: "X" | "O";
    rematches: number;
    status: {
        over: boolean;
        winner: string | undefined;
        rematchVotes: number;
    };
}

export {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    GameData,
};
