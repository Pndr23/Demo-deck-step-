let tappe = 0;
let minigiocoAttivo = false;
let minigiocoCallback = null;
let moltiplicatoreBonus = 0;
let currentCard = null;
let nextCard = null;
let correctCount = 0;
let errorCount = 0;
let correctStreak = 0;
let currentLanguage = "it";
let currentLevel = "easy";
let puntataIniziale = parseFloat(document.getElementById("bet").value);

const moltiplicatoriFacile = [1.1,1.2,1.3,1.5,1.8,2,2.2,2.5,3,5];

const soundClick = new Audio('click.mp3');
const soundCorrect = new Audio('correct.mp3');
const soundWrong = new Audio('wrong.mp3');
const soundFlip = new Audio("flip.mp3");
const soundMinigame = new Audio('minigame.mp3');
const soundMultiplier = new Audio('multiplier.mp3');
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
let audioOn = localStorage.getItem("audioOn") !== "false";

function unlockAudio() {
const sounds = [
soundClick, soundCorrect, soundWrong, soundFlip,
soundMinigame, soundMultiplier
];
sounds.forEach(snd => {
snd.play().then(() => {
snd.pause();
snd.currentTime = 0;
}).catch(() => {});
});
document.removeEventListener("click", unlockAudio);
document.removeEventListener("touchstart", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

let moltiplicatori = {
easy: moltiplicatoriFacile,
};
const tappeMassime = {
easy: 10,
};

function playSound(sound) {
if (audioOn) {
sound.currentTime = 0;
sound.play();
}
}

window.addEventListener("DOMContentLoaded", () => {
const soundToggle = document.getElementById("soundToggle");
if (!soundToggle) return;
soundToggle.textContent = audioOn ? "🔊" : "🔇";
soundToggle.addEventListener("click", (event) => {
event.stopPropagation();
audioOn = !audioOn;
soundToggle.textContent = audioOn ? "🔊" : "🔇";
localStorage.setItem("audioOn", audioOn);
if (!audioOn) {
backgroundMusic.pause();
} else {
backgroundMusic.play().catch(() => {});
}
});
});
let gameAreaOriginalDisplay = null;
let partitaIniziata = false;

let HISTORY_KEY = 'deckstep_history_v1';
let activeSession = null;

function loadHistory() {
try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
catch { return []; }
}
function saveHistory(list) {
localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
function startHistorySession() {
playSound(soundClick);
const list = loadHistory();
activeSession = {
id: Date.now(),
startedAt: new Date().toISOString(),
events: [],
outcome: null,
winnings: 0
};
list.push(activeSession);
saveHistory(list);
renderHistory();
}
function logHistoryEvent(eventText) {
if (!activeSession) return;
const list = loadHistory();
const s = list.find(x => x.id === activeSession.id);
if (!s) return;
s.events.push({ at: new Date().toISOString(), text: eventText });
saveHistory(list);
renderHistory();
}
function finalizeHistorySession(outcome, winnings=0) {
if (!activeSession) return;
const list = loadHistory();
const s = list.find(x => x.id === activeSession.id);
if (!s) return;
s.outcome = outcome;
s.winnings = winnings;
s.endedAt = new Date().toISOString();
saveHistory(list);
activeSession = null;
renderHistory();
}
function initHistoryUI() {
const panel = document.getElementById('historyPanel');
const openBtn = document.getElementById('historyButton');
const closeBtn = document.getElementById('historyClose');
const clearBtn = document.getElementById('historyClear');
const backdrop = document.getElementById('historyBackdrop');
if (openBtn) {
openBtn.addEventListener('click', () => {
panel.classList.remove('hidden');
renderHistory();
playSound(soundClick);
});
}
if (closeBtn) {
closeBtn.addEventListener('click', () => {
panel.classList.add('hidden');
playSound(soundClick);
});
}
if (backdrop) {
backdrop.addEventListener('click', () => {
panel.classList.add('hidden');
playSound(soundClick);
});
}

if (clearBtn) {
clearBtn.addEventListener('click', () => {
playSound(soundClick);
if (confirm('Sicuro di cancellare la cronologia?')) {
localStorage.removeItem(HISTORY_KEY);
activeSession = null;
renderHistory();
}
});
}
}
function renderHistory() {
const listEl = document.getElementById('historyList');
if (!listEl) return;
const items = loadHistory().slice().reverse();
if (items.length === 0) {
listEl.innerHTML = '<p style="opacity:.7">Nessuna partita salvata.</p>';
return;
}
listEl.innerHTML = items.map(s => `
<div class="history-card">
<div class="history-row">
<strong>${new Date(s.startedAt).toLocaleString()}</strong>
<span>${s.outcome||'In corso'} • €${s.winnings||0}</span>
</div>
<details>
<summary>Eventi</summary>
<ol class="turns">
${s.events.map(e => `<li>${e.at}: ${e.text}</li>`).join('')}
</ol>
</details>
</div>
`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
initHistoryUI();
renderHistory();

function createBetBadge() {
const gameArea = document.getElementById("gameArea");
let badge = document.getElementById("betBadge");
if (!badge) {
badge = document.createElement("div");
badge.id = "betBadge";
badge.style.padding = "6px 12px";
badge.style.background = "#ffcc00";
badge.style.color = "#222";
badge.style.fontWeight = "700";
badge.style.fontSize = "1.1rem";
badge.style.borderRadius = "10px";
badge.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
badge.style.userSelect = "none";
badge.style.marginBottom = "8px";
badge.style.textAlign = "center";
gameArea.insertBefore(badge, gameArea.firstChild);
}
puntataIniziale = parseFloat(document.getElementById("bet").value);
badge.textContent = `Puntata: €${puntataIniziale.toFixed(2)}`;
}
function updateBetBadge() {
const badge = document.getElementById("betBadge");
if (badge) {
puntataIniziale = parseFloat(document.getElementById("bet").value);
badge.textContent = `Puntata: €${puntataIniziale.toFixed(2)}`;
}
}

document.getElementById("startButton").addEventListener("click", () => {
createBetBadge();
});

function showMinigiocoMoltiplicatore(callback) {
playSound(soundMinigame);
if (minigiocoAttivo) return;
minigiocoAttivo = true;
minigiocoCallback = callback;

const popup = document.getElementById("minigiocoJolly");
if (gameAreaOriginalDisplay === null) {
gameAreaOriginalDisplay = getComputedStyle(gameArea).display;
}
gameArea.style.display = "none";
popup.style.display = "flex";
popup.style.flexDirection = "column";
popup.style.alignItems = "center";
popup.style.justifyContent = "center";
popup.style.paddingTop = "20";
popup.style.width = "100%";
popup.style.height = "100vh";
popup.style.backgroundColor = "#800020";
popup.style.backgroundImage = "url('sfondomini.png')";
popup.style.backgroundPosition = "center";
popup.style.backgroundSize = "cover";
popup.style.marginTop = "0";
popup.style.marginBottom = "0";

const title = document.getElementById("minigiocoTitle");
const cardElems = [document.getElementById("minicard1"), document.getElementById("minicard2")];
const closeBtn = document.getElementById("minigiocoCloseBtn");

function resizeMinigioco() {
let screenWidth = window.innerWidth;
if (title) {
title.style.order = "1";
title.style.fontSize = screenWidth < 600 ? "0.8em" : "1.8em";
title.style.color = "white";
title.style.marginBottom = screenWidth < 600 ? "6px" : "15px";
title.style.textAlign = "center";
}
cardElems.forEach(c => {
c.style.order = "2";
if (screenWidth < 600) {
c.style.width = "90px";
c.style.height = "150px";
c.style.margin = "0 4px";
} else {
c.style.width = "160px";
c.style.height = "230px";
c.style.margin = "0 12px";
}
});
if (closeBtn) {
closeBtn.style.order = "3";
closeBtn.style.marginTop = screenWidth < 600 ? "10px" : "25px";
closeBtn.style.fontSize = screenWidth < 600 ? "0.75em" : "1.1em";
closeBtn.style.padding = screenWidth < 600 ? "4px 8px" : "8px 16px";
}
popup.style.justifyContent = screenWidth < 600 ? "flex-start" : "center";
popup.style.paddingTop = screenWidth < 600 ? "10px" : "20px";
}
resizeMinigioco();
window.addEventListener("resize", resizeMinigioco);

const moltiplicatoriMinigioco = [2, 3, 4, 5, 10];
function generaCartaMoltiplicatore() {
const valore = moltiplicatoriMinigioco[Math.floor(Math.random() * moltiplicatoriMinigioco.length)];
const suitsLetters = ['C', 'P', 'F', 'Q'];
const value = Math.floor(Math.random() * 10) + 1;
const suitLetter = suitsLetters[Math.floor(Math.random() * suitsLetters.length)];
return {
type: "moltiplicatore",
value: valore,
img: `cards/card_${value}${suitLetter}.png`
};
}

let carte = [generaCartaMoltiplicatore(), generaCartaMoltiplicatore()];
carte.sort(() => Math.random() - 0.5);

cardElems.forEach((el, i) => {
el.src = "cards/card_back.png";
el.classList.remove("flipped", "selected");
el.classList.add("covered");
el.style.borderColor = "transparent";
el.style.cursor = "pointer";
el.dataset.type = carte[i].type;
el.dataset.img = carte[i].img;
el.dataset.value = carte[i].value;
el.onclick = () => {
if (!minigiocoAttivo) return;
minigiocoAttivo = false;
cardElems.forEach(c => c.classList.remove("covered"));
el.classList.add("flipped");
el.style.cursor = "default";
setTimeout(() => {
el.src = el.dataset.img;
el.classList.add("selected");
playSound(soundMultiplier);
alert(`Hai vinto un moltiplicatore bonus x${el.dataset.value}!`);
}, 300);
setTimeout(() => {
if (minigiocoCallback)
minigiocoCallback("moltiplicatore", parseInt(el.dataset.value || "0"));
minigiocoCallback = null;
popup.style.display = "none";
gameArea.style.display = gameAreaOriginalDisplay;
window.removeEventListener("resize", resizeMinigioco);
}, 1700);
};
});

closeBtn.onclick = () => {
if (!minigiocoAttivo) return;
minigiocoAttivo = false;
minigiocoCallback = null;
popup.style.display = "none";
gameArea.style.display = gameAreaOriginalDisplay;
window.removeEventListener("resize", resizeMinigioco);
};
}

function aggiornaMoltiplicatori() {
currentLevel = "easy";
creaProgressSteps();
const multiplierLabels = document.querySelectorAll(".multiplier-label");
multiplierLabels.forEach((label, index) => {
if (moltiplicatori[index]) {
label.textContent = "x" + moltiplicatori[index];
label.classList.remove("jackpot");
}
});
aggiornaGuadagno(correctCount);
}

const startButton = document.getElementById("startButton");
const gameSetup = document.getElementById("gameSetup");
const challengeText = document.getElementById("challengeText");
const challengeButtons = document.getElementById("challengeButtons");
const currentCardImg = document.getElementById("currentCardImg");
const correctCountSpan = document.getElementById("correctCount");
const errorCountSpan = document.getElementById("errorCount");
const rulesToggle = document.getElementById("rulesLabel");
const rulesPanel = document.getElementById("rulesPanel");
const progressCounter = document.getElementById("progressCounter");
const progressPath = document.getElementById("progressPath");
const languageSelect = document.getElementById("languageSelect");
const selectBet = document.getElementById("bet");

selectBet.addEventListener("change", () => {
puntataIniziale = parseFloat(selectBet.value);
playSound(soundClick);
});
rulesToggle.addEventListener("click", () => {
rulesPanel.classList.toggle("hidden");
});

startButton.addEventListener("click", () => {
playSound(soundClick);
const dummy = new Audio('click.mp3');
dummy.play().catch(() => {});
if (audioOn) {
backgroundMusic.currentTime = 0;   // ricomincia dall'inizio se serve
backgroundMusic.play()
.then(() => console.log("Musica partita"))
.catch(err => console.warn("Errore avvio musica:", err));
}
startHistorySession();
aggiornaMoltiplicatori();
preloadCardImages();
gameSetup.classList.add("hidden");
gameArea.classList.remove("hidden");
startGame();
document.querySelectorAll("button").forEach(btn => {
btn.addEventListener("click", () => playSound(soundClick));
});
document.querySelectorAll("select").forEach(sel => {
sel.addEventListener("change", () => playSound(soundClick));
});
});

languageSelect.addEventListener("change", () => {
currentLanguage = languageSelect.value;
updateLanguage();
playSound(soundClick);
});

function updateScore() {
document.getElementById("scoreValue").innerText = correctCount;
correctCountSpan.textContent = correctCount;
errorCountSpan.textContent = errorCount;
}

function updateProgress() {
const steps = progressPath.querySelectorAll(".progress-step");
steps.forEach((step, i) => {
step.classList.remove("completed-step");
if (i < tappe) {
void step.offsetWidth;
step.classList.add("completed-step");
}
});
progressCounter.textContent = `${translate("stage")}: ${tappe}`;
const activeStep = steps[tappe - 1];
if (activeStep) {
progressPath.scrollLeft = activeStep.offsetLeft - progressPath.offsetWidth / 2 + activeStep.offsetWidth / 2;
}
}

function creaProgressSteps() {
const progressPath = document.getElementById("progressPath");
progressPath.innerHTML = "";
const numeroTappe = tappeMassime[currentLevel] || 10;
const livelloKey = String(currentLevel).toLowerCase();
const moltiplicatoriLivello = moltiplicatori[livelloKey] || [];
for (let i = 0; i < numeroTappe; i++) {
const step = document.createElement("div");
step.classList.add("progress-step");
const circle = document.createElement("div");
circle.classList.add("circle");
step.appendChild(circle);
const multiplier = document.createElement("div");
multiplier.classList.add("multiplier-label");
multiplier.textContent = moltiplicatoriLivello[i] !== undefined ? "x" + moltiplicatoriLivello[i] : "";
step.appendChild(multiplier);
progressPath.appendChild(step);
}
}

function preloadCardImages() {
  const suits = ['C','P','F','Q'];
  for (let suit of suits) {
    for (let value = 1; value <= 10; value++) {
      const img = new Image();
      img.src = `cards/${value}${suit}.png`;
    }
  }
  const back = new Image();
  back.src = "cards/card_back.png";
}

function startGame() {
partitaIniziata = true;
tappe = 0;
creaProgressSteps();
errorCount = 0;
correctCount = 0;
correctStreak = 0;
moltiplicatoreBonus = 0;
currentCard = drawCard();
displayCurrentCard(currentCard);
displayDrawnCard(null, true);
generateChallenge();
}

function drawCard(avoidValue = null) {
  const suitsLetters = ['C','P','F','Q'];
  let value, suitLetter;
  do {
    value = Math.floor(Math.random() * 10) + 1; // 1-10
    suitLetter = suitsLetters[Math.floor(Math.random() * 4)];
  } while (value === avoidValue);
  return { value, suit: suitLetter };
}

function displayCurrentCard(card) {
  currentCardImg.src = `cards/${card.value}${card.suit}.png`;
}
function displayDrawnCard(card, covered = false) {
  const drawnCardImg = document.getElementById("drawnCardImg");
  if (covered || !card) {
    drawnCardImg.src = "cards/card_back.png";
  } else {
    drawnCardImg.src = `cards/${card.value}${card.suit}.png`;
  }
}

function isRed(suit) {
return suit === "C" || suit === "Q";
}

function isBlack(suit) {
return suit === "F" || suit === "P";
}

function generateChallenge() {
displayDrawnCard(null, true);
let challenges = [
{ key: "higherLower", label: { it: "Maggiore o Minore", en: "Higher or Lower" } },
{ key: "evenOdd", label: { it: "Pari o Dispari", en: "Even or Odd" } },
{ key: "color", label: { it: "Colore", en: "Color" } },
];

// livello unico = easy, niente filtri
const selected = challenges[Math.floor(Math.random() * challenges.length)];
const label = selected.label[currentLanguage];
challengeText.textContent = `${translate("challenge")}: ${label}`;
challengeButtons.innerHTML = "";

const lockedValue = currentCard.value;
if (selected.key === "higherLower") {
addButton(translate("higher"), (next) => next.value > lockedValue);
addButton(translate("lower"), (next) => next.value < lockedValue);
} else if (selected.key === "evenOdd") {
addButton(translate("even"), (next) => next.value % 2 === 0);
addButton(translate("odd"), (next) => next.value % 2 !== 0);
} else if (selected.key === "color") {
addButton(translate("red"), (next) => isRed(next.suit));
addButton(translate("black"), (next) => isBlack(next.suit));
}
}

function addButton(text, checkFn) {
const btn = document.createElement("button");
btn.textContent = text;
btn.classList.add("green-button");
btn.style.color = "white";
btn.onclick = () => {
const drawnCard = drawCard(currentCard.value);
const cardName = `${drawnCard.value}${drawnCard.suit}`;
logHistoryEvent(`Hai giocato la carta: ${cardName}`);
const drawnImg = document.getElementById("drawnCardImg");

playSound(soundFlip);
drawnImg.style.transition = "transform 0.6s ease";
drawnImg.style.transform = "rotateY(90deg) scale(1.05)";
setTimeout(() => {
displayDrawnCard(drawnCard, false);
drawnImg.style.transform = "rotateY(0deg) scale(1)";
setTimeout(() => {
currentCard = drawnCard;
displayCurrentCard(currentCard);
displayDrawnCard(null, true);

const result = checkFn(drawnCard);
if (result) {
correctCount++;
tappe++;
correctStreak++;
playSound(soundCorrect);

if (correctStreak === 3) {
correctStreak = 0;
showMinigiocoMoltiplicatore((tipo, valore) => {
moltiplicatoreBonus += valore;
updateScore();
});
}
} else {
correctStreak = 0;
errorCount++;
playSound(soundWrong);
}

generateChallenge();
updateScore();
updateProgress();
aggiornaGuadagno(correctCount);

}, 1500);
}, 300);
};
challengeButtons.appendChild(btn);
}

function updateScore() {
document.getElementById("scoreValue").innerText = correctCount;
correctCountSpan.textContent = correctCount;
errorCountSpan.textContent = errorCount;
}

function aggiornaGuadagno(corretti) {
const label = document.getElementById("gainLabel");
let guadagno = puntataIniziale;
const moltiplicatoriLivello = moltiplicatori[currentLevel];
for (let i = 0; i < corretti && i < moltiplicatoriLivello.length; i++) {
guadagno *= moltiplicatoriLivello[i];
}
guadagno += moltiplicatoreBonus * puntataIniziale;
label.textContent = "+€" + guadagno.toFixed(2);
}

function updateLanguage() {
document.querySelector("html").lang = currentLanguage;
document.getElementById("gameTitle").textContent = translate("title");
document.getElementById("startButton").textContent = translate("start");
document.getElementById("rulesLabel").textContent = translate("rules");
document.getElementById("currentCardLabel").textContent = translate("currentCard");
document.getElementById("betLabel").textContent = translate("bet");
document.getElementById("pointsLabel").textContent = translate("points");
document.getElementById("correctLabel").textContent = "✅ " + translate("correct");
document.getElementById("errorLabel").textContent = "❌ " + translate("error");
updateProgress();
rulesPanel.innerHTML = translate("rulesText");
document.getElementById("withdrawLabel").textContent = translate("withdraw");
}

function translate(key) {
const t = {
it: {
red: "Rosso",
black: "Nero",
title: "Deck Step",
start: "🎮 Inizia la partita",
rules: "📜 Regole",
currentCard: "Carta attuale:",
challenge: "Sfida",
higher: "Maggiore",
lower: "Minore",
even: "Pari",
odd: "Dispari",
correct: "Corrette",
error: "Errori",
stage: "Tappa",
points: "Punti:",
bet: "Puntata:",
withdraw: "Ritira",
rulesText: `<p>Benvenuto in <strong>Deck Step</strong>! Indovina le carte successive e completa 10 tappe.</p>
<ul>
<li>Ogni turno pesca una carta e affronta una sfida: Maggiore/Minore, Colore o Pari/Dispari.</li>
<li>Dopo 3 risposte corrette consecutive ottieni un <strong>Moltiplicatore Bonus</strong>.</li>
<li>La partita termina se sbagli troppe volte.</li>
</ul>`,
},
en: {
red: "Red",
black: "Black",
title: "Deck Step",
start: "🎮 Start Game",
rules: "📜 Rules",
currentCard: "Current card:",
challenge: "Challenge",
higher: "Higher",
lower: "Lower",
even: "Even",
odd: "Odd",
correct: "Correct",
error: "Errors",
stage: "Stage",
points: "Points:",
bet: "Bet:",
withdraw: "Withdraw",
rulesText: `<p>Welcome to <strong>Deck Step</strong>! Guess the next cards and complete 10 stages.</p>
<ul>
<li>Each turn draws a card and gives a challenge: Higher/Lower, Color or Even/Odd.</li>
<li>After 3 correct answers in a row you earn a <strong>Bonus Multiplier</strong>.</li>
<li>The game ends if you make too many mistakes.</li>
</ul>`,
}
};
return t[currentLanguage][key];
}
function calcolaGuadagno(corretti) {
let guadagno = puntataIniziale;
const moltiplicatoriLivello = moltiplicatori[currentLevel];
for (let i = 0; i < corretti && i < moltiplicatoriLivello.length; i++) {
guadagno *= moltiplicatoriLivello[i];
}
guadagno += moltiplicatoreBonus * puntataIniziale;
return guadagno;
}
const gameArea = document.getElementById("gameArea");
gameArea.style.transform = "scale(0.90)";
gameArea.style.transformOrigin = "top center";
});
