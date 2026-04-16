# 🌙 Moodlytic — AI-Powered Mood & Journal Analysis System

Moodlytic is a full-stack mental health journaling platform that leverages Natural Language Processing to analyze user-written journal entries and extract emotional insights. It transforms raw text into meaningful patterns, helping users track their mental well-being over time.

---

# 🧠 Core Idea

Instead of just writing thoughts, users get:

* 🎭 **Emotion detection** (fear, sadness, joy, etc.)
* 📊 **Mood classification** (positive / negative / neutral)
* 📈 **Trends over time**
* 🔥 **Consistency streaks**
* 🧠 **Behavioral insights**

---

# ⚙️ Tech Stack

### Frontend

* HTML, CSS, JavaScript (Vanilla)
* Chart.js for data visualization

### Backend

* Node.js + Express
* REST APIs for communication

### Machine Learning

* HuggingFace Transformers
* Model: `j-hartmann/emotion-english-distilroberta-base`

### Database

* MongoDB (via Mongoose)

---

# 🔗 System Architecture

```plaintext
Frontend (UI)
     ↓
Node.js Backend (API Layer)
     ↓
Python ML Model (Emotion Analysis)
     ↓
MongoDB (Storage)
     ↓
Back to Frontend (Visual Insights)
```

---

# 🚀 Features

## ✍️ Smart Journaling

* Write journal entries freely
* Instant AI-powered emotion detection
* Displays top emotions with confidence scores

---

## 📊 Interactive Dashboard

* 🔥 Streak tracking (daily journaling consistency)
* 🙂 Positive mood percentage
* 📈 Mood trend graph over time
* 🟩 Heatmap of emotional patterns
* 📜 Recent entries view

---

## 🧠 Insights Engine

* Converts raw entries into patterns
* Identifies emotional shifts over time
* Helps users reflect on mental state


---

# 🧪 How It Works

1. User writes a journal entry
2. Frontend sends data to backend
3. Backend calls Python ML model
4. Model returns emotions + scores
5. Backend derives mood + stores data
6. Frontend fetches updated data
7. Dashboard visualizes trends

---

# ▶️ Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd moodlytic
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

---

### 3. Run backend server

```bash
node server.js
```

---

### 4. Run ML script dependencies

```bash
pip install transformers torch
```

---

### 5. Open frontend

Use Live Server or open:

```plaintext
frontend/pages/dashboard.html
```

# 🎯 Future Improvements

* 🔐 Add authentication (JWT-based login system)
* ☁️ Deploy backend + database (Render / MongoDB Atlas)
* 🧠 Advanced insights (weekly summaries, anomaly detection)
* 📱 Mobile responsiveness improvements

---

# 💡 Key Highlight

Moodlytic is not just a journaling app — it is a **data-driven mental health companion** that transforms unstructured text into actionable emotional insights using AI.

