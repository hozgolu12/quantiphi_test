# AI Chat Assistant (VibeChat) 🚀

> **Quantiphi Vibe Coding Round | Intelligent Real-Time AI Chat Assistant**  
> Built with clean client-server architecture, Server-Sent Events (SSE) streaming, dynamic tone moderation, and persistent MongoDB history.

---

## 📌 Table of Contents
1. [Overview & Problem Statement](#-overview--problem-statement)
2. [Key Capabilities & Features](#-key-capabilities--features)
   - [Core Deliverables](#1-core-deliverables)
   - [The Vibe Check (Tone Toggle)](#2-the-vibe-check-tone-toggle)
   - [Two Extra Standout Features](#3-two-extra-standout-features)
3. [Architecture & System Design](#-architecture--system-design)
4. [Tech Stack](#-tech-stack)
5. [Quick Start & Installation](#-quick-start--installation)
6. [Environment Variables](#-environment-variables)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Git Commit History & Submission Guidelines](#-git-commit-history--submission-guidelines)
9. [Viva & Evaluation Guide](#-viva--evaluation-guide)

---

## 🎯 Overview & Problem Statement

The goal of this application is to deliver an **intelligent chat interface with real-time capabilities**, adhering strictly to the candidate guidelines and technical criteria:
- **Frontend UI & User Interaction**: Responsive, modern chat bubbles distinguishing User and AI; real-time character-by-character streaming; and a scrollable conversation history sidebar.
- **Backend Logic & State Management**: Strict server-side execution of all business logic, OpenAI / Claude multi-model API connectivity, and persistent conversation storage in MongoDB.
- **The Vibe Check**: Dynamic "Tone Toggle" (`Professional`, `Casual`, `Concise`) where user preferences modify backend system instructions to transform response tone instantly.
- **Two Extra Features**: Rich Markdown & syntax-highlighted code blocks with 1-click copy, and real-time history search with Markdown/JSON export capabilities.

---

## ✨ Key Capabilities & Features

### 1. Core Deliverables
* **Scrollable Chat Interface**:
  - Distinct chat bubbles for user (indigo gradient, right-aligned) and AI (dark card with glowing indicator, left-aligned).
  - Smooth auto-scrolling to the latest token as text streams into view.
* **Real-Time Streaming View**:
  - Low-latency Server-Sent Events (SSE) stream text character-by-character, simulating real-time thought synthesis.
  - Animated pulsing cursor and live streaming badge.
* **History Sidebar**:
  - Lists all past conversation threads fetched directly from MongoDB.
  - Displays conversation titles, relative timestamps (e.g., *Just now*, *15m ago*), message counts, and tone badges.
  - "+ New Conversation" quick trigger and per-thread deletion.

### 2. The Vibe Check (Tone Toggle)
The application provides an instant **Tone Toggle** allowing users to switch between three distinct personas:
* 💼 **Professional**:
  - *System Instruction*: Formulates executive-grade, structured, formal, and courteous responses with clear headers and bullet points.
* 🎉 **Casual**:
  - *System Instruction*: Formulates friendly, warm, conversational, and approachable answers with natural colloquial phrasing and tasteful emojis.
* ⚡ **Concise**:
  - *System Instruction*: Formulates direct, ultra-brief answers stripping away all unnecessary filler, greetings, and preambles.

> **Backend Implementation**: The selected tone is validated on the server side and dynamically injected as a system instruction into the OpenAI / Claude inference engine before token generation begins.

### 3. Two Extra Standout Features
In accordance with the prompt (*"suggest and include two extra features that are not listed above, based on your understanding of chatbot capabilities"*):

1. **Feature 1: Rich Markdown & Code Syntax Highlighting with 1-Click Copy**
   - Renders code blocks, GitHub-flavored markdown tables, bold text, lists, and quotes.
   - Code blocks include language headers and a **1-click Copy Code** button with visual confirmation.
   - AI response bubbles feature a **Copy Full Message** button for instant sharing.

2. **Feature 2: Real-Time History Search & Multi-Format Chat Export (Markdown & JSON)**
   - **Search Filter**: Users can filter through all past conversations in real-time by title or message content.
   - **Export Modal**: Users can preview and download any conversation thread as either formatted **Markdown (`.md`)** or structured **JSON (`.json`)** for backup, note-taking, or audit trails.

---

## 🏛 Architecture & System Design

```
quantiphi/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # Resilient MongoDB connector (with embedded fallback)
│   │   ├── models/
│   │   │   └── Conversation.js  # Mongoose schema (threads, messages, tones, timestamps)
│   │   ├── services/
│   │   │   ├── aiService.js     # OpenAI & Anthropic Claude streaming engine + smart fallback
│   │   │   └── tonePrompts.js   # "The Vibe Check" system instruction modifier logic
│   │   ├── controllers/
│   │   │   ├── chatController.js         # SSE stream endpoint with persistence
│   │   │   └── conversationController.js # History retrieval and thread management
│   │   ├── routes/
│   │   │   ├── chatRoutes.js
│   │   │   └── conversationRoutes.js
│   │   └── server.js            # Express server initialization
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx   # Scrollable view, suggested prompts, auto-growing input
│   │   │   ├── MessageBubble.jsx   # Distinct user/AI bubbles, markdown, copy buttons
│   │   │   ├── StreamingView.jsx   # Real-time character/token streaming display
│   │   │   ├── HistorySidebar.jsx  # Past conversations, search bar, new chat, delete
│   │   │   ├── ToneToggle.jsx      # Segmented Vibe selector (Professional, Casual, Concise)
│   │   │   ├── ExportModal.jsx     # Markdown and JSON export preview and downloader
│   │   │   └── Header.jsx          # App branding, real-time indicator, tone bar
│   │   ├── services/
│   │   │   └── api.js              # SSE stream reader and REST API handlers
│   │   ├── App.jsx                 # Root UI controller
│   │   ├── index.css               # Tailwind & custom scrollbar styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Blazing fast client rendering & hot module replacement |
| **Styling** | Tailwind CSS | Sleek, modern, dark-mode first design |
| **Icons** | Lucide React | Lightweight, consistent iconography |
| **Markdown** | React-Markdown + Remark-GFM | Full GitHub-flavored markdown parsing |
| **Backend** | Node.js + Express | REST API and Server-Sent Events (SSE) streaming server |
| **Database** | MongoDB + Mongoose | Persistent storage of threads, messages, tones, timestamps |
| **AI Integration** | OpenAI & Anthropic Claude SDKs | Multi-model streaming LLM completions |
| **Resilience** | In-Memory MongoDB Fallback | Ensures zero setup failure if local Mongo service is offline |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher installed)
- **npm** (v9 or higher)
- **MongoDB** (optional; app includes automated zero-config in-memory fallback)

### Step 1: Install Dependencies
Open your terminal in the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 2: Environment Configuration
Create a `.env` file in the `backend/` folder based on `.env.example`:

```bash
cd backend
cp .env.example .env
```

Contents of `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_chat_assistant
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

*(Note: If you don't provide an API key, the built-in intelligent fallback streaming engine will automatically activate, allowing reviewers to test all tones and real-time streaming without billing fees!)*

### Step 3: Run the Application
In separate terminal tabs:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Vite dev server running at http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

## 📡 API Endpoints Reference

### 1. Health Check
- **`GET /api/health`**
  - Returns backend health status, supported tone options, and timestamp.

### 2. Conversation Management
- **`GET /api/conversations?search=<query>`**
  - Retrieves all conversation threads ordered by most recent activity. Supports search queries.
- **`GET /api/conversations/:id`**
  - Retrieves a specific conversation with all message objects.
- **`POST /api/conversations`**
  - Creates a new conversation thread.
- **`DELETE /api/conversations/:id`**
  - Deletes a conversation thread and its associated message history.
- **`PATCH /api/conversations/:id/tone`**
  - Updates the active tone for an existing thread.

### 3. Real-Time Streaming Chat
- **`POST /api/chat`**
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "conversationId": "optional-mongo-id",
      "message": "User prompt text",
      "tone": "Professional | Casual | Concise"
    }
    ```
  - **Response**: Server-Sent Events (`text/event-stream`):
    - `data: {"type": "start", "conversationId": "...", "userMessage": {...}}`
    - `data: {"type": "chunk", "text": "token"}`
    - `data: {"type": "done", "conversationId": "...", "aiMessage": {...}}`

---

## 🔒 Viva & Evaluation Guide

### 1. How does the Tone Toggle work under the hood?
When the user selects **Professional**, **Casual**, or **Concise** on the frontend, the preference is sent to `POST /api/chat`. The backend's `tonePrompts.js` service maps the selection to a tailored system instruction modifier. This prompt modifier is injected into the LLM system prompt:
- **Professional**: Directs the model to output formal, structured, executive explanations.
- **Casual**: Directs the model to adopt a warm, friendly persona with conversational language.
- **Concise**: Directs the model to cut all pleasantries and deliver bulleted, high-density facts.

### 2. Why Server-Sent Events (SSE) instead of WebSockets?
For AI chat interfaces where traffic is predominantly server-to-client streaming (unidirectional token stream once a prompt is dispatched), **SSE is the industry standard**:
- Runs over standard HTTP/1.1 and HTTP/2 without protocol upgrades.
- Native browser support (`ReadableStream` / `EventSource`) with automatic reconnection.
- Simpler error boundaries and seamless proxy/firewall traversal.

### 3. How is persistence managed in MongoDB?
Every incoming prompt is immediately appended to the conversation document with a timestamp and role `user`. As the AI stream finishes, the completed text is appended with role `assistant`, the active tone, and updated timestamps. This guarantees zero data loss even if the client disconnects prematurely.

---

## 📄 License
MIT License. Built for the Quantiphi Vibe Coding Round.
