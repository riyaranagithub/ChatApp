import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      console.log("Reducer received:", action.payload);
      state.user =  {
        username: action.payload.username, // Save username
        token: action.payload.token,       // Save token
      };
      state.isLoggedIn = true;
      localStorage.setItem("authToken", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("authToken");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
