// Variabili di stato
let currentCard = null;
let nextCard = null;
let correctCount = 0;
let errorCount = 0;
let jollyCount = 0;
let audioOn = true;

// Suoni
const soundClick = new Audio('click.mp3');
const soundCorrect = new Audio('correct.mp3');
const soundWrong = new Audio('wrong.mp3');
const soundFlip = new Audio("flip.mp3");

function playSound(sound) {
  if (audioOn) {
    sound.currentTime = 0;
    sound.play();
  }
}

// Mazzo
const suits = ["C", "Q", "F", "P"]; // cuori, quadri, fiori, picche
function getRandomCard() {
  const value = Math.floor(Math.random() * 10) + 1; // 1–10
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return { value, suit, img: `cards/card_${value}${suit}.png` };
}

// Inizio partita
document.getElementById("startButton").addEventListener("click", () => {
  playSound(soundClick);
  document.getElementById("setupArea").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");
  startGame();
});

function startGame() {
  correctCount = 0;
  errorCount = 0;
  jollyCount = 0;
  updateScore();

  currentCard = getRandomCard();
  document.getElementById("currentCardImg").src = currentCard.img;

  nextChallenge();
}

// Aggiorna punteggio
function updateScore() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("errorCount").textContent = errorCount;
  document.getElementById("jollyCount").textContent = jollyCount;
}

// Crea sfida
function nextChallenge() {
  nextCard = getRandomCard();
  document.getElementById("drawnCardImg").src = "cards/card_back.png";

  const challengeText = document.getElementById("challengeText");
  const buttons = document.getElementById("challengeButtons");
  buttons.innerHTML = "";

  // Sfida semplice: indovinare se è Maggiore o Minore
  challengeText.textContent = "La prossima carta sarà Maggiore o Minore?";
  ["Maggiore", "Minore"].forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.addEventListener("click", () => checkAnswer(choice));
    buttons.appendChild(btn);
  });
}

function checkAnswer(choice) {
  playSound(soundClick);

  // Mostra carta
  playSound(soundFlip);
  document.getElementById("drawnCardImg").src = nextCard.img;

  const isHigher = nextCard.value > currentCard.value;
  const correct = (choice === "Maggiore" && isHigher) || (choice === "Minore" && !isHigher);

  if (correct) {
    playSound(soundCorrect);
    correctCount++;
    currentCard = nextCard;
  } else {
    playSound(soundWrong);
    errorCount++;
    currentCard = nextCard;
  }

  updateScore();

  setTimeout(() => {
    nextChallenge();
  }, 1200);
}

// Toggle audio
window.addEventListener("DOMContentLoaded", () => {
  const soundToggle = document.getElementById("soundToggle");
  if (!soundToggle) return;

  soundToggle.addEventListener("click", () => {
    audioOn = !audioOn;
    soundToggle.textContent = audioOn ? "🔊" : "🔇";
  });
});
