import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"
import storage from "./storage"
import adsSlice from "./advertisements"
import progressSlice from "./progress"
import userSlice from "./user"
import commentSlice from "./comment"

const persistConfig = {
  key: "root",
  blacklist: ["comment"],
  version: 1,
  storage,
}

const rootReducer = combineReducers({
  progress: progressSlice.reducer,
  advertisement: adsSlice.reducer,
  user: userSlice.reducer,
  comment: commentSlice.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export let persistor = persistStore(store)
