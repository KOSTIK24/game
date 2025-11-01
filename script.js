import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// === 🔥 Firebase konfigurace ===
const firebaseConfig = {
  apiKey: "AIzaSyAMMQSmVChCHLi3R8x3Zfqxo6PimbqAO-8",
  authDomain: "susa-hra.firebaseapp.com",
  databaseURL: "https://susa-hra-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susa-hra",
  storageBucket: "susa-hra.firebasestorage.app",
  messagingSenderId: "944539559299",
  appId: "1:944539559299:web:327b6b84705ea4187302b6",
  measurementId: "G-F76JV1NDET"
};

// === Inicializace ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Obrázky ===
const playerImg = new Image();
playerImg.src = "images/player.png";

const cookieImg = new Image();
cookieImg.src = "images/cookie.png";

// === Hráč ===
let nickname = localStorage.getItem("nickname");
if (!nickname) {
  nickname = prompt("Zadej své jméno:");
  localStorage.setItem("nickname", nickname);
}

let cookies = 0;
let x = Math.random() * 700;
let y = Math.random() * 500;

// === Sušenka (společná pro všechny hráče) ===
let cookie = { x: 400, y: 300 };

// === Ovládání ===
document.addEventListener("keydown", (e) => {
  if (e.key === "w") y -= 10;
  if (e.key === "s") y += 10;
  if (e.key === "a") x -= 10;
  if (e.key === "d") x += 10;

  // Okraje mapy
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > canvas.width - 32) x = canvas.width - 32;
  if (y > canvas.height - 32) y = canvas.height - 32;

  updatePlayer();
});

// === Uložení pozice do Firebase ===
function updatePlayer() {
  set(ref(db, "players/" + nickname), {
    x,
    y,
    cookies
  });
}

// === Hlavní smyčka hry ===
function draw(players) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sušenka
  ctx.drawImage(cookieImg, cookie.x, cookie.y, 48, 48);

  // Hráči
  for (const name in players) {
    const p = players[name];
    if (!p) continue;

    // Aktuální hráč = modrý obrys
    if (name === nickname) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x - 2, p.y - 2, 36, 36);
    }

    ctx.drawImage(playerImg, p.x, p.y, 32, 32);

    // Jméno hráče
    ctx.font = "16px Comic Sans MS";
    ctx.fillStyle = "#4a2b0f";
    ctx.fillText(name, p.x, p.y - 5);
  }

  // Kolize se sušenkou
  const playerRect = { x, y, w: 32, h: 32 };
  const cookieRect = { x: cookie.x, y: cookie.y, w: 48, h: 48 };

  if (
    playerRect.x < cookieRect.x + cookieRect.w &&
    playerRect.x + playerRect.w > cookieRect.x &&
    playerRect.y < cookieRect.y + cookieRect.h &&
    playerRect.y + playerRect.h > cookieRect.y
  ) {
    cookies++;
    cookie.x = Math.random() * (canvas.width - 48);
    cookie.y = Math.random() * (canvas.height - 48);
    set(ref(db, "cookie"), cookie);
    updatePlayer();
  }

  // Počet sušenek
  ctx.font = "24px Comic Sans MS";
  ctx.fillStyle = "#5c3317";
  ctx.fillText("🍪 " + cookies, 20, 40);
}

// === Firebase synchronizace ===
onValue(ref(db, "players"), (snapshot) => {
  const players = snapshot.val() || {};
  draw(players);
});

onValue(ref(db, "cookie"), (snapshot) => {
  const c = snapshot.val();
  if (c) cookie = c;
});

// === Po zavření okna smaž hráče ===
window.addEventListener("beforeunload", () => {
  set(ref(db, "players/" + nickname), null);
});
