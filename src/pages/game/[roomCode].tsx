import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

const Game = () => {
  const router = useRouter();
  const { roomCode } = router.query;
  const [roomState, setRoomState] = useState(null);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    }
  }, [setPlayerName]);

  useEffect(() => {
    if (roomCode && playerName !== "") {
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

      // Clean up the event listener when the component unmounts
      return () => {
        // if (roomCode && playerName !== "") {
        //   socket.emit("leaveRoom", {
        //     roomCode,
        //     playerName,
        //   });
        // }
        // socket.off("gameStateUpdated");
        // socket.disconnect();
      };
    }
  }, [roomCode, playerName]);

  const handleBeforeUnload = useCallback(
    (e) => {
      e.preventDefault();
      const storedName = localStorage.getItem("playerName");
      if (storedName) setPlayerName(storedName);
      if (roomCode && playerName) {
        debugger;
        socket.emit("leaveRoom", {
          roomCode,
          playerName,
        });
      }
      e.returnValue = "";
    },
    [playerName, roomCode]
  );

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    } else {
      // handle the case where the player name is not set
    }

    // Add an event listener to the beforeunload event
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Cleanup function

      // socket.disconnect();
      // if (roomCode && playerName) {
      //   socket.emit("leaveRoom", {
      //     roomCode,
      //     playerName,
      //   });
      // }
    };
  }, [handleBeforeUnload, playerName, roomCode]);

  const handleStartGame = () => {
    socket.emit("startGame");
  };

  return (
    <div style={{ height: "100vh" }}>
      {roomState ? (
        <div>
          <h1>Game Board</h1>
          {/* Display the game board here */}
          <ul>
            {roomState.players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      ) : (
        <div>Loading game...</div>
      )}
    </div>
  );
};

export default Game;
