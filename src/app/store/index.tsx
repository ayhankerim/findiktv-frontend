import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "./storage";
import adsReducer from "./advertisements";
import progressReducer from "./progress";
import userReducer from "./user";
import commentReducer from "./comment";
import firmsReducer from "./firms";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist/es/constants";

const persistConfig = {
  key: "root",
  blacklist: ["comment", "firm"],
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  progress: progressReducer,
  advertisement: adsReducer,
  user: userReducer,
  comment: commentReducer,
  firm: firmsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
