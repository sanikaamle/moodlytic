// Journal page functionality

function newEntry() {

  const title = document.querySelector(".title-input");
  const body = document.querySelector(".body-input");

  if (title) title.value = "";
  if (body) body.value = "";

  if (title) title.focus();

  console.log("New journal entry started");

}
function startExercise(type){

const exercises = {

breathing:{
title:"Box Breathing",
emoji:"🌬️",
text:"Inhale for 4 seconds → Hold 4 → Exhale 4 → Hold 4."
},

grounding:{
title:"5-4-3-2-1 Grounding",
emoji:"👁️",
text:"Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste."
},

meditation:{
title:"Body Scan Meditation",
emoji:"🧘",
text:"Close your eyes and slowly move awareness from your feet to your head."
},

gratitude:{
title:"Gratitude Practice",
emoji:"🙏",
text:"Think of three things you are grateful for today."
}

};

const ex = exercises[type];

if(!ex) return;

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

const iv = setInterval(()=>{
c--;

if(c === 0){
cd.textContent = "Begin ✦";
clearInterval(iv);
}else{
cd.textContent = c;
}

},1000);

}