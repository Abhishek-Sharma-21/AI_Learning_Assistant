import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordCount: { type: Number, default: 0 },
  pageCount: { type: Number, default: 1 },
  summary: {
    mainSummary: String,
    keyPoints: [String],
    targetAudience: String,
    estimatedReadingTime: String
  },
  flashcards: [{
    question: String,
    answer: String,
    category: String
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
  topics: [{
    title: String,
    explanation: String,
    category: String
  }],
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
