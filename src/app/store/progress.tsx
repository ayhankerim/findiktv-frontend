import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProgressState {
  settingsModalOpen: boolean;
  favouriteNotes: any[];
}

const initialState: ProgressState = {
  settingsModalOpen: false,
  favouriteNotes: [],
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    addFavourite: (state, action: PayloadAction<any>) => {
      state.favouriteNotes.push(action.payload);
    },
    toggleSettingsModal: (state) => {
      state.settingsModalOpen = !state.settingsModalOpen;
    },
  },
});

export const { addFavourite, toggleSettingsModal } = progressSlice.actions;

export default progressSlice.reducer;
