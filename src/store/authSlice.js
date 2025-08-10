import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    userType: null, // 'patsanstha'
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.userType = action.payload.userType;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userType = null;
    },
    updateAgentCount: (state, action) => {
      if (state.user) {
        state.user.currentAgentCount = action.payload.currentAgentCount;
      }
    },
  },
});

export const { loginSuccess, logout, updateAgentCount } = authSlice.actions;
export default authSlice.reducer;