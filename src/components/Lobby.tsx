import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectRooms, setRooms } from "./redux/lobbySlice";

const socket = io("http://localhost:3001");

const Lobby = () => {
  const rooms = useSelector(selectRooms);
  debugger;
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle real-time updates to available rooms
    socket.on("roomsUpdated", (updatedRooms) => {
      dispatch(setRooms(updatedRooms));
    });
  }, [dispatch]);

  const joinRoom = () => {
    // Send request to server to join room
    // Server will return room state and redirect to game interface
    fetch("http://localhost:3001/joinRoom", {
      method: "POST",
      body: JSON.stringify({ roomCode, playerName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("playerName", playerName);
          router.push(`/game/${roomCode}`);
        } else {
          //// Display error message
        }
      });
    socket.emit;
  };

  const createRoom = () => {
    // // Send request to server to create new room
    // // Server will return room code and redirect to game interface
    fetch("http://localhost:3001/createRoom", {
      method: "POST",
      body: JSON.stringify({ roomName, playerName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("playerName", playerName);
          router.push(`/game/${data.roomCode}`);
        } else {
          // Display error message
        }
      });
  };

  return (
    <div>
      <h1>Join a Game or Create a New Game</h1>
      <div>
        <h2>Join a Game</h2>
        <label htmlFor="roomCode">Enter Room Code:</label>
        <input
          type="text"
          id="roomCode"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <label htmlFor="playerName">Enter Your Name:</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <h2>Create a New Game</h2>
        <label htmlFor="roomName">Enter Room Name:</label>
        <input
          type="text"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <label htmlFor="playerName">Enter Your Name:</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
      </div>
      <h2>Available Rooms:</h2>
      <ul>
        {rooms.map(
          (room: { code: string; name: string; players: string[] }) => (
            <li key={room.code}>
              <p>{room.name}</p>
              <p>Players: {room.players.join(", ")}</p>
              <p>Code: {room.code}</p>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default Lobby;
