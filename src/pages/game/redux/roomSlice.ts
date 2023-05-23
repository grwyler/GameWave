import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../../types";

const initialState = {
  gamePrompt: "",
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setGamePrompt: (state, action) => {
      state.gamePrompt = action.payload;
    },
  },
});

export const { setGamePrompt } = roomSlice.actions;

export const selectGamePrompt = (state: RootState) => state.room.gamePrompt;

export default roomSlice.reducer;
