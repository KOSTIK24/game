import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, remove, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const ADMIN_PASS = "susagame5"; // TODO: změň si heslo

window.login = function() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASS) {
    document.getElementById("console").style.display = "block";
    loadPlayers();
  } else {
    alert("Špatné heslo!");
  }
};

function loadPlayers() {
  onValue(ref(db, "players"), snapshot => {
    const players = snapshot.val();
    const list = document.getElementById("playersList");
    list.innerHTML = "";
    for (const name in players) {
      const li = document.createElement("li");
      li.textContent = `${name} (${players[name].cookies} 🍪)`;
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = () => remove(ref(db, "players/" + name));
      li.appendChild(del);
      list.appendChild(li);
    }
  });
}

window.resetAll = function() {
  set(ref(db, "players"), {});
  alert("Všichni hráči byli smazáni!");
};
