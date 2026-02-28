import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import aiService from '../services/ai.service.js';

// Multer configuration for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract text from PDF using the new class-based API
    const { PDFParse } = pdfParse;
    const parser = new PDFParse({ data: req.file.buffer });
    const data = await parser.getText();
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF' });
    }

    // Calculate metadata
    const wordCount = text.trim().split(/\s+/).length;
    const pageCount = data.total || 1;

    // Create Document record
    const userId = req.user._id;

    const document = new Document({
      title: req.file.originalname,
      content: text,
      userId: userId,
      wordCount,
      pageCount
    });

    await document.save();

    // Split text into 1000 character chunks
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    // Save chunks to database (with embeddings generated in parallel)
    const chunkPromises = chunks.map(async (content, index) => {
      const embedding = await aiService.generateEmbedding(content);
      return new DocumentChunk({
        documentId: document._id,
        content: content,
        chunkIndex: index,
        embedding: embedding
      }).save();
    });

    await Promise.all(chunkPromises);

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      documentId: document._id,
      title: document.title,
      chunkCount: chunks.length
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error processing PDF', error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete associated chunks
    await DocumentChunk.deleteMany({ documentId: id });
    
    // 2. Delete the document itself
    const document = await Document.findByIdAndDelete(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message: 'Document and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};
