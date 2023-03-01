import { createSlice } from "@reduxjs/toolkit"

const commentSlice = createSlice({
  name: "comment",
  initialState: {
    pointedComment: 0,
    countedComment: 0,
    reply: 0,
  },
  reducers: {
    pointComment: (state, action) => {
      state.pointedComment = action.payload
    },
    countComment: (state, action) => {
      state.countedComment = action.payload
    },
    replyComment: (state, action) => {
      state.reply = action.payload
    },
  },
})

export const { pointComment, countComment, replyComment } = commentSlice.actions

export default commentSlice
