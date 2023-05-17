import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://192.168.0.4:3001");
export const joinRoom = (roomCode, router) => {
  const body = JSON.stringify({ roomCode });
  // Send request to server to join room
  // Server will return room state and redirect to game interface
  fetch("http://192.168.0.4:3001/joinRoom", {
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
export const adjectiveArray = [
  "zany",
  "quirky",
  "whimsical",
  "wacky",
  "kooky",
  "goofy",
  "absurd",
  "bizarre",
  "eccentric",
  "offbeat",
  "outrageous",
  "ridiculous",
  "far-out",
  "nutty",
  "silly",
  "loony",
  "witty",
  "daffy",
  "flaky",
  "weird",
  "amazing",
  "beautiful",
  "brave",
  "bright",
  "calm",
  "charming",
  "clever",
  "cool",
  "courageous",
  "creative",
  "cunning",
  "daring",
  "delightful",
  "eager",
  "fearless",
  "festive",
  "friendly",
  "funny",
  "generous",
  "gentle",
  "glamorous",
  "graceful",
  "happy",
  "healthy",
  "helpful",
  "honest",
  "humorous",
  "intelligent",
  "jolly",
  "joyful",
  "kind",
  "lovely",
  "lucky",
  "magnificent",
  "mighty",
  "neat",
  "nice",
  "optimistic",
  "passionate",
  "peaceful",
  "polite",
  "powerful",
  "pretty",
  "proud",
  "quiet",
  "silly",
  "sincere",
  "smart",
  "strong",
  "super",
  "talented",
  "trustworthy",
  "wonderful",
];

export const nounArray = [
  "old man",
  "old lady",
  "kids",
  "men",
  "women",
  "girls",
  "guy",
  "man",
  "woman",
  "kid",
  "baby",
  "todler",
  "apple",
  "banana",
  "car",
  "dog",
  "elephant",
  "frog",
  "guitar",
  "house",
  "igloo",
  "jacket",
  "kangaroo",
  "lion",
  "mountain",
  "notebook",
  "ocean",
  "pencil",
  "quilt",
  "river",
  "sailboat",
  "table",
  "umbrella",
  "violin",
  "waterfall",
  "xylophone",
  "yacht",
  "zebra",
  "ant",
  "book",
  "cat",
  "desk",
  "ear",
  "fire",
  "goat",
  "hat",
  "ice",
  "jelly",
  "kite",
  "lemon",
  "moon",
  "nest",
  "orange",
  "pear",
  "queen",
  "rose",
  "sun",
  "tree",
  "unicorn",
  "vase",
  "whale",
  "xylophone",
  "yarn",
  "zeppelin",
];

export async function getImageFromOpenAI(
  setImage: {
    (value: React.SetStateAction<string>): void;
    (arg0: any): void;
  },
  roomCode,
  playerName,
  userInput
) {
  const randomAdjective =
    adjectiveArray[Math.floor(Math.random() * adjectiveArray.length)];
  const randomNoun = nounArray[Math.floor(Math.random() * nounArray.length)];

  const prompt = userInput;
  axios({
    method: "post",
    url: "https://api.openai.com/v1/images/generations",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer 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`,
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
      socket.emit("setImage", { image: imageUrl, roomCode, playerName });
    })
    .catch((error) => {
      console.error(error);
    });
}
