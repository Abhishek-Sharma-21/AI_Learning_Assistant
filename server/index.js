import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import documentRoutes from './routes/document.routes.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.send('AI Learning Assistant API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
