import { createSlice } from '@reduxjs/toolkit';
import {
  analyzeDocument,
  generateSummaryWithFormat,
  extractTopics,
  generateQuiz,
  deleteDocument,
} from './documentSlice';

let nextId = 1;

const makeNote = (icon, title, message, type = 'success') => ({
  id: nextId++,
  icon,
  title,
  message,
  type,            // 'success' | 'error' | 'info'
  read: false,
  time: new Date().toISOString(),
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {
    markAllRead: (state) => {
      state.items.forEach((n) => { n.read = true; });
    },
    markRead: (state, action) => {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    clearAll: (state) => {
      state.items = [];
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Full Analysis ────────────────────────────────────────────
      .addCase(analyzeDocument.fulfilled, (state) => {
        state.items.unshift(makeNote('🧠', 'Full Analysis Complete', 'Summary, flashcards & quiz are ready.'));
      })
      .addCase(analyzeDocument.rejected, (state) => {
        state.items.unshift(makeNote('❌', 'Analysis Failed', 'Could not analyse the document.', 'error'));
      })

      // ── Summary ─────────────────────────────────────────────────
      .addCase(generateSummaryWithFormat.fulfilled, (state) => {
        state.items.unshift(makeNote('📄', 'Summary Generated', 'Your document summary is ready.'));
      })
      .addCase(generateSummaryWithFormat.rejected, (state) => {
        state.items.unshift(makeNote('❌', 'Summary Failed', 'Could not generate summary.', 'error'));
      })

      // ── Topics ───────────────────────────────────────────────────
      .addCase(extractTopics.fulfilled, (state) => {
        state.items.unshift(makeNote('🏷️', 'Topics Extracted', 'Core topics are now available.'));
      })
      .addCase(extractTopics.rejected, (state) => {
        state.items.unshift(makeNote('❌', 'Topic Extraction Failed', 'Could not extract topics.', 'error'));
      })

      // ── Quiz ─────────────────────────────────────────────────────
      .addCase(generateQuiz.fulfilled, (state) => {
        state.items.unshift(makeNote('❓', 'Quiz Ready', 'Your quiz questions have been generated.'));
      })
      .addCase(generateQuiz.rejected, (state) => {
        state.items.unshift(makeNote('❌', 'Quiz Generation Failed', 'Could not generate quiz.', 'error'));
      })

      // ── Delete ───────────────────────────────────────────────────
      .addCase(deleteDocument.fulfilled, (state) => {
        state.items.unshift(makeNote('🗑️', 'Document Deleted', 'The document was removed successfully.', 'info'));
      });
  },
});

export const { markAllRead, markRead, clearAll, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
