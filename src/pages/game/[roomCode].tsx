import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import { IoChevronBackOutline } from "react-icons/io5";
import { getGamePrompt, getImageFromOpenAI } from "../../../utils";
import { FaSpinner } from "react-icons/fa";
import { BsArrowClockwise, BsCheckCircle } from "react-icons/bs";
import axios from "axios";
import { localUrl } from "../../../localConfig";

const socket = io(`${localUrl}3001`);

// const speakText = async (text) => {
//   if ("speechSynthesis" in window) {
//     const speech = new SpeechSynthesisUtterance(text);
//     speech.lang = "en-US";
//     speech.voiceURI = "Microsoft David"; // Set the voice URI to the desired voice
//     window.speechSynthesis.speak(speech);
//   } else {
//     console.error("Text-to-speech is not supported in this browser.");
//   }
// };

const Game = () => {
  const router = useRouter();
  const { roomCode } = router.query;
  const isCreator = router.query.creator === "true";
  debugger;
  const [roomState, setRoomState] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [noun, setNoun] = useState("");
  const [image, setImage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gamePrompt, setGamePrompt] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReadyToVote, setIsReadyToVote] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  // const [shuffledPlayers, setShuffledPlayers] = useState([]);
  // const gamePrompt = useSelector(selectGamePrompt);

  const dispatch = useDispatch();
  // derived state
  const player = roomState?.players?.find((p) => p.name === playerName);
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName && playerName.length === 0) {
      setPlayerName(storedName);
    }
  }, [playerName.length]);
  useEffect(() => {
    debugger;
    if (roomCode && (playerName.length > 0 || isCreator)) {
      // When the component mounts, join the room using the room code in the URL
      socket.emit(
        "joinRoom",
        { roomCode, player: { name: isCreator ? "Host" : playerName } },
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
          setIsVoting(roomState.isVoting);
          setRoomState(roomState);
        }
      });
    }
  }, [isCreator, playerName, roomCode, router]);
  useEffect(() => {
    if (gamePrompt === "" && !isLoading) {
      setIsLoading(true);
      getGamePrompt().then((response) => {
        setGamePrompt(response);
        setIsLoading(false);
        // speakText(response);
      });
    }
  }, [dispatch, gamePrompt, isLoading]);

  useEffect(() => {
    if (roomState && roomState.players && roomState.players.length > 0) {
      setIsReadyToVote(
        roomState.players.every(
          (player) => player.isSubmitted === true || player.name === "Host"
        )
      );
    }
  }, [roomState]);

  const handleBackToLobby = () => {
    socket.emit("leaveRoom", {
      roomCode,
      playerName: playerName,
    });
    router.push("/");
  };

  const handleGenerateImage = async () => {
    getImageFromOpenAI(setImage, setIsLoading, roomCode, playerName, userInput);
  };
  const handleSubmit = () => {
    socket.emit("submitImage", { playerName, roomCode });
    setIsSubmitted(true);
  };
  const handleCancel = () => {
    socket.emit("cancelImage", { playerName, roomCode });
    setIsSubmitted(false);
  };
  const handleVote = () => {
    // setIsVoting(true);
    socket.emit("isVoting", { roomCode, gamePrompt });
  };
  return (
    <div style={{ height: "100vh" }}>
      {roomState ? (
        <div>
          <Button onClick={handleBackToLobby} variant="secondary m-2">
            <IoChevronBackOutline />
          </Button>
          {isCreator ? (
            <Container fluid>
              <h1
                style={{ height: 150 }}
                className="text-center align-items-center border"
              >
                {gamePrompt}
              </h1>
              <div className="d-flex mt-2">
                {roomState.players.map(
                  (p, index) =>
                    p.name !== "Host" && (
                      <div key={index} className="m-2">
                        <span>{p.name} </span>
                        {p.isSubmitted && (
                          <BsCheckCircle className="text-success" />
                        )}
                      </div>
                    )
                )}
              </div>
              <Button
                variant="primary mt-2"
                onClick={() => {
                  setGamePrompt("");
                }}
              >
                Generate Another Prompt
              </Button>
              <Button
                variant="success mt-2 ms-2"
                disabled={!isReadyToVote}
                onClick={handleVote}
              >
                Vote
              </Button>
            </Container>
          ) : (
            <Container fluid>
              {isVoting ? (
                <div>
                  {roomState.players.map((p) => {
                    <h1 className="text-center">{roomState.gamePrompt}</h1>;
                    return (
                      <Container fluid key={`${p.name}-vote`}>
                        {p.image && (
                          <img
                            src={p.image}
                            alt="img"
                            style={{ maxWidth: "100%" }}
                          />
                        )}
                      </Container>
                    );
                  })}
                </div>
              ) : (
                <>
                  <Row style={{ minHeight: 400 }}>
                    {player.image && (
                      <img
                        src={player.image}
                        alt="img"
                        style={{ maxWidth: "100%" }}
                      />
                    )}
                  </Row>
                  <Form>
                    <Form.Group className="mt-2">
                      <div className="input-group">
                        <Form.Control
                          type="input"
                          placeholder="What kind of image do you want?"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                        />
                        <div className="input-group-append">
                          <Button
                            disabled={
                              userInput === "" || isLoading || isSubmitted
                            }
                            onClick={handleGenerateImage}
                          >
                            {isLoading ? (
                              <FaSpinner className="spin-animation" />
                            ) : (
                              <BsArrowClockwise />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Form.Group>
                  </Form>

                  <Button
                    disabled={player.image === "" || isLoading || isSubmitted}
                    variant="success mt-2 d-block"
                    onClick={handleSubmit}
                  >
                    Submit Image
                  </Button>
                  {isSubmitted && (
                    <Button
                      disabled={player.image === "" || isLoading}
                      variant="secondary mt-2 d-block"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              )}
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
