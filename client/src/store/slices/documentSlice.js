import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Document not found');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateSummaryWithFormat = createAsyncThunk(
  'documents/generateSummary',
  async ({ id, format }, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}/summarize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ format })
      });
      if (!response.ok) throw new Error('Summary generation failed');
      const data = await response.json();
      return { id, summary: data.summary };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const extractTopics = createAsyncThunk(
  'documents/extractTopics',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}/topics`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Topic extraction failed');
      const data = await response.json();
      return { id, topics: data.topics };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const analyzeDocument = createAsyncThunk(
  'documents/analyze',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      return { id, analysis: data.analysis };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Delete failed');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateQuiz = createAsyncThunk(
  'documents/generateQuiz',
  async ({ id, count, topic }, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`http://localhost:5000/api/documents/${id}/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count, topic })
      });
      if (!response.ok) throw new Error('Quiz generation failed');
      const data = await response.json();
      return { id, quiz: data.quiz };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  analyzing: false,
  generatingSummary: false,
  extractingTopics: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analyze
      .addCase(analyzeDocument.pending, (state) => {
        state.analyzing = true;
      })
      .addCase(analyzeDocument.fulfilled, (state, action) => {
        state.analyzing = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.summary = action.payload.analysis.summary;
          state.selectedItem.flashcards = action.payload.analysis.flashcards;
          state.selectedItem.quiz = action.payload.analysis.quiz;
        }
      })
      .addCase(analyzeDocument.rejected, (state) => {
        state.analyzing = false;
      })
      // Summary With Format
      .addCase(generateSummaryWithFormat.pending, (state) => {
        state.generatingSummary = true;
      })
      .addCase(generateSummaryWithFormat.fulfilled, (state, action) => {
        state.generatingSummary = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.summary = action.payload.summary;
        }
      })
      .addCase(generateSummaryWithFormat.rejected, (state) => {
        state.generatingSummary = false;
      })
      // Extract Topics
      .addCase(extractTopics.pending, (state) => {
        state.extractingTopics = true;
      })
      .addCase(extractTopics.fulfilled, (state, action) => {
        state.extractingTopics = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.topics = action.payload.topics;
        }
      })
      .addCase(extractTopics.rejected, (state) => {
        state.extractingTopics = false;
      })
      // Generate Quiz
      .addCase(generateQuiz.pending, (state) => {
        state.analyzing = true;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.analyzing = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.quiz = action.payload.quiz;
        }
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        if (state.selectedItem && state.selectedItem._id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedItem } = documentSlice.actions;
export default documentSlice.reducer;
