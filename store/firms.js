import { createSlice } from "@reduxjs/toolkit"

const firmsSlice = createSlice({
  name: "firm",
  initialState: {
    firmsData: {},
  },
  reducers: {
    updateFirms: (state, action) => {
      state.firmsData = action.payload
    },
  },
})

export const { updateFirms } = firmsSlice.actions

export default firmsSlice
