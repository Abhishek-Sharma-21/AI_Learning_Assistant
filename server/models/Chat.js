import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  messages: [messageSchema]
}, { timestamps: true });

// Ensure one chat document per user-document pair
chatSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
