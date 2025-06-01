import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { userSlice } from './slices/userSlice'
import { editorSlice } from './slices/editorSlice'

export default configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    editor: editorSlice.reducer,
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['editor/setEditorInstance', 'editor/destroyEditorInstance'],
        ignoredPaths: ['editor.editorInstance'],
      },
    }),
});