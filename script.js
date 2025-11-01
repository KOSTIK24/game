import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let nickname = localStorage.getItem('nickname');
if (!nickname) {
  nickname = prompt('Zadej své jméno:');
  localStorage.setItem('nickname', nickname);
}

let cookies = 0;
let x = Math.random() * 700;
let y = Math.random() * 500;

const cookie = { x: 400, y: 300 };

document.addEventListener('keydown', e => {
  if (e.key === 'w') y -= 10;
  if (e.key === 's') y += 10;
  if (e.key === 'a') x -= 10;
  if (e.key === 'd') x += 10;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > 736) x = 736;
  if (y > 536) y = 536;
  updatePlayer();
});

function updatePlayer() {
  set(ref(db, 'players/' + nickname), { x, y, cookies });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'saddlebrown';
  ctx.fillRect(cookie.x, cookie.y, 32, 32);
  ctx.fillStyle = 'blue';
  ctx.fillRect(x, y, 32, 32);
}

setInterval(draw, 50);

onValue(ref(db, 'players'), snapshot => {
  const players = snapshot.val();
  if (players) {
    Object.values(players).forEach(p => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(p.x, p.y, 32, 32);
    });
  }
});
