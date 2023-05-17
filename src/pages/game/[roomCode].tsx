import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import { IoChevronBackOutline } from "react-icons/io5";
import { adjectiveArray, getImageFromOpenAI, nounArray } from "../../../utils";
import { Combobox, Multiselect } from "react-widgets/cjs";
import LoadingIndicator from "@/components/LoadingIndicator";

const socket = io("http://192.168.0.4:3001");

const Game = () => {
  const router = useRouter();
  const { roomCode } = router.query;
  const [roomState, setRoomState] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [adjective, setAdjective] = useState("");
  const [noun, setNoun] = useState("");
  const [image, setImage] = useState("");
  const [adjectives, setAdjectives] = useState([]);
  const [selectedNoun, setSelectedNoun] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // derived state
  const player = roomState?.players?.find((p) => p.name === playerName);
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName && playerName.length === 0) {
      setPlayerName(storedName);
    }
  }, [playerName.length]);
  useEffect(() => {}, [roomState]);
  useEffect(() => {
    if (roomCode && playerName.length > 0) {
      // When the component mounts, join the room using the room code in the URL
      socket.emit(
        "joinRoom",
        { roomCode, playerName },
        ({ success, message, roomState }) => {
          if (success) {
            setRoomState(roomState);
          } else {
            console.error("Failed to join room:", message);
          }
        }
      );

      // Listen for updates to the game state
      socket.on("gameStateUpdated", ({ success, roomState }) => {
        if (success) {
          setRoomState(roomState);
        }
      });
    }
  }, [playerName, roomCode]);
  const handleStartGame = () => {
    socket.emit("startGame");
    setIsStarted(true);
    getImageFromOpenAI(setImage, setAdjective, setNoun, roomCode);
  };
  const handleBackToLobby = () => {
    socket.emit("leaveRoom", {
      roomCode,
      playerName: playerName,
    });
    router.push("/");
  };

  const handleAdjectiveChange = (values) => {
    setAdjectives(values);
  };

  const handleGenerateImage = async () => {
    setIsLoading(true);

    try {
      await getImageFromOpenAI(setImage, roomCode, playerName, userInput);
      // Do something with the generated image
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = () => {};
  return (
    <div style={{ height: "100vh" }}>
      {roomState ? (
        <div>
          <Button onClick={handleBackToLobby} variant="secondary m-2">
            <IoChevronBackOutline />
          </Button>
          {/* <h1>Game Board</h1> */}

          {/* <Container fluid>
            {image && (
              <Row>
                <img src={image} alt="img" style={{ maxWidth: "100%" }} />
              </Row>
            )}
            <Row>
              <Col className="text-right">{adjective}</Col>
              <Col>{noun}</Col>
            </Row>
          </Container> */}
          <ul>
            {roomState.players.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
          {player.isLeader ? (
            <Button
              onClick={handleStartGame}
              disabled={roomState.players.length < 2}
              variant="primary m-2"
            >
              Get Image
            </Button>
          ) : (
            <Container fluid>
              <Row>
                {isLoading && <LoadingIndicator />}
                {player.image && (
                  <img
                    src={player.image}
                    alt="img"
                    style={{ maxWidth: "100%" }}
                  />
                )}
              </Row>
              {/* <Row>
                <Col className="justify-content-end">{adjective}</Col>
                <Col>{noun}</Col>
              </Row> */}
              <Form>
                {/* <Form.Label>Adjectives</Form.Label> */}
                {/* <Multiselect
                  data={adjectiveArray}
                  onChange={handleAdjectiveChange}
                  onCreate={(name) => setAdjectives([...adjectives, name])}
                  value={adjectives}
                  placeholder="Add Adjectives"
                  allowCreate={"onFilter"} // enable create option
                />
                <Form.Label>Noun</Form.Label>
                <Combobox
                  hideCaret
                  hideEmptyPopup
                  value={selectedNoun}
                  onChange={(noun) => setSelectedNoun(noun)}
                  data={nounArray}
                  placeholder="Enter a Noun"
                /> */}
                <Form.Control
                  type="input"
                  placeholder="What kind of image do you want?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </Form>
              <Button
                disabled={userInput === ""}
                className="mt-2"
                onClick={handleGenerateImage}
              >
                Generate Image
              </Button>
              <Button
                disabled={!player.image}
                variant="success mt-2 d-block"
                onClick={handleSubmit}
              >
                Submit Image
              </Button>
            </Container>
          )}
        </div>
      ) : (
        <div>Loading game...</div>
      )}
    </div>
  );
};

export default Game;
