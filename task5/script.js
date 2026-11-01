const state = {
sequence: [],
input: [],
level: 0,
playing: false,
showing: false
};

const timers = new Set();
const pads = Array.from(document.querySelectorAll('.pad'));
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const startBtn = document.getElementById('start');
const tones = [329.63, 261.63, 220, 164.81];
let audioCtx = null;

function wait(ms) {
return new Promise(resolve => {
const id = setTimeout(() => {
timers.delete(id);
resolve();
}, ms);
timers.add(id);
});
}

function clearTimers() {
timers.forEach(id => clearTimeout(id));
timers.clear();
}

function playTone(freq, duration) {
if (!audioCtx) {
return;
}
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
osc.type = 'sine';
osc.frequency.value = freq;
gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime + duration / 1000);
}

function setPadsEnabled(enabled) {
pads.forEach(pad => {
pad.disabled = !enabled;
});
}

function clearActive() {
pads.forEach(pad => pad.classList.remove('active'));
}

function renderLevel() {
levelEl.textContent = 'Уровень: ' + state.level;
}

function setStatus(text) {
statusEl.textContent = text;
}

function randomStep() {
return Math.floor(Math.random() * 4);
}

async function lightUp(index, duration) {
pads[index].classList.add('active');
playTone(tones[index], duration);
await wait(duration);
pads[index].classList.remove('active');
}

async function showSequence() {
state.showing = true;
state.input = [];
setPadsEnabled(false);
setStatus('Запоминайте');
await wait(600);
for (const index of state.sequence) {
await lightUp(index, 500);
await wait(250);
}
state.showing = false;
setPadsEnabled(true);
setStatus('Ваш ход');
}

async function nextRound() {
state.sequence.push(randomStep());
state.level = state.sequence.length;
renderLevel();
await showSequence();
}

function gameOver() {
clearTimers();
clearActive();
state.playing = false;
state.showing = false;
setPadsEnabled(false);
playTone(110, 600);
setStatus('Игра окончена');
resultEl.textContent = 'Вы дошли до уровня ' + state.level;
}

async function handlePadClick(index) {
if (!state.playing || state.showing) {
return;
}
state.input.push(index);
const position = state.input.length - 1;
if (state.input[position] !== state.sequence[position]) {
gameOver();
return;
}
if (state.input.length === state.sequence.length) {
state.showing = true;
setPadsEnabled(false);
await lightUp(index, 250);
await wait(500);
await nextRound();
return;
}
await lightUp(index, 250);
}

function startGame() {
if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
clearTimers();
clearActive();
state.sequence = [];
state.input = [];
state.level = 0;
state.playing = true;
state.showing = true;
resultEl.textContent = '';
renderLevel();
nextRound();
}

pads.forEach(pad => {
pad.addEventListener('click', () => handlePadClick(Number(pad.dataset.index)));
});

startBtn.addEventListener('click', startGame);
