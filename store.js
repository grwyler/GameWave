import { configureStore, combineReducers } from "@reduxjs/toolkit";
import lobby from "./src/components/redux/lobbySlice";
import room from "./src/pages/game/redux/roomSlice";
const rootReducer = combineReducers({ lobby, room });

const store = configureStore({
  reducer: rootReducer,
});

export default store;
