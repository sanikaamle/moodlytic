const API_BASE = "http://localhost:5000";

function getUsername() {
  let username = localStorage.getItem("moodlytic_username");
  
  if (!username) {
    username = prompt("Welcome! Please enter your username:");
    
    if (!username || username.trim() === "") {
      username = "user_" + Math.random().toString(36).substring(2, 9);
    }
    
    localStorage.setItem("moodlytic_username", username.trim());
  }
  
  return username;
}

function setUsername(newUsername) {
  localStorage.setItem("moodlytic_username", newUsername);
  location.reload();
}

function clearUsername() {
  localStorage.removeItem("moodlytic_username");
  location.reload();
}



async function analyzeEntry(text) {
  const username = getUsername();
  
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, username })
    });
    
    if (!response.ok) throw new Error("Analysis failed");
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing entry:", error);
    throw error;
  }
}

// Get dashboard stats
async function getDashboardStats() {
  const username = getUsername();
  
  try {
    const response = await fetch(`${API_BASE}/dashboard/${username}`);
    
    if (!response.ok) throw new Error("Failed to fetch dashboard");
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return {
      totalEntries: 0,
      positivePercent: 0,
      negativeCount: 0,
      streak: 0
    };
  }
}

// Get all entries
async function getAllEntries() {
  const username = getUsername();
  
  try {
    const response = await fetch(`${API_BASE}/entries/${username}`);
    
    if (!response.ok) throw new Error("Failed to fetch entries");
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
}



async function saveJournalEntry() {
  const titleInput = document.getElementById("entryTitle");
  const bodyInput = document.getElementById("entryBody");
  const saveBtn = document.getElementById("saveBtn");
  const resultDiv = document.getElementById("analysisResult");
  
  if (!bodyInput || !titleInput) return;
  
  const text = bodyInput.value.trim();
  const title = titleInput.value.trim();
  
  if (!text) {
    alert("Please write something before saving!");
    return;
  }
  
  // Show loading state
  saveBtn.textContent = "⏳ Analyzing...";
  saveBtn.disabled = true;
  
  try {
    // Call ML analysis
    const result = await analyzeEntry(text);
    
    // Show success
    saveBtn.textContent = "✓ Saved!";
    saveBtn.style.background = "linear-gradient(135deg,#38d9a9,#4dabf7)";
    
    // Display results
    if (resultDiv) {
      displayAnalysisResult(result, resultDiv);
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      saveBtn.textContent = "💾 Save Entry";
      saveBtn.disabled = false;
      saveBtn.style.background = "";
      
      // Clear inputs
      titleInput.value = "";
      bodyInput.value = "";
      updateWordCount();
      
      // Reload entries list
      loadEntriesList();
    }, 2000);
    
  } catch (error) {
    saveBtn.textContent = "❌ Error - Try Again";
    saveBtn.disabled = false;
    
    setTimeout(() => {
      saveBtn.textContent = "💾 Save Entry";
    }, 2000);
  }
}

