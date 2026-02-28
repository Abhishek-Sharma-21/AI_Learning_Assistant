import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/embeddings', {
      model: 'openai/text-embedding-3-small',
      input: 'hello world'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    console.log("SUCCESS:", res.data.data[0].embedding.length);
  } catch (e) {
    console.error("ERROR:", e.response?.data || e.message);
  }
}
test();
