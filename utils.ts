import axios from "axios";
import { io } from "socket.io-client";
import { Configuration, OpenAIApi } from "openai";
import { NextRouter } from "next/router";
import { localUrl,openAiKey } from "./localConfig";
const configuration = new Configuration({
  organization: "org-7I99Yz2EvJQXM3L3JeCjpgoa",
  apiKey: openAiKey,
});

const socket = io(`${localUrl}3001`);
export const joinRoom = (
  roomCode: string,
  player: { name: string; color: string },
  router: NextRouter
) => {
  const body = JSON.stringify({ roomCode, player });
  // Send request to server to join room
  // Server will return room state and redirect to game interface
  fetch(`${localUrl}3001/joinRoom`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        router.push(`/game/${roomCode}`);
      } else {
        //// Display error message
      }
    });
  socket.emit;
};

export async function getImageFromOpenAI(
  setImage: Function,
  setIsLoading: Function,
  roomCode: string,
  playerName: string,
  userInput: string
) {
  setIsLoading(true);

  const prompt = userInput;
  axios({
    method: "post",
    url: "https://api.openai.com/v1/images/generations",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    data: {
      prompt: prompt,
      n: 1,
      size: "512x512",
      response_format: "url",
    },
  })
    .then((response) => {
      const imageUrl = response.data.data[0].url;
      setImage(imageUrl);
      setIsLoading(false);
      socket.emit("setImage", { image: imageUrl, roomCode, playerName });
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function getGamePrompt() {
  const prompt = "Create a hilarious meme prompt: ";
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 2048,
    temperature: 0.7, // Adjust the temperature to control the creativity of the response
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
  });
  let response = "";

  if (completion.data.choices[0].text) {
    response = completion.data.choices[0].text.trim();
  }

  return response;
}