function displayAnalysisResult(result, container) {
  const moodEmoji = {
    positive: "😊",
    negative: "😢",
    neutral: "😐"
  };
  
  const moodColor = {
    positive: "#38d9a9",
    negative: "#ff6b6b",
    neutral: "#4dabf7"
  };
  
  container.innerHTML = `
    <div style="
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      margin-top: 20px;
    ">
      <div style="font-size: 14px; color: rgba(232,232,240,0.6); margin-bottom: 10px;">
        AI Analysis Complete
      </div>
      
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="font-size: 36px;">${moodEmoji[result.mood]}</div>
        <div>
          <div style="font-size: 18px; font-weight: 600; color: ${moodColor[result.mood]}; text-transform: capitalize;">
            ${result.mood}
          </div>
          <div style="font-size: 12px; color: rgba(232,232,240,0.5);">
            Overall Mood
          </div>
        </div>
      </div>
      
      <div style="font-size: 13px; color: rgba(232,232,240,0.7); margin-bottom: 8px;">
        Detected Emotions:
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${result.emotions.map((emotion, i) => `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="color: rgba(232,232,240,0.9); text-transform: capitalize;">
              ${i + 1}. ${emotion.emotion}
            </span>
            <span style="
              padding: 4px 12px;
              background: rgba(124,92,252,0.2);
              border-radius: 20px;
              font-size: 11px;
              color: #7c5cfc;
            ">
              ${Math.round(emotion.confidence * 100)}%
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function loadEntriesList() {
  const entriesContainer = document.querySelector(".entries-list");
  if (!entriesContainer) return;

  try {
    const entries = await getAllEntries();

    console.log("📦 Loaded entries:", entries);

    if (!entries || entries.length === 0) {
      entriesContainer.innerHTML = `
        <div style="
          text-align: center;
          padding: 40px 20px;
          color: rgba(232,232,240,0.5);
          font-size: 14px;
        ">
          No entries yet. Start journaling! ✨
        </div>
      `;
      return;
    }

    const moodEmoji = {
      positive: "😊",
      negative: "😢",
      neutral: "😐"
    };

    entriesContainer.innerHTML = entries.map((entry, index) => {

      // 🛡️ Safe date handling
      let formattedDate = "Unknown date";
      if (entry.createdAt) {
        const date = new Date(entry.createdAt);
        formattedDate =
          date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }) +
          " · " +
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          });
      }

      // 🛡️ Safe title/text
      const displayText = entry.title || entry.text || "Untitled Entry";

      // 🛡️ Safe emotions (handles object, string, or missing)
      const emotions = (entry.emotions || [])
        .slice(0, 3)
        .map(e => {
          const val = e?.emotion || e || "";
          return val.charAt(0).toUpperCase() + val.slice(1);
        })
        .join(", ");

      return `
        <div class="entry-card" onclick="loadEntryContent(${index})">
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="entry-date">${formattedDate}</div>
            <div style="font-size: 18px;">
              ${moodEmoji[entry.mood] || "🙂"}
            </div>
          </div>

          <div class="entry-title">
            ${displayText.substring(0, 50)}
            ${displayText.length > 50 ? "..." : ""}
          </div>

          <div style="font-size: 11px; color: rgba(232,232,240,0.4); margin-top: 4px;">
            ${emotions}
          </div>

        </div>
      `;
    }).join("");

    // Store globally for click handling
    window.currentEntries = entries;

    console.log("✅ Entries rendered successfully");

  } catch (error) {
    console.error("❌ Error loading entries:", error);

    entriesContainer.innerHTML = `
      <div style="
        text-align: center;
        padding: 40px 20px;
        color: rgba(255,107,107,0.7);
        font-size: 14px;
      ">
        Failed to load entries 😕
      </div>
    `;
  }
}
function loadEntryContent(index) {
  if (!window.currentEntries) return;
  
  const entry = window.currentEntries[index];
  const titleInput = document.getElementById("entryTitle");
  const bodyInput = document.getElementById("entryBody");
  const editorDate = document.getElementById("editorDate");
  
  if (titleInput && bodyInput) {
    const date = new Date(entry.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }) + " · " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    if (editorDate) editorDate.textContent = formattedDate;
    titleInput.value = entry.text.substring(0, 100);
    bodyInput.value = entry.text;
    
    updateWordCount();
    
    // Highlight selected entry
    document.querySelectorAll(".entry-card").forEach((card, i) => {
      card.classList.toggle("active", i === index);
    });
  }
}


async function loadDashboard() {
  const stats = await getDashboardStats();
  const entries = await getAllEntries();
  
  // Update stats
  updateDashboardStats(stats);
  
  // Update charts
  updateMoodTrendChart(entries);
  updateMoodBreakdown(entries);
  updateHeatmap(entries);
}

function updateDashboardStats(stats) {
  const streakNum = document.getElementById("streakNum");
  const positiveNum = document.getElementById("positiveNum");
  const totalNum = document.getElementById("totalNum");
  const trendNum = document.getElementById("trendNum");
  
  if (streakNum) streakNum.textContent = stats.streak;
  if (positiveNum) positiveNum.textContent = stats.positivePercent + "%";
  if (totalNum) totalNum.textContent = stats.totalEntries;
  
  // Calculate trend (simplified)
  if (trendNum) {
    const trend = stats.positivePercent > 50 ? "↑" + stats.positivePercent : "↓" + (100 - stats.positivePercent);
    trendNum.textContent = trend + "%";
  }
}



