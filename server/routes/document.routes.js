import express from 'express';
import { uploadDocument, upload, getDocuments, getDocumentById, deleteDocument } from '../controllers/document.controller.js';
import { summarizeDocument, generateAnalysis, askQuestion, extractTopics, createQuiz, getChatHistory } from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply protection to all document routes
router.use(protect);

// Route: GET /api/documents
router.get('/', getDocuments);

// Route: GET /api/documents/:id
router.get('/:id', getDocumentById);

// Route: DELETE /api/documents/:id
router.delete('/:id', deleteDocument);

// Route: POST /api/documents/upload
router.post('/upload', upload.single('pdf'), uploadDocument);

// Route: POST /api/documents/:id/summarize
router.post('/:id/summarize', summarizeDocument);

// Route: POST /api/documents/:id/analyze
router.post('/:id/analyze', generateAnalysis);

// Route: POST /api/documents/:id/topics
router.post('/:id/topics', extractTopics);

// Route: POST /api/documents/:id/quiz
router.post('/:id/quiz', createQuiz);

// Route: GET /api/documents/:id/chat
router.get('/:id/chat', getChatHistory);

// Route: POST /api/documents/:id/chat
router.post('/:id/chat', askQuestion);

export default router;
