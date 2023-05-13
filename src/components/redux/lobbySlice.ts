import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../types";

const initialState = {
  rooms: [],
};

export const lobbySlice = createSlice({
  name: "lobby",
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
  },
});

export const { setRooms } = lobbySlice.actions;

export const selectRooms = (state: RootState) => state.lobby.rooms;

export default lobbySlice.reducer;
