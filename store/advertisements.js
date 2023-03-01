import { createSlice } from "@reduxjs/toolkit"

const adsSlice = createSlice({
  name: "advertisement",
  initialState: {
    adsData: {},
  },
  reducers: {
    updateAds: (state, action) => {
      state.adsData = action.payload
    },
  },
})

export const { updateAds } = adsSlice.actions

export default adsSlice
