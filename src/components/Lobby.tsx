import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectRooms, setRooms } from "./redux/lobbySlice";
import RoomList from "./RoomList";
import { Button, Form } from "react-bootstrap";

const socket = io("http://192.168.0.4:3001");

const Lobby = () => {
  const rooms = useSelector(selectRooms);
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle real-time updates to available rooms
    socket.on("roomsUpdated", (updatedRooms) => {
      dispatch(setRooms(updatedRooms));
    });
  }, [dispatch]);
  const createRoom = () => {
    // // Send request to server to create new room
    // // Server will return room code and redirect to game interface
    fetch("http://192.168.0.4:3001/createRoom", {
      method: "POST",
      body: JSON.stringify({ roomName, playerName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          router.push(`/game/${data.roomCode}`);
        } else {
          // Display error message
        }
      });
  };
  const handleSetPlayerName = (name) => {
    localStorage.setItem("playerName", name);
    setPlayerName(name);
  };
  return (
    <div>
      <div>
        <h2>Create a New Room</h2>
        <Form.Control
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Your Player Name"
          className="mt-2"
          value={playerName}
          onChange={(e) => handleSetPlayerName(e.target.value)}
        />

        <Button
          variant="success mt-2"
          disabled={roomName.length < 2 || playerName.length < 2}
          onClick={createRoom}
        >
          Create Room
          {/* <div>
            <FontAwesomeIcon icon={faPlus} size="sm" className="fa fa-sm" />
          </div> */}
        </Button>
      </div>
      <h2>Available Rooms:</h2>
      <div>
        <RoomList rooms={rooms} />
      </div>

      {/* <ul>
        {rooms.map((room) => (
          <li key={room.code}>
            <p>{room.name}</p>
            <p>Players: {room.players.join(", ")}</p>
            <p>Code: {room.code}</p>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Lobby;
