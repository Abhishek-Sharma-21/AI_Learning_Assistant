import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.defaultModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  }

  /**
   * Generates a numerical vector embedding for a piece of text using Feature Hashing (Bag-of-Words).
   * This is a zero-dependency fallback since HuggingFace CDN is timing out for the user.
   */
  async generateEmbedding(text) {
    try {
      const DIMENSIONS = 384;
      const vector = new Array(DIMENSIONS).fill(0);
      const words = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      
      for (const w of words) {
        if (w.length < 3) continue;
        // Simple string hash
        let hash = 0;
        for (let i = 0; i < w.length; i++) {
          hash = ((hash << 5) - hash) + w.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        const idx = Math.abs(hash) % DIMENSIONS;
        vector[idx] += 1;
      }
      
      // L2 Normalization
      let mag = 0;
      for (let i = 0; i < DIMENSIONS; i++) mag += vector[i] * vector[i];
      if (mag > 0) {
        for (let i = 0; i < DIMENSIONS; i++) vector[i] /= Math.sqrt(mag);
      }
      return vector;
    } catch (error) {
      console.error("Embedding Error", error);
      return [];
    }
  }

  /**
   * Calculates cosine similarity between two vectors.
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a response from an AI model using OpenRouter.
   * @param {string} prompt - The user prompt.
   * @param {string} [model] - Optional specific model to use.
   * @returns {Promise<string>} - The raw text response from the AI.
   */
  async generateAIResponse(promptOrMessages, model = this.defaultModel) {
    try {
      if (!this.apiKey || this.apiKey === 'your_openrouter_api_key_here' || !this.apiKey.startsWith('sk-or-v1-')) {
        console.warn('OpenRouter API key is missing or invalid. Using mock response for testing.');
        return 'This is a mock AI response because the OpenRouter API key is not configured correctly.';
      }

      const messages = Array.isArray(promptOrMessages) 
        ? promptOrMessages 
        : [{ role: 'user', content: promptOrMessages }];

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: messages,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Learning Assistant',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Extracts JSON from a potentially messy AI response.
   * @param {string} text 
   * @returns {Object|Array}
   */
  _extractJson(text) {
    try {
      // 1. Try direct parse
      return JSON.parse(text);
    } catch (e) {
      // 2. Try cleaning markdown and extracting block
      try {
        const cleanText = text.replace(/```json|```/g, '').trim();
        // Find first [ or { and last ] or }
        const startIdx = Math.min(
          cleanText.indexOf('[') === -1 ? Infinity : cleanText.indexOf('['),
          cleanText.indexOf('{') === -1 ? Infinity : cleanText.indexOf('{')
        );
        const endIdx = Math.max(
          cleanText.lastIndexOf(']'),
          cleanText.lastIndexOf('}')
        );

        if (startIdx === Infinity || endIdx === -1) {
          throw new Error('No JSON structure found');
        }

        const jsonStr = cleanText.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
      } catch (innerError) {
        console.error('JSON Extraction Failed:', innerError, 'Original text:', text);
        throw new Error('Content generated was not in a valid data format.');
      }
    }
  }

  /**
   * Generates a structured JSON summary for document content.
   * @param {string} content - The extracted text from a document.
   * @returns {Promise<Object>} - Validated JSON summary object.
   */
  async generateSummary(content, format = 'Detailed') {
    const systemPrompt = `
      You are an expert educational assistant. Your task is to provide a concise, insightful summary of the provided text.
      You MUST respond ONLY with a valid JSON object. No other text, no markdown blocks, just the JSON.
      
      The JSON structure must be exactly:
      {
        "mainSummary": "A high-level overview of the entire document (3-4 sentences).",
        "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
        "targetAudience": "Who would benefit most from this content.",
        "estimatedReadingTime": "X minutes"
      }

      Format preference: ${format} (Short: ~2 sentences, Detailed: thorough analysis, Bullets: point-based)
    `;

    const userPrompt = `Summarize this document content:\n\n${content.substring(0, 10000)}`;

    try {
      const rawResponse = await this.generateAIResponse(`${systemPrompt}\n\n${userPrompt}`);
      if (rawResponse.startsWith('This is a mock')) return {
        mainSummary: "This is a mock summary for testing purposes.",
        keyPoints: ["Point 1", "Point 2"],
        targetAudience: "Developers",
        estimatedReadingTime: "2 minutes"
      };
      
      return this._extractJson(rawResponse);
    } catch (error) {
      console.error('Summarization Error:', error);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  /**
   * Answers a specific question about the document using RAG.
   * @param {Array} chunks - The document chunks from DB (with embeddings).
   * @param {string} question - The user's question.
   * @param {Array} history - Previous chat history.
   * @returns {Promise<string>} - The AI response.
   */
  async askQuestion(chunks, question, history = []) {
    // 1. Generate an embedding for the user's question
    const questionEmbedding = await this.generateEmbedding(question);

    // 2. Perform Cosine Similarity against all chunks
    const chunksWithScores = chunks.map(chunk => ({
      content: chunk.content,
      score: chunk.embedding && chunk.embedding.length > 0
        ? this.cosineSimilarity(questionEmbedding, chunk.embedding)
        : 0
    }));

    // 3. Sort by most similar and take top 5 chunks
    chunksWithScores.sort((a, b) => b.score - a.score);
    const topChunks = chunksWithScores.slice(0, 5);
    
    // 4. Build the context string
    const contextStr = topChunks.map((c, i) => `--- Excerpt ${i + 1} ---\n${c.content}`).join('\n\n');

    const systemPrompt = `
      You are an expert tutor helping a student understand a document.
      Use the provided excerpts from the document to answer the student's question accurately and concisely.
      If the answer is not in the excerpts, say you don't know based on the document, but provide a general answer if possible.
      
      Document Excerpts:
      ${contextStr}
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: question }
    ];

    try {
      const response = await this.generateAIResponse(messages);
      return response;
    } catch (error) {
      console.error('Chat Error:', error);
      throw new Error('Failed to get a response from the AI.');
    }
  }

  /**
   * Extracts key topics and concepts from the document.
   * @param {string} content - The extracted text.
   * @returns {Promise<Array>} - Array of topic objects.
   */
  async extractTopics(content) {
    const systemPrompt = `
      You are an expert educational curator. Identify 3-5 major topics or concepts in the provided text.
      For each topic, provide a title, a short explanation (2 sentences), and a category tag.
      Respond ONLY with a JSON array: [{"title": "...", "explanation": "...", "category": "..."}, ...]
    `;

    try {
      const rawResponse = await this.generateAIResponse(`${systemPrompt}\n\nContent: ${content.substring(0, 8000)}`);
       if (rawResponse.startsWith('This is a mock')) return [
        { title: "Mock Topic", explanation: "This is a mock explanation.", category: "Concept" }
      ];
      
      return this._extractJson(rawResponse);
    } catch (error) {
      console.error('Topic Extraction Error:', error);
      throw new Error(`Topic extraction failed: ${error.message}`);
    }
  }

  /**
   * Generates a set of flashcards from the document content.
   * @param {string} content - The extracted text.
   * @returns {Promise<Array>} - Array of flashcard objects.
   */
  async generateFlashcards(content) {
    const systemPrompt = `
      You are an expert tutor. Create 5-8 flashcards from the provided text.
      Each flashcard should follow this JSON structure:
      {
        "question": "The question or term",
        "answer": "The concise answer or definition",
        "category": "Broad topic (e.g., Fundamentals, hardware, Theory)"
      }
      Respond ONLY with a JSON array: [{"question": "...", "answer": "...", "category": "..."}, ...]
    `;

    try {
      const rawResponse = await this.generateAIResponse(`${systemPrompt}\n\nContent: ${content.substring(0, 8000)}`);
      if (rawResponse.startsWith('This is a mock')) return [
        { question: "Mock Question?", answer: "Mock Answer", category: "Test" }
      ];
      
      return this._extractJson(rawResponse);
    } catch (error) {
      console.error('Flashcard Generation Error:', error);
      throw new Error(`Flashcard generation failed: ${error.message}`);
    }
  }

  /**
   * Generates a multiple-choice quiz from the document content.
   * @param {string} content - The extracted text.
   * @returns {Promise<Array>} - Array of quiz question objects.
   */
  async generateQuiz(content, count = 5, topic = 'General', topicContext = '') {
    const systemPrompt = `
      You are an academic examiner. Your task is to create a ${count}-question multiple-choice quiz.
      
      CRITICAL FOCUS: The quiz MUST be constructed specifically from the section/content focusing on "${topic}".
      ${topicContext ? `TOPIC BACKGROUND: "${topicContext}"` : ''}
      
      Instructions:
      1. Use the provided Content below to find deep details about "${topic}".
      2. If TOPIC BACKGROUND is provided, use it to identify the correct part of the document.
      3. Create ${count} challenging questions with 4 options and 1 correct answer each.
      
      Structure:
      {
        "question": "The quiz question",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "The exact string from options that is correct",
        "explanation": "Brief reasoning for why this is correct"
      }
      Respond ONLY with a JSON array: [{"question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}, ...]
    `;

    try {
      const rawResponse = await this.generateAIResponse(`${systemPrompt}\n\nContent: ${content.substring(0, 8000)}`);
       if (rawResponse.startsWith('This is a mock')) return [
        { question: "Mock Quiz?", options: ["A", "B", "C", "D"], correctAnswer: "A", explanation: "Mock" }
      ];
      
      return this._extractJson(rawResponse);
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }
}

export default new AIService();
