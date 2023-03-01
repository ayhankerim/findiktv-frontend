import { createSlice } from "@reduxjs/toolkit"

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    settingsModalOpen: false,
    favouriteNotes: [],
  },
  reducers: {
    addFavourite: (state, action) => {
      state.favouriteNotes.push(action.payload)
    },
    toggleSettingsModal: (state) => {
      state.settingsModalOpen = !state.settingsModalOpen
    },
  },
})

export const { addFavourite, toggleSettingsModal } = progressSlice.actions

export default progressSlice
