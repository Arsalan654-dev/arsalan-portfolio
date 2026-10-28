import { createSlice } from '@reduxjs/toolkit';

const pendingActionsSlice = createSlice({
  name: 'pendingActions',
  initialState: {
    actions: []
  },
  reducers: {
    addPendingAction: (state, action) => {
      state.actions.push({
        id: Date.now() + Math.random(),
        type: action.payload.type,
        payload: action.payload.payload,
        timestamp: Date.now()
      });
    },
    clearPendingActions: (state) => {
      state.actions = [];
    },
    removePendingAction: (state, action) => {
      state.actions = state.actions.filter(a => a.id !== action.payload);
    }
  }
});

export const { addPendingAction, clearPendingActions, removePendingAction } = pendingActionsSlice.actions;
export default pendingActionsSlice.reducer;
