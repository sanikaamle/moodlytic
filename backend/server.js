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
  res.send("SereneAI backend running");
});

app.post("/ai-chat", (req, res) => {
  const message = req.body.message;
  res.json({ reply: "AI response placeholder for: " + message });
});

const { exec } = require("child_process");

app.post("/analyze", async (req, res) => {
  const { text, username } = req.body;

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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});