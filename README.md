# 🫙 Mood Jaar

**Mood Jaar** is an AI-powered emotional wellness platform that provides a safe and private space for users to express their thoughts, store meaningful memories, and receive personalized support through Google Gemini AI.

## ✨ Features

* 📝 **Virtual Thought Jar** – Save thoughts and emotions as digital notes.
* 🤖 **AI-Powered Responses** – Receive personalized and supportive replies.
* 🧠 **Memory System** – Store goals, milestones, and important life events.
* 🔒 **Privacy First** – AES-256-GCM encryption with local-first storage.
* 🛡️ **Natural Conversations** – Response filtering prevents robotic or intrusive AI behavior.
* 🎨 **Modern UI** – Responsive design with Dark & Light modes.
* 🎉 **Milestone Letters** – Generate appreciation letters celebrating personal growth.

## 🏗️ Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Frontend | React 19, TypeScript, Vite  |
| Styling  | Tailwind CSS v4             |
| Backend  | Node.js, Express            |
| AI       | Google Gemini 2.0 Flash     |
| Security | Web Crypto API, AES-256-GCM |

## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* Google Gemini API Key

### Installation

```bash
git clone <repository-url>
cd mood-jaar

npm install
npm install express cors node-fetch dotenv
```

### Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:3001/api
PORT=3001
```

### Run the Application

**Backend**

```bash
node server.js
```

**Frontend**

```bash
npm run dev
```

## 🔐 Security

* Client-side memory encryption using AES-256-GCM.
* Gemini API key secured on the backend.
* No cloud database dependency.
* User memories remain stored locally on the device.

## 📂 Project Structure

```text
mood-jaar/
├── src/
├── public/
├── server.js
├── .env
├── package.json
└── README.md
```

## 💜 Mission

Mood Jaar combines AI, privacy, and thoughtful design to create a secure space where users can reflect, grow, and feel supported.
---

Designed and developed by **Riya Sonara**
