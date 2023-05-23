import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { joinRoom } from "../../utils";
import { SwatchesPicker } from "react-color";

// const colors = [
//   "#FF0000", // Red
//   "#FFA500", // Orange
//   "#008000", // Green
//   "#00FFFF", // Cyan
//   "#0000FF", // Blue
//   "#4B0082", // Indigo
//   "#9400D3", // Violet
//   "#FF1493", // Pink
//   "#FF69B4", // Hot pink
//   "#B22222", // Firebrick
//   "#FFD700", // Gold
//   "#FF8C00", // Dark orange
//   "#FF6347", // Tomato
//   "#DC143C", // Crimson
//   "#FF00FF", // Magenta
//   "#800080", // Purple
//   "#8B0000", // Dark red
//   "#00FF7F", // Spring green
//   "#000080", // Navy
// ];

const JoinRoomModal = ({
  roomCode,
  roomName,
  isJoiningRoom,
  setIsJoiningRoom,
}: {
  roomCode: string;
  roomName: string;
  isJoiningRoom: boolean;
  setIsJoiningRoom: Function;
}) => {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [playerColor, setPlayerColor] = useState("#000000");

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);
  useEffect(() => {
    const storedColer = localStorage.getItem("playerColor");
    if (storedColer) {
      setPlayerColor(storedColer);
    }
  }, []);

  const handleSetPlayerName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem("playerName", name);
  };

  const handleSetPlayerColor = (colorHEX: string) => {
    setPlayerColor(colorHEX);
    localStorage.setItem("playerColor", colorHEX);
  };

  const handleJoinRoom = () => {
    joinRoom(roomCode, { name: playerName, color: playerColor }, router);
  };
  return (
    <Modal show={isJoiningRoom}>
      <Modal.Header>{`Joining ${roomName}`}</Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Label>Player Name</Form.Label>
          <Form.Control
            type="input"
            placeholder="Your Player Name"
            value={playerName}
            onChange={(e) => handleSetPlayerName(e.target.value)}
          />
          <Form.Label>Player Color</Form.Label>
          <SwatchesPicker
            color={playerColor}
            onChange={(color) => handleSetPlayerColor(color.hex)}
            className="w-100"
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsJoiningRoom(false)}>
          Cancel
        </Button>
        <Button disabled={playerName.length < 2} onClick={handleJoinRoom}>
          Join
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JoinRoomModal;