function updateWordCount() {
  const bodyInput = document.getElementById("entryBody");
  const wordCountEl = document.getElementById("wordCount");
  
  if (!bodyInput || !wordCountEl) return;
  
  const text = bodyInput.value.trim();
  const words = text.split(/\s+/).filter(w => w).length;
  
  wordCountEl.textContent = words + " words";
}



function newEntry() {
  const titleInput = document.getElementById("entryTitle");
  const bodyInput = document.getElementById("entryBody");
  const editorDate = document.getElementById("editorDate");
  const resultDiv = document.getElementById("analysisResult");
  
  if (titleInput) titleInput.value = "";
  if (bodyInput) bodyInput.value = "";
  if (resultDiv) resultDiv.innerHTML = "";
  
  if (editorDate) {
    editorDate.textContent = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }) + " · " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  
  updateWordCount();
  
  // Remove active class from all entries
  document.querySelectorAll(".entry-card").forEach(card => {
    card.classList.remove("active");
  });
  
  if (bodyInput) bodyInput.focus();
  
  console.log("New journal entry started");
}



function startExercise(type) {
  const exercises = {
    breathing: {
      title: "Box Breathing",
      emoji: "🌬️",
      text: "Inhale for 4 seconds → Hold 4 → Exhale 4 → Hold 4."
    },
    grounding: {
      title: "5-4-3-2-1 Grounding",
      emoji: "👁️",
      text: "Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste."
    },
    meditation: {
      title: "Body Scan Meditation",
      emoji: "🧘",
      text: "Close your eyes and slowly move awareness from your feet to your head."
    },
    gratitude: {
      title: "Gratitude Practice",
      emoji: "🙏",
      text: "Think of three things you are grateful for today."
    }
  };

  const ex = exercises[type];

  if (!ex) return;

  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:200;
    background:rgba(10,11,20,0.95);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    gap:20px;
    text-align:center;
    padding:30px;
  `;

  overlay.innerHTML = `
    <div style="font-size:48px">${ex.emoji}</div>
    <h2 style="font-family:Sora,sans-serif">${ex.title}</h2>
    <p style="max-width:350px;color:rgba(232,232,240,0.6)">
      ${ex.text}
    </p>
    <div id="exCount" style="font-size:40px">3</div>
    <button onclick="this.parentElement.remove()" 
      style="padding:10px 25px;border-radius:30px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:white;cursor:pointer">
      Close
    </button>
  `;

  document.body.appendChild(overlay);

  let c = 3;
  const cd = overlay.querySelector("#exCount");

  const iv = setInterval(() => {
    c--;

    if (c === 0) {
      cd.textContent = "Begin ✦";
      clearInterval(iv);
    } else {
      cd.textContent = c;
    }
  }, 1000);
}



function updateUsernameInUI() {
  const username = getUsername();
  const userNameEls = document.querySelectorAll(".user-name");
  
  userNameEls.forEach(el => {
    el.textContent = username.charAt(0).toUpperCase() + username.slice(1);
  });
  
  const avatarEls = document.querySelectorAll(".avatar");
  avatarEls.forEach(el => {
    el.textContent = username.charAt(0).toUpperCase();
  });
}



document.addEventListener("DOMContentLoaded", () => {
  // Update username in UI
  updateUsernameInUI();
  
  // Load entries if on journal page
  if (document.querySelector(".entries-list")) {
    loadEntriesList();
  }
  
  // Load dashboard if on dashboard page
  if (document.getElementById("dashboardContent")) {
    loadDashboard();
  }
  
  // Attach event listeners
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveJournalEntry);
  }
  
  const newEntryBtn = document.querySelector(".new-entry-btn");
  if (newEntryBtn) {
    newEntryBtn.addEventListener("click", newEntry);
  }
  
  const bodyInput = document.getElementById("entryBody");
  if (bodyInput) {
    bodyInput.addEventListener("input", updateWordCount);
  }
});