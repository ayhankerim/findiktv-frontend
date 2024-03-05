import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FirmsState {
  firmsData: Record<string, any>; // Adjust the type according to your actual data structure
}

const initialState: FirmsState = {
  firmsData: {},
};

const firmsSlice = createSlice({
  name: "firm",
  initialState,
  reducers: {
    updateFirms: (state, action: PayloadAction<Record<string, any>>) => {
      state.firmsData = action.payload;
    },
  },
});

export const { updateFirms } = firmsSlice.actions;

export default firmsSlice.reducer;
