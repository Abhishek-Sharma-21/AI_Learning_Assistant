import aiService from '../services/ai.service.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Chat from '../models/Chat.js';

export const summarizeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the document
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 2. Generate summary using AI service
    const { format = 'Detailed' } = req.body;
    const summaryData = await aiService.generateSummary(document.content, format);

    // 3. Save to document
    document.summary = summaryData;
    await document.save();

    res.status(200).json({
      message: 'Summary generated successfully',
      summary: summaryData
    });

  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ message: 'AI processing failed', error: error.message });
  }
};

export const generateAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Run AI generations in parallel
    const [summary, flashcards, quiz] = await Promise.all([
      aiService.generateSummary(document.content),
      aiService.generateFlashcards(document.content),
      aiService.generateQuiz(document.content)
    ]);

    document.summary = summary;
    document.flashcards = flashcards;
    document.quiz = quiz;
    
    await document.save();

    res.status(200).json({
      message: 'Full analysis complete',
      analysis: { summary, flashcards, quiz }
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ message: 'Full analysis failed', error: error.message });
  }
};


export const extractTopics = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const topics = await aiService.extractTopics(document.content);

    document.topics = topics;
    await document.save();

    res.status(200).json({
      message: 'Topics extracted successfully',
      topics
    });
  } catch (error) {
    console.error('Topic Extraction Error:', error);
    res.status(500).json({ message: 'Topic extraction failed', error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let chat = await Chat.findOne({ documentId: id, userId });
    
    // Return empty array if no chat exists yet
    if (!chat) {
      return res.status(200).json([]);
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error('Fetch Chat History Error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
};

export const askQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, history } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Find or create chat document
    let chat = await Chat.findOne({ documentId: id, userId });
    if (!chat) {
      chat = new Chat({ documentId: id, userId, messages: [] });
    }

    // Push user message to DB
    chat.messages.push({ role: 'user', content: question });

    // Fetch chunks for RAG
    const chunks = await DocumentChunk.find({ documentId: id });

    const answer = await aiService.askQuestion(chunks, question, history);

    // Push AI response to DB
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ message: 'Chat failed', error: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { count, topic: topicTitle } = req.body;

    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Find topic background if specified
    let topicContext = "";
    if (topicTitle !== "General") {
      const topicObj = document.topics.find(t => t.title === topicTitle);
      if (topicObj) topicContext = topicObj.explanation;
    }

    const quiz = await aiService.generateQuiz(document.content, count, topicTitle, topicContext);

    document.quiz = quiz;
    await document.save();

    res.status(200).json({
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ message: 'Quiz generation failed', error: error.message });
  }
};
