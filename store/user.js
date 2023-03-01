import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: {},
  },
  reducers: {
    updateUser: (state, action) => {
      state.userData = action.payload
    },
  },
})

export const { updateUser } = userSlice.actions

export default userSlice
