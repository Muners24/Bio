import { createSlice } from "@reduxjs/toolkit";

const initialUserState = {
  email: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserInfo(state, action) {
      return { ...state, ...action.payload };
    },
    clearUserInfo() {
      return initialUserState;
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
