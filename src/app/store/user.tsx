import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  // Define the structure of user data
  // For example:
  id: number;
  username: string;
  // Add more properties as needed
}

interface UserState {
  userData: UserData;
}

const initialState: UserState = {
  userData: {
      id: 0,
      username: ""
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;
