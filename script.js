let tappe = 0;
let currentCard = null;
let correctCount = 0;
let errorCount = 0;
let jollyCount = 0;
let correctStreak = 0;
let moltiplicatoreBonus = 0;
let minigiocoAttivo = false;
let minigiocoCallback = null;
let audioOn = true;
const soundClick = new Audio("click.mp3");
const soundCorrect = new Audio("correct.mp3");
const soundWrong = new Audio("wrong.mp3");
const soundFlip = new Audio("flip.mp3");
const soundMinigame = new Audio("minigame.mp3");
const soundJolly = new Audio("jolly.mp3");
function playSound(sound) {
  if (audioOn) {
    sound.currentTime = 0;
    sound.play();
  }
}
window.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const soundToggle = document.getElementById("soundToggle");
  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      audioOn = !audioOn;
      soundToggle.textContent = audioOn ? "🔊" : "🔇";
    });
  }
  if (startButton) {
    startButton.addEventListener("click", () => {
      startButton.style.display = "none";
      document.getElementById("gameArea").style.display = "block";
      startGame();
    });
  }
});
function startGame() {
  drawCard();
  generateChallenge();
}
function drawCard() {
  const value = Math.floor(Math.random() * 13) + 1;
  const suits = ["C", "P", "F", "Q"];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  currentCard = { value, suit };
  displayCurrentCard(currentCard);
  return currentCard;
}
function displayCurrentCard(card) {
  document.getElementById("currentCardImg").src = `cards/card_${card.value}${card.suit}.png`;
}
function displayDrawnCard(card, hide) {
  const img = document.getElementById("drawnCardImg");
  if (hide) {
    img.src = "cards/card_back.png";
  } else {
    img.src = `cards/card_${card.value}${card.suit}.png`;
  }
}
function generateChallenge() {
  const challengeText = document.getElementById("challengeText");
  const challengeButtons = document.getElementById("challengeButtons");
  challengeButtons.innerHTML = "";
  const challenges = ["higherLower", "redBlack", "evenOdd"];
  const type = challenges[Math.floor(Math.random() * challenges.length)];
  if (type === "higherLower") {
    challengeText.textContent = "La prossima carta sarà Maggiore o Minore?";
    addButton("Maggiore", card => card.value > currentCard.value);
    addButton("Minore", card => card.value < currentCard.value);
  } else if (type === "redBlack") {
    challengeText.textContent = "La prossima carta sarà Rossa o Nera?";
    addButton("Rossa", card => ["C", "Q"].includes(card.suit));
    addButton("Nera", card => ["P", "F"].includes(card.suit));
  } else if (type === "evenOdd") {
    challengeText.textContent = "Il valore sarà Pari o Dispari?";
    addButton("Pari", card => card.value % 2 === 0);
    addButton("Dispari", card => card.value % 2 !== 0);
  }
}
function addButton(text, checkFn) {
  const challengeButtons = document.getElementById("challengeButtons");
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.classList.add("green-button");
  btn.style.color = "white";
  btn.onclick = () => {
    playSound(soundClick);
    const drawnCard = drawCard();
    const drawnImg = document.getElementById("drawnCardImg");
    playSound(soundFlip);
    drawnImg.style.transition = "transform 0.6s ease";
    drawnImg.style.transform = "rotateY(90deg) scale(1.05)";
    setTimeout(() => {
      displayDrawnCard(drawnCard, false);
      drawnImg.style.transform = "rotateY(0deg) scale(1)";

      setTimeout(() => {
        const result = checkFn(drawnCard);

        if (result) {
          correctCount++;
          correctStreak++;
          playSound(soundCorrect);
          if (correctStreak === 3) {
            correctStreak = 0;
            showMinigiocoJolly((scelta) => {
              if (scelta === "jolly") {
                jollyCount++;
                updateJollyDisplay();
              }
            });
          }
        } else {
          errorCount++;
          correctStreak = 0;
          playSound(soundWrong);
        }
        generateChallenge();
        displayCurrentCard(drawnCard);
        displayDrawnCard(null, true);
      }, 1000);
    }, 300);
  };
  challengeButtons.appendChild(btn);
}
function showMinigiocoJolly(callback) {
  playSound(soundMinigame);
  if (minigiocoAttivo) return;
  minigiocoAttivo = true;
  minigiocoCallback = callback;

  const popup = document.getElementById("minigiocoJolly");
  const gameArea = document.getElementById("gameArea");
  popup.style.display = "flex";
  gameArea.style.display = "none";
  const cardElems = [document.getElementById("minicard1"), document.getElementById("minicard2")];
  cardElems.forEach(el => {
    el.src = "cards/card_back.png";
    el.onclick = () => {
      el.src = "jolly.png";
      playSound(soundJolly);
      alert("Hai vinto un Jolly! 🎉");
      jollyCount++;
      updateJollyDisplay();
      popup.style.display = "none";
      gameArea.style.display = "block";
      minigiocoAttivo = false;
      if (minigiocoCallback) {
        minigiocoCallback("jolly");
        minigiocoCallback = null;
      }
    };
  });
}
function updateJollyDisplay() {
  document.getElementById("jollyCount").textContent = jollyCount;
}
