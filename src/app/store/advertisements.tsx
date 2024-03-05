import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdsState {
  adsData: Record<string, unknown>;
}

const initialState: AdsState = {
  adsData: {},
};

const adsSlice = createSlice({
  name: "advertisement",
  initialState,
  reducers: {
    updateAds: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.adsData = action.payload;
    },
  },
});

export const { updateAds } = adsSlice.actions;

export default adsSlice.reducer;
