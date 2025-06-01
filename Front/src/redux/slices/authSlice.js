import { createSlice } from '@reduxjs/toolkit';

const initialAuthState = {
  token: sessionStorage.getItem('token') || null,
  isAuthenticated: !!sessionStorage.getItem('token'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.isAuthenticated = true;
      sessionStorage.setItem('token', action.payload);
    },
    clearToken(state) {
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('token');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;

export default authSlice.reducer;
