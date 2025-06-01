import { createSlice } from "@reduxjs/toolkit";

const initialEditorState = {
  editorInstance: null,
  idPartitura: null, 
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState: initialEditorState,
  reducers: {
    setEditorInstance: (state, action) => {
      state.editorInstance = action.payload;
    },
    destroyEditorInstance: (state) => {
      state.editorInstance = null;
    },
    setIdPartitura: (state, action) => {
      state.idPartitura = action.payload;
    },
    clearIdPartitura: (state) => {
      state.idPartitura = null;
    },
  },
});

export const {
  setEditorInstance,
  destroyEditorInstance,
  setIdPartitura,
  clearIdPartitura
} = editorSlice.actions;

export default editorSlice.reducer;
