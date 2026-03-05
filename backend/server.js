
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("SereneAI backend running");
});

app.post("/ai-chat", (req,res)=>{
  const message = req.body.message;
  res.json({reply: "AI response placeholder for: " + message});
});

app.listen(5000, ()=>{
  console.log("Server running on port 5000");
});
