const words = ["apple", "banana", "orange", "grape", "lemon", "melon", "cherry", "peach", "mango", "papaya", "kiwi", "plum", "pear", "blueberry", "raspberry", "strawberry", "watermelon", "coconut", "apricot", "pineapple", "tangerine"];
let currentWord = "";

// Shuffle letters in the word
function scramble(word) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

// Load a new word
function newWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  const scrambled = scramble(currentWord);
  document.getElementById("scrambled-word").textContent = scrambled;
  document.getElementById("guess-input").value = "";
  document.getElementById("message").textContent = "";
}

document.getElementById("check-btn").addEventListener("click", () => {
  const guess = document.getElementById("guess-input").value.trim().toLowerCase();
  if (!guess) return;

  if (guess === currentWord) {
    document.getElementById("message").textContent = "✅ Correct!";
    setTimeout(newWord, 1000);
  } else {
    document.getElementById("message").textContent = "❌ Try again!";
  }
});

// Start the first word
newWord();