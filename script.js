import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// === Inicializace Firebase ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Načtení obrázků ===
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
let speed = 8;

// === Sušenka (globální pozice) ===
let cookie = { x: 400, y: 300 };

// === Pohyb ===
document.addEventListener("keydown", (e) => {
  if (e.key === "w") y -= speed;
  if (e.key === "s") y += speed;
  if (e.key === "a") x -= speed;
  if (e.key === "d") x += speed;

  // Omez pohyb na hranice
  x = Math.max(0, Math.min(canvas.width - 32, x));
  y = Math.max(0, Math.min(canvas.height - 32, y));

  updatePlayer();
});

// === Uložení pozice do databáze ===
function updatePlayer() {
  set(ref(db, "players/" + nickname), {
    x,
    y,
    cookies
  });
}

// === Vykreslování ===
function draw(players) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🍪 sušenka
  ctx.drawImage(cookieImg, cookie.x, cookie.y, 48, 48);

  // 👥 hráči
  for (const name in players) {
    const p = players[name];
    if (!p) continue;

    if (name === nickname) {
      // TY – plný barevný player.png
      ctx.drawImage(playerImg, p.x, p.y, 48, 48);
      ctx.font = "18px Comic Sans MS";
      ctx.fillStyle = "#2b1908";
      ctx.fillText(name + " (ty)", p.x - 10, p.y - 5);
    } else {
      // Ostatní – šedý odstín
      ctx.globalAlpha = 0.6;
      ctx.drawImage(playerImg, p.x, p.y, 48, 48);
      ctx.globalAlpha = 1.0;
      ctx.font = "16px Comic Sans MS";
      ctx.fillStyle = "#4a2b0f";
      ctx.fillText(name, p.x, p.y - 5);
    }
  }

  // 🎯 kolize se sušenkou
  const playerRect = { x, y, w: 48, h: 48 };
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

  // 🍪 Počet sušenek
  ctx.font = "26px Comic Sans MS";
  ctx.fillStyle = "#5c3317";
  ctx.fillText("🍪 " + cookies, 20, 40);
}

// === Firebase realtime ===
onValue(ref(db, "players"), (snapshot) => {
  const players = snapshot.val() || {};
  draw(players);
});

onValue(ref(db, "cookie"), (snapshot) => {
  const c = snapshot.val();
  if (c) cookie = c;
});

// === Odstranit hráče po odchodu ===
window.addEventListener("beforeunload", () => {
  remove(ref(db, "players/" + nickname));
});
