# AI Learning Assistant

AI Learning Assistant is a full-stack web application designed to enhance your learning experience through artificial intelligence. Powered by the Gemini API, it allows users to upload documents, chat directly with those documents to extract insights, and generate customized quizzes based on specific focus areas.

## 🚀 Features

- **Document Upload**: Easily upload PDF documents for processing and analysis.
- **Conversational AI**: Chat seamlessly with uploaded documents to ask questions, extract highlights, and summarize content.
- **Persistent Chat History**: Automatically saves your conversations for each document, allowing you to resume seamlessly upon revisiting an uploaded document.
- **Custom Quiz Generation**: Generate personalized quizzes from your documents by specifying the desired number of questions and a specific topic/focus area.
- **User Authentication**: Secure user login and registration system using JWT and Bcrypt.
- **Modern UI**: Clean, responsive, and intuitive interface built with React 19 and Tailwind CSS v4.

## 🛠️ Tech Stack

### Frontend (Client)

- React 19
- Vite
- Redux Toolkit (State Management)
- Tailwind CSS v4 (Styling)
- React Router DOM (Routing)
- Lucide React (Icons)
- React Markdown (Rich text rendering)

### Backend (Server)

- Node.js & Express.js
- MongoDB & Mongoose (Database & ODM)
- JWT (Authentication)
- Bcrypt.js (Password Hashing)
- Multer & PDF-Parse (File Uploads & Parsing)
- Gemini API (AI Capabilities)

## 📦 Installation & Setup

### Prerequisites

- Node.js installed
- MongoDB URI (Local or Atlas)
- Gemini API Key

### 1. Clone the repository

```bash
git clone <repository_url>
cd AI_Learning_Assistant
```

### 2. Backend Setup

Navigate into the `server` directory, install dependencies, and set up your environment variables.

```bash
cd server
npm install
```

Create a `.env` file in the `server` root directory and configure the following variables:

```env
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<your_gemini_api_key>
```

Start the backend server:

```bash
# For development
npm run dev

# For production
npm start
```

### 3. Frontend Setup

Open a new terminal, navigate to the `client` directory, and install dependencies.

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

Your React app should now be running on `http://localhost:5173` (or the port specified by Vite).

## 💡 Usage

1. Register for an account or log in.
2. Upload a PDF document you want to study.
3. Use the chat interface to ask questions about the document's content.
4. Navigate to the Quiz section to generate a custom quiz by selecting the number of questions and a specific focus topic.
5. Review your chat history at any time without losing your progress.
