import { configureStore, combineReducers } from "@reduxjs/toolkit";
import lobby from "./src/components/redux/lobbySlice";
const rootReducer = combineReducers({ lobby });

const store = configureStore({
  reducer: rootReducer,
});

export default store;
