import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    GameData,
} from "@ttt/types/index";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { checkWinner } from "./helpers";

dotenv.config({ path: "../../.env" });
const port = 3000;
const app = express()
    .use(cors({ origin: process.env.FRONTEND_URL }))
    .use(express.json());
const httpServer = createServer(app);
const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(httpServer, {
    serveClient: false,
    cors: {
        origin: [process.env.FRONTEND_URL!],
    },
    cleanupEmptyChildNamespaces: true,
});

let data: {
    [namespace: string]: GameData;
} = {};

app.get("/rooms", (_req, res) => {
    let rooms: Record<string, number> = {};

    for (let roomName of Object.keys(data).filter(
        (room) => data[room].public
    )) {
        rooms[roomName] = io.of(roomName).sockets.size;
    }

    return res.json(rooms);
});

app.post("/createRoom", (req, res) => {
    if (`/${req.body.name}` in data) {
        return res.status(400).json({
            type: "error",
            message: "Room already created",
        });
    }
    if (!/^\/\w+$/.test(`/${req.body.name}`)) {
        return res.status(400).json({
            type: "error",
            message: "Bad room name",
        });
    }
    if ((req.body.name as string).length > 12) {
        return res.status(400).json({
            type: "error",
            message: "Room name too long",
        });
    }

    data[`/${req.body.name}`] = {
        public: req.body.public,
        board: [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ],
        startingTurn: "X",
        currentTurn: "X",
        rematches: 0,
        status: {
            over: false,
            winner: undefined,
            rematchVotes: 0,
        },
    };

    return res.json({
        type: "success",
        room: req.body.name,
        public: req.body.public,
    });
});

const parentNamespace = io.of(/^\/\w+$/);

parentNamespace.use((socket, next) => {
    if (!(socket.nsp.name in data)) {
        return next(new Error("Room does not exist"));
    }
    if (io.of(socket.nsp.name).sockets.size > 1) {
        return next(new Error("Max players reached"));
    }
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Invalid username"));
    }
    // check if username has been taken later
    socket.data.username = username;
    next();
});

parentNamespace.on("connection", (socket) => {
    socket.data.playerType =
        Array.from(io.of(socket.nsp.name).sockets)[0][1].data.playerType == "X"
            ? "O"
            : "X";

    io.of(socket.nsp.name).emit("data", data[socket.nsp.name]);
    io.of(socket.nsp.name).emit(
        "players",
        Array.from(
            io.of(socket.nsp.name).sockets,
            ([_k, v]) => `${v.data.username} (${v.data.playerType})`
        )
    );

    socket.on("boardUpdate", ({ row, col }) => {
        if (data[socket.nsp.name].board[row][col] !== "") {
            return;
        }
        if (data[socket.nsp.name].currentTurn !== socket.data.playerType) {
            return;
        }
        if (data[socket.nsp.name].status.over == true) {
            return;
        }

        data[socket.nsp.name].board[row][col] = socket.data.playerType!;
        data[socket.nsp.name].currentTurn =
            data[socket.nsp.name].currentTurn == "X" ? "O" : "X";
        io.of(socket.nsp.name).emit("data", data[socket.nsp.name]);

        let winner = checkWinner(data[socket.nsp.name].board);
        if (winner !== undefined) {
            data[socket.nsp.name].status = {
                over: true,
                rematchVotes: 0,
                winner,
            };
            io.of(socket.nsp.name).emit("data", data[socket.nsp.name]);
        }
    });

    socket.on("rematch", () => {
        if (socket.data.hasVoted) return;

        data[socket.nsp.name].status.rematchVotes += 1;
        socket.data.hasVoted = true;
        io.of(socket.nsp.name).emit("data", data[socket.nsp.name]);

        if (data[socket.nsp.name].status.rematchVotes == 2) {
            io.of(socket.nsp.name).sockets.forEach((socket) => {
                socket.data.hasVoted = false;
            });
            data[socket.nsp.name] = {
                public: data[socket.nsp.name].public,
                board: [
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                ],
                startingTurn:
                    data[socket.nsp.name].startingTurn == "X" ? "O" : "X",
                currentTurn:
                    data[socket.nsp.name].startingTurn == "X" ? "O" : "X",
                rematches: (data[socket.nsp.name].rematches || 0) + 1,
                status: {
                    over: false,
                    winner: undefined,
                    rematchVotes: 0,
                },
            };
            io.of(socket.nsp.name).emit("data", data[socket.nsp.name]);
        }
    });

    socket.on("disconnect", () => {
        if (io.of(socket.nsp.name).sockets.size == 0) {
            delete data[socket.nsp.name];
        }
    });
});

httpServer.listen(port, "localhost", () => {
    console.log(`http://localhost:${port}/`);
});
