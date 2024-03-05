import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommentState {
  pointedComment: number;
  countedComment: number;
  reply: number;
}

const initialState: CommentState = {
  pointedComment: 0,
  countedComment: 0,
  reply: 0,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    pointComment: (state, action: PayloadAction<number>) => {
      state.pointedComment = action.payload;
    },
    countComment: (state, action: PayloadAction<number>) => {
      state.countedComment = action.payload;
    },
    replyComment: (state, action: PayloadAction<number>) => {
      state.reply = action.payload;
    },
  },
});

export const { pointComment, countComment, replyComment } = commentSlice.actions;

export default commentSlice.reducer;
