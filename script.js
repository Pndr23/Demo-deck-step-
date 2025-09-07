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
    localStorage.setItem("audioOn", audioOn); // ✅ salvo scelta
  });
});
let gameAreaOriginalDisplay = null;
let gameEnded = false;
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
  if (openBtn) openBtn.addEventListener('click', () => { panel.classList.remove('hidden'); renderHistory(); });
  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
  if (backdrop) backdrop.addEventListener('click', () => panel.classList.add('hidden'));
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (confirm('Sicuro di cancellare la cronologia?')) {
      localStorage.removeItem(HISTORY_KEY);
      activeSession = null;
      renderHistory();
    }
  });
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
});
rulesToggle.addEventListener("click", () => {
  rulesPanel.classList.toggle("hidden");
});
startButton.addEventListener("click", () => {
  const dummy = new Audio('click.mp3');
  dummy.play().catch(() => {});
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
  for (let i = 1; i <= 40; i++) {
    const img = new Image();
    img.src = `cards/card_${i}.png`;
  }
  const back = new Image();
  back.src = "cards/card_back.png";
} 
function startGame() {
 console.log("startGame chiamato");  // Controlla se la funzione viene eseguita
  console.log("Stato schermata gioco:", gameArea.hidden);
  partitaIniziata = true;
  gameEnded = false;
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
  const suitsLetters = ['C', 'P', 'F', 'Q'];
  let index, value, suitLetter;
  do {
    index = Math.floor(Math.random() * 40) + 1;
    value = ((index - 1) % 10) + 1;
    const suitIndex = Math.floor((index - 1) / 10);
    suitLetter = suitsLetters[suitIndex];
  }
    while (value === avoidValue);
  return { value, suit: suitLetter };
} 
function displayCurrentCard(card) {
   currentCardImg.src = `cards/card_${card.value}${card.suit}.png`;
} 
function displayDrawnCard(card, covered = false) {
  const drawnCardImg = document.getElementById("drawnCardImg");
  if (covered || !card) {
    drawnCardImg.src = "cards/card_back.png";
  } else {
    drawnCardImg.src = `cards/card_${card.value}${card.suit}.png`;
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
  if (currentLevel === "hard") {
    challenges = challenges.filter(ch => ch.key !== "color");
  }
  const selected = challenges[Math.floor(Math.random() * challenges.length)];
  const label = selected.label[currentLanguage];
  challengeText.textContent = `${translate("challenge")}: ${label}`;
  challengeButtons.innerHTML = "";
  const lockedValue = currentCard.value;
  const lockedSuit = currentCard.suit;
  if (selected.key === "higherLower") {
    addButton(translate("higher"), (next) => next.value > lockedValue);
    addButton(translate("lower"), (next) => next.value < lockedValue);
  } else if (selected.key === "evenOdd") {
    addButton(translate("even"), (next) => next.value % 2 === 0);
    addButton(translate("odd"), (next) => next.value % 2 !== 0);
    }
  } else if (selected.key === "color") {
    addButton(translate("red"), (next) => next.suit === "C" || next.suit === "Q");
    addButton(translate("black"), (next) => next.suit === "F" || next.suit === "P");
  }
}  
document.addEventListener("DOMContentLoaded", () => {
  currentLanguage = navigator.language.startsWith("en") ? "en" : "it";
  languageSelect.value = currentLanguage;
  currentLevel = "easy";
  updateLanguage();
  aggiornaMoltiplicatori();
    document.getElementById("gameArea").classList.remove("hidden");
    startGame();
  });
});
function addButton(text, checkFn) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.classList.add("green-button");
  btn.style.color = "white";
  btn.onclick = () => {
    playSound(soundClick);
    console.log("clicked", text);
    const drawnCard = drawCard(currentCard.value);
    const cardName = `${drawnCard.value}${drawnCard.suit}`;
    logHistoryEvent(`Hai giocato la carta: ${cardName}`);
    const drawnImg = document.getElementById("drawnCardImg");
    const maxErrors = currentLevel === "hard" ? 3 : 4;
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
          correctStreak++;
          playSound(soundCorrect);
            const totale = calcolaGuadagno(correctCount);
          } else {
            tappe++;
            if (correctStreak === 3) {
              correctStreak = 0;
              showMinigiocoJolly((scelta, valore) => {
             if (scelta === "moltiplicatore") {
                  moltiplicatoreBonus += valore;
                  alert(`Hai vinto un moltiplicatore bonus x${valore}! Sarà sommato al guadagno.`);
                  updateScore();
                }
              });
            }
          }
        } else {
          correctStreak = 0;
          errorCount++;
          if (errorCount < maxErrors) {
            playSound(soundWrong);
}
        generateChallenge();
        }
        updateScore();
        updateProgress();
        aggiornaGuadagno(correctCount);
      }, 1500);
    }, 300);
  };
  challengeButtons.appendChild(btn);
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
      rulesText: `<p>Benvenuto in <strong>Deck Step</strong>! Il tuo obiettivo è completare 10-15-20 tappe indovinando le carte successive e accumulando vincite.</p>
        <ul>
          <li>Scegli la <strong>puntata iniziale</strong> (€0,10–€5) e la difficoltà (Facile, Media, Difficile).</li>
          <li>Ogni turno pesca una carta e affronta una sfida: Maggiore/Minore, Colore, Seme, Pari/Dispari, Intervallo o Numero Esatto (solo Difficile).</li>
          <li>Dopo 3 risposte corrette consecutive, ottieni un <strong>Jolly</strong> o un <strong>Moltiplicatore Bonus</strong>.</li>
          <li>Puoi riscattare le vincite in qualsiasi momento, oppure continuare fino all'ultima tappa.</li>
          <li>Il numero massimo di errori: Facile/Medio = 4, Difficile = 3. Senza Jolly disponibili, la partita termina.</li>
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
      rulesText: `<p>Welcome to <strong>Deck Step</strong>! Your goal is to complete 10-15-20 stages by guessing the next cards and accumulating winnings.</p>
        <ul>
          <li>Choose your <strong>starting bet</strong> (€0.10–€5) and difficulty (Easy, Medium, Hard).</li>
          <li>Each turn draws a card and gives a challenge: Higher/Lower, Color, Suit, Even/Odd, Range, or Exact Number (Hard only).</li>
          <li>After 3 correct answers in a row, earn a <strong>Joker</strong> or a <strong>Bonus Multiplier</strong>.</li>
          <li>You can withdraw winnings anytime or continue until the last stage.</li>
          <li>Maximum mistakes allowed: Easy/Medium = 4, Hard = 3. Without Jokers, the game ends.</li>
        </ul>`,
    }
  };
  return t[currentLanguage][key];
}
document.addEventListener("DOMContentLoaded", () => {
  currentLanguage = navigator.language.startsWith("en") ? "en" : "it";
  languageSelect.value = currentLanguage;
  updateLanguage(); 
  aggiornaMoltiplicatori();
  startGame(); 
});
function calcolaGuadagno(corretti) {
  let guadagno = puntataIniziale;
    const moltiplicatoriLivello = moltiplicatori[currentLevel];
  for (let i = 0; i < corretti && i < moltiplicatoriLivello.length; i++) {
    guadagno *=  moltiplicatoriLivello[i];
  }
   guadagno += moltiplicatoreBonus * puntataIniziale; 
  return guadagno;
}
});
const gameArea = document.getElementById("gameArea");
gameArea.style.transform = "scale(0.90)"; 
gameArea.style.transformOrigin = "top center";
});
  
