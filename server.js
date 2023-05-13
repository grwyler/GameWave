const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const port = 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// handle requests to the /game/:roomCode route
app.get("/game/:roomCode", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Middleware that serves the index.html file
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Add CORS middleware for WebSocket upgrade requests
io.engine.on("headers", (headers) => {
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Methods"] = "GET, POST";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
});

const rooms = {};

// Express endpoint to create a new game
app.post("/createRoom", (req, res) => {
  const { roomName } = req.body;
  let roomCode;
  do {
    roomCode = Math.random().toString(36).substring(2, 8);
  } while (rooms[roomCode]);
  const room = {
    code: roomCode,
    name: roomName,
    players: [],
  };
  rooms[roomCode] = room;
  io.emit("roomsUpdated", Object.values(rooms));
  res.json({ success: true, roomCode });
});

// Express endpoint to join a game
app.post("/joinRoom", (req, res) => {
  const { roomCode, playerName } = req.body;

  // Find the game associated with the room code
  const room = rooms[roomCode];

  if (!room) {
    // Return an error if the room code is not valid
    return res.status(400).json({ error: "Invalid room code" });
  }

  // // Check if the player is already in the game
  // if (room.players.includes(playerName)) {
  //   // If so, return the current game state without modifying it
  //   return res.json({ success: true });
  // }

  // io.emit("roomsUpdated", Object.values(rooms));
  // Return the updated game state to the client
  res.json({ success: true });
});

// Handle new connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Send current rooms to new connection
  socket.emit("roomsUpdated", Object.values(rooms));

  // Handle joining a room
  socket.on("joinRoom", ({ roomCode, playerName }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback({ success: false, message: "Room not found", roomState: room });
    } else if (room.players.length >= 4) {
      callback({ success: false, message: "Room is full", roomState: room });
    } else if (!playerName || playerName === "") {
      callback({
        success: false,
        message: "Enter a Name",
        roomState: room,
      });
    } else if (room.players.includes(playerName)) {
      callback({
        success: false,
        message: `Another player is already called '${playerName}`,
        roomState: room,
      });
    } else {
      room.players.push(playerName);
      rooms[roomCode] = room;
      io.emit("roomsUpdated", Object.values(rooms));
      callback({ success: true, message: "", roomState: room });
      socket
        .to(roomCode)
        .emit("gameStateUpdated", { success: true, roomState: room });
      socket.join(roomCode);
    }
  });
  socket.on("leaveRoom", ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    console.log("room: ", room);

    if (room) {
      // Remove the player from the room
      const index = room.players.indexOf(playerName);
      if (index !== -1) {
        room.players.splice(index, 1);
        rooms[roomCode] = room;
        io.emit("roomsUpdated", Object.values(rooms));

        // Notify all other players in the room
        socket
          .to(roomCode)
          .emit("gameStateUpdated", { success: true, roomState: room });

        // If there are no players left in the room, remove the room
        if (room.players.length === 0) {
          delete rooms[roomCode];
          io.emit("roomsUpdated", Object.values(rooms));
        }
      }
    }
  });

  // Handle creating a new room
  socket.on("createRoom", ({ roomName, playerName }, callback) => {
    let roomCode;
    do {
      roomCode = Math.random().toString(36).substring(2, 8);
    } while (rooms[roomCode]);
    const room = {
      code: roomCode,
      name: roomName,
      players: [playerName],
    };
    rooms[roomCode] = room;
    io.emit("roomsUpdated", Object.values(rooms));
    callback({ success: true, roomState: room });
    socket.join(roomCode);
    socket.emit("playerJoined", playerName);
    socket.to(roomCode).emit("gameStateUpdated", room);
  });

  // Handle disconnect
  socket.on("disconnect", ({ playerName, roomCode }) => {
    console.log("A user disconnected");
    const room = rooms[roomCode];

    if (room) {
      // Remove the player from the room
      const index = room.players.indexOf(playerName);
      if (index !== -1) {
        room.players.splice(index, 1);
        rooms[roomCode] = room;
        io.emit("roomsUpdated", Object.values(rooms));

        // Notify all other players in the room
        socket
          .to(roomCode)
          .emit("gameStateUpdated", { success: true, roomState: room });

        // If there are no players left in the room, remove the room
        if (room.players.length === 0) {
          delete rooms[roomCode];
          io.emit("roomsUpdated", Object.values(rooms));
        }
      }
    }
    // Object.values(rooms).forEach((room) => {
    //   const index = room.players.indexOf(playerName);
    //   if (index >= 0) {
    //     room.players.splice(index, 1);
    //     socket.to(roomCode).emit("gameStateUpdated", room);
    //     io.to(room.code).emit("playerLeft", playerName);
    //   }
    // });
    // io.emit("roomsUpdated", Object.values(rooms));
  });
});
