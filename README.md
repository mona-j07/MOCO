# 🧠 MOCO — Personal AI Operating System

MOCO is a multi-modal, intelligent assistant designed to act as your second mind — helping you think, write, learn, build, decide, and grow.

---

## 🚀 Vision

MOCO is not just an assistant.
It is a Personal AI Operating System (PAOS) that integrates your ideas, learning, decisions, and daily workflows into one intelligent system.

---

## ✨ Core Features

### 🎙️ Voice Interaction

* Speak naturally and get structured responses
* Real-time transcription and AI processing

### ✍️ Author Mode

* Dictate thoughts and stories
* Generates:

  * Transcript
  * Clean version
  * Improved version
* Stores writing in structured format

### 💻 Developer Mode

* Learn technical topics (AI, Cybersecurity, IoT)
* Includes:

  * Concept explanation
  * Tasks and mini projects
  * Quizzes
  * AI evaluation

### 📊 CEO Mode

* Strategic insights and decision support
* Case studies from real companies
* Risk, opportunity, and execution guidance

### 🌐 Real-Time Intelligence

* Fetches global news
* Converts into CEO-level insights
* Highlights risks and opportunities

### 💰 Finance Tracker

* Track income and expenses
* AI-based categorization
* Budget tracking and insights

### 🧘 Personal Mode

* Emotional reflection
* Mood tracking
* Thought organization

### ⏰ Smart Alarm

* Wake-up system with:

  * Motivational quote
  * Puzzle challenge
  * Daily focus

### 🧠 Memory System

* Stores:

  * Writing
  * Learning progress
  * Mood patterns
  * Financial behavior

---

## 🏗️ Architecture

### Frontend

* Next.js
* Tailwind CSS

### Backend

* Node.js / Express
* REST API

### AI Layer

* Gemini API
* Prompt orchestration

### Data Layer

* PostgreSQL
* Redis
* Vector DB (planned)

---

## 🔁 System Flow

User Input → Processing → Memory → AI → Response → Storage

---

## 📁 Project Structure

moco/

* frontend/
* backend/

  * routes/
  * services/
  * models/
* prompts/
* database/
* docs/

---

## 🔑 Environment Variables

GEMINI_API_KEY=your_api_key
DATABASE_URL=your_db_url
REDIS_URL=your_redis_url
NEWS_API_KEY=your_news_api_key

---

## ⚙️ Installation

git clone https://github.com/your-username/moco.git
cd moco

cd backend
npm install

cd ../frontend
npm install

---

## ▶️ Run

Backend: npm run dev
Frontend: npm run dev

---

## 📡 API Example

POST /api/moco

Request:
{
"input": "MOCO, help me plan a startup",
"mode": "CEO",
"userId": "123"
}

---

## 🧠 Prompt System

MOCO uses a structured prompt system with:

* Personality control
* Mode detection
* Memory injection
* Emotion awareness
* Real-time intelligence

---

## 📊 Roadmap

Phase 1:

* Chat + Author Mode

Phase 2:

* Voice + Learning

Phase 3:

* Finance + Memory

Phase 4:

* Real-time intelligence

Phase 5:

* SaaS scaling

---

## 🔐 Security

* API keys in .env
* JWT authentication
* Rate limiting

---

## 🌍 Future Enhancements

* Mobile app
* Voice personality (TTS)
* Advanced memory
* Personalized AI behavior

---

## 🤝 Contributing

1. Fork
2. Create branch
3. Submit PR

---

## 📜 License

MIT License

---

## 🧠 Final Note

MOCO is built to be a calm, intelligent system that helps you think better, act better, and grow consistently.
