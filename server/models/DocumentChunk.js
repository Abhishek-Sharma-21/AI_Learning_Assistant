import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  content: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  embedding: { type: [Number], required: false },
  createdAt: { type: Date, default: Date.now }
});

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
