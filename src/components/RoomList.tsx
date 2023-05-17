import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";

import JoinRoomModal from "./JoinRoomModal";

const RoomList = ({ rooms }) => {
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const handleEnterPlayerName = (room) => {
    setRoomCode(room.code);
    setRoomName(room.name);
    setIsJoiningRoom(true);
  };

  return (
    <>
      {Array.isArray(rooms) &&
        rooms.map((room) => (
          <Card key={room.code} className="m-2">
            <Card.Header>{room.name}</Card.Header>
            <Card.Body>
              <p>
                Players: {room.players.map((player) => player.name).join(", ")}
              </p>

              <Button
                variant="primary m-1"
                onClick={() => handleEnterPlayerName(room)}
              >
                Join Room{" "}
                {/* <FontAwesomeIcon icon={faPlug} size="sm" className="fa-sm" /> */}
              </Button>
            </Card.Body>
          </Card>
        ))}
      <JoinRoomModal
        roomCode={roomCode}
        roomName={roomName}
        isJoiningRoom={isJoiningRoom}
        setIsJoiningRoom={setIsJoiningRoom}
      />
    </>
  );
};

export default RoomList;
