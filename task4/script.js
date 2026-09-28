const CODE_LENGTH = 4;

let secret = '';   
let history = []; 
let isWon = false;

const form = document.getElementById('guess-form');
const input = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const historyEl = document.getElementById('history');
const newGameBtn = document.getElementById('new-game-btn');

function generateSecret() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(Math.random() * digits.length);
    result += digits[index];
    digits.splice(index, 1); 
  }
  return result;
}


function validateInput(value) {
  if (!/^[0-9]*$/.test(value)) {
    return 'Допускаются только цифры (без букв и символов).';
  }
  if (value.length !== CODE_LENGTH) {
    return 'Нужно ввести ровно ' + CODE_LENGTH + ' цифры.';
  }
  for (let i = 0; i < value.length; i++) {
    if (value.indexOf(value[i]) !== i) {
      return 'Все цифры должны быть разными.';
    }
  }
  return '';
}

function countBullsAndCows(secretCode, guess) {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secretCode[i]) {
      bulls++;
    } else if (secretCode.indexOf(guess[i]) !== -1) {
      cows++;
    }
  }
  return { bulls: bulls, cows: cows };
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message' + (type ? ' ' + type : '');
}

function render() {
  attemptsEl.textContent = 'Попыток: ' + history.length;

  historyEl.innerHTML = '';
  history.map(function (item) {
    const li = document.createElement('li');
    li.textContent =
      item.guess + ' → ' +
      item.bulls + ' ' + plural(item.bulls, 'бык', 'быка', 'быков') + ', ' +
      item.cows + ' ' + plural(item.cows, 'корова', 'коровы', 'коров');
    return li;
  }).forEach(function (li) {
    historyEl.appendChild(li);
  });
  historyEl.scrollTop = historyEl.scrollHeight;

  input.disabled = isWon;
  checkBtn.disabled = isWon;
}

function makeGuess() {
  if (isWon) return;

  const value = input.value.trim();
  const error = validateInput(value);
  if (error !== '') {
    showMessage(error, 'error'); 
    return;
  }

  const result = countBullsAndCows(secret, value);
  history.push({ guess: value, bulls: result.bulls, cows: result.cows });
  input.value = '';

  if (result.bulls === CODE_LENGTH) {
    isWon = true;
    const n = history.length;
    showMessage('Победа! Угадано за ' + n + ' ' + plural(n, 'попытку', 'попытки', 'попыток'), 'win');
  } else {
    showMessage('', '');
  }
  render();
}

function newGame() {
  secret = generateSecret();
  history = [];
  isWon = false;
  input.value = '';
  showMessage('', '');
  render();
  input.focus();
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  makeGuess();
});

newGameBtn.addEventListener('click', newGame);

newGame();
