let currentCard = null;
let correctCount = 0;
let errorCount = 0;
let audioOn = true;
const soundClick = new Audio("click.mp3");
const soundCorrect = new Audio("correct.mp3");
const soundWrong = new Audio("wrong.mp3");
const soundFlip = new Audio("flip.mp3");

function playSound(sound) {
  if (audioOn) {
    sound.currentTime = 0;
    sound.play();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const challengeText = document.getElementById("challengeText");
  const challengeButtons = document.getElementById("challengeButtons");
  const currentCardImg = document.getElementById("currentCardImg");
  const soundToggle = document.getElementById("soundToggle");
  soundToggle.addEventListener("click", () => {
    audioOn = !audioOn;
    soundToggle.textContent = audioOn ? "🔊" : "🔇";
  });
  startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    startGame();
  });

  function startGame() {
    drawCard();
    newChallenge();
  }

  // Pesca una carta
  function drawCard() {
    const value = Math.floor(Math.random() * 13) + 1;
    const suits = ["C", "P", "F", "Q"]; // cuori, picche, fiori, quadri
    const suit = suits[Math.floor(Math.random() * suits.length)];
    currentCard = { value, suit };
    currentCardImg.src = `cards/card_${value}${suit}.png`;
  }

  // Nuova sfida casuale
  function newChallenge() {
    challengeButtons.innerHTML = "";
    const challenges = ["higherLower", "redBlack", "evenOdd"];
    const type = challenges[Math.floor(Math.random() * challenges.length)];

    if (type === "higherLower") {
      challengeText.textContent = "La prossima carta sarà Maggiore o Minore?";
      makeButton("Maggiore", () => checkHigherLower(true));
      makeButton("Minore", () => checkHigherLower(false));
    } else if (type === "redBlack") {
      challengeText.textContent = "La prossima carta sarà Rossa o Nera?";
      makeButton("Rossa", () => checkRedBlack("red"));
      makeButton("Nera", () => checkRedBlack("black"));
    } else if (type === "evenOdd") {
      challengeText.textContent = "Il valore sarà Pari o Dispari?";
      makeButton("Pari", () => checkEvenOdd(true));
      makeButton("Dispari", () => checkEvenOdd(false));
    }
  }
  function makeButton(text, action) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add("green-button");
    btn.addEventListener("click", () => {
      playSound(soundClick);
      action();
    });
    challengeButtons.appendChild(btn);
  }
  function checkHigherLower(isHigher) {
    const oldValue = currentCard.value;
    drawCard();
    if ((isHigher && currentCard.value > oldValue) ||
        (!isHigher && currentCard.value < oldValue)) {
      playSound(soundCorrect);
      alert("✅ Corretto!");
    } else {
      playSound(soundWrong);
      alert("❌ Sbagliato!");
    }
    newChallenge();
  }

  // Controllo Rosso/Nero
  function checkRedBlack(choice) {
    drawCard();
    const reds = ["C", "Q"]; // cuori, quadri
    const isRed = reds.includes(currentCard.suit);
    if ((choice === "red" && isRed) || (choice === "black" && !isRed)) {
      playSound(soundCorrect);
      alert("✅ Corretto!");
    } else {
      playSound(soundWrong);
      alert("❌ Sbagliato!");
    }
    newChallenge();
  }
  function checkEvenOdd(isEven) {
    drawCard();
    if ((isEven && currentCard.value % 2 === 0) ||
        (!isEven && currentCard.value % 2 !== 0)) {
      playSound(soundCorrect);
      alert("✅ Corretto!");
    } else {
      playSound(soundWrong);
      alert("❌ Sbagliato!");
    }
    newChallenge();
  }
});
