const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://127.0.0.1:27017/moodlytic")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


const userSchema = new mongoose.Schema({
  username: String,
  entries: [
    {
      title: String, 
      text: String,
      mood: String,
      emotions: [String],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
  res.send("Moodlytic backend running");
});

app.post("/ai-chat", (req, res) => {
  const message = req.body.message;
  res.json({ reply: "AI response placeholder for: " + message });
});

const { exec } = require("child_process");

app.post("/analyze", async (req, res) => {
  const { text, title, username } = req.body;  // ✅ ADDED title

  if (!text) {
    return res.status(400).send("No text provided");
  }

  exec(`python ../ml/emotion_model.py "${text}"`, async (error, stdout) => {
    if (error) {
      console.error(error);
      return res.status(500).send("ML error");
    }

    let emotions;

    try {
      emotions = JSON.parse(stdout);
    } catch (e) {
      console.error("Parse error:", stdout);
      return res.status(500).send("Parsing error");
    }

    // simple mood logic
    let mood = "neutral";
    if (emotions[0].emotion === "joy") mood = "positive";
    else if (["sadness", "fear", "anger"].includes(emotions[0].emotion))
      mood = "negative";

    let user = await User.findOne({ username });

    if (!user) {
      user = new User({ username, entries: [] });
    }

    user.entries.push({
      title: title || "Untitled Entry",  // Use title or default
      text,
      mood,
      emotions: emotions.map(e => e.emotion)
    });

    await user.save();

    res.json({
      mood,
      emotions
    });
  });
});

app.get("/dashboard/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) return res.json({});

  const entries = user.entries;

  const total = entries.length;

  const positive = entries.filter(e => e.mood === "positive").length;
  const negative = entries.filter(e => e.mood === "negative").length;

  const positivePercent = total ? Math.round((positive / total) * 100) : 0;

  res.json({
    totalEntries: total,
    positivePercent,
    negativeCount: negative,
    streak: calculateStreak(entries)
  });
});

function calculateStreak(entries) {
  if (entries.length === 0) return 0;

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  // Check each consecutive day
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].createdAt);
    entryDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);

    const daysDiff = Math.floor((expectedDate - entryDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      streak++;
    } else if (daysDiff > 0) {
      // Gap in streak
      break;
    }
  }

  return streak;
}

app.get("/entries/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) return res.json([]);

  res.json(user.entries);
});

function generateInsight(mood, emotions) {
  const top = emotions[0].emotion;

  if (mood === "negative") {
    return `You seem to be feeling ${top}. Consider taking a break.`;
  } else {
    return `You're feeling ${top}. Keep it up!`;
  }
}

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
