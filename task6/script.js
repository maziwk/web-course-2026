(function () {
'use strict';

const CONFIG = {
cols: 20,
rows: 20,
cell: 20,
moveInterval: 150,
initialLength: 3
};

const KEY_DIRECTIONS = new Map([
['ArrowUp', { x: 0, y: -1 }],
['ArrowDown', { x: 0, y: 1 }],
['ArrowLeft', { x: -1, y: 0 }],
['ArrowRight', { x: 1, y: 0 }]
]);

const COLORS = {
grid: '#16251c',
snake: '#7fd6a0',
head: '#d4f7e0',
apple: '#ff6b5e'
};

function createModel(config) {
const state = {
snake: [],
direction: { x: 1, y: 0 },
pendingDirection: { x: 1, y: 0 },
apple: null,
score: 0,
gameOver: false
};

function createSnake() {
const headX = Math.floor(config.cols / 2);
const y = Math.floor(config.rows / 2);
const snake = [];
for (let i = 0; i < config.initialLength; i++) {
snake.push({ x: headX - i, y });
}
return snake;
}

function isSameCell(a, b) {
return a.x === b.x && a.y === b.y;
}

function spawnApple() {
const freeCells = [];
for (let x = 0; x < config.cols; x++) {
for (let y = 0; y < config.rows; y++) {
const cell = { x, y };
if (!state.snake.some(segment => isSameCell(segment, cell))) {
freeCells.push(cell);
}
}
}
if (freeCells.length === 0) {
return null;
}
return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function checkCollision(head, willGrow) {
const hitsWall = head.x < 0 || head.y < 0 || head.x >= config.cols || head.y >= config.rows;
if (hitsWall) {
return true;
}
const body = willGrow ? state.snake : state.snake.slice(0, -1);
return body.some(segment => isSameCell(segment, head));
}

function moveSnake(head, willGrow) {
state.snake.unshift(head);
if (!willGrow) {
state.snake.pop();
}
}

function reset() {
state.snake = createSnake();
state.direction = { x: 1, y: 0 };
state.pendingDirection = { x: 1, y: 0 };
state.score = 0;
state.gameOver = false;
state.apple = spawnApple();
}

function setDirection(direction) {
const isReverse = direction.x === -state.direction.x && direction.y === -state.direction.y;
if (isReverse) {
return;
}
state.pendingDirection = { x: direction.x, y: direction.y };
}

function update() {
if (state.gameOver) {
return;
}
state.direction = state.pendingDirection;
const current = state.snake[0];
const head = { x: current.x + state.direction.x, y: current.y + state.direction.y };
const willGrow = state.apple !== null && isSameCell(head, state.apple);
if (checkCollision(head, willGrow)) {
state.gameOver = true;
return;
}
moveSnake(head, willGrow);
if (willGrow) {
state.score += 1;
state.apple = spawnApple();
if (state.apple === null) {
state.gameOver = true;
}
}
}

function getState() {
return {
snake: state.snake.map(segment => ({ x: segment.x, y: segment.y })),
apple: state.apple ? { x: state.apple.x, y: state.apple.y } : null,
score: state.score,
gameOver: state.gameOver
};
}

return { reset, setDirection, update, getState };
}

function createView(elements, config) {
const ctx = elements.canvas.getContext('2d');
const cell = config.cell;

function clear() {
ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function drawGrid() {
ctx.strokeStyle = COLORS.grid;
ctx.lineWidth = 1;
ctx.beginPath();
for (let i = 1; i < config.cols; i++) {
ctx.moveTo(i * cell + 0.5, 0);
ctx.lineTo(i * cell + 0.5, config.rows * cell);
}
for (let j = 1; j < config.rows; j++) {
ctx.moveTo(0, j * cell + 0.5);
ctx.lineTo(config.cols * cell, j * cell + 0.5);
}
ctx.stroke();
}

function drawSnake(snake) {
snake.forEach((segment, index) => {
ctx.fillStyle = index === 0 ? COLORS.head : COLORS.snake;
ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
});
}

function drawApple(apple) {
if (!apple) {
return;
}
ctx.fillStyle = COLORS.apple;
ctx.beginPath();
ctx.arc(apple.x * cell + cell / 2, apple.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
ctx.fill();
}

function renderScore(score) {
elements.score.textContent = String(score);
}

function draw(state) {
clear();
drawGrid();
drawApple(state.apple);
drawSnake(state.snake);
renderScore(state.score);
}

function showGameOver(score) {
elements.finalScore.textContent = String(score);
elements.overlay.hidden = false;
}

function hideGameOver() {
elements.overlay.hidden = true;
}

function onRestart(handler) {
elements.restart.addEventListener('click', handler);
}

return { draw, showGameOver, hideGameOver, onRestart };
}

function createController(model, view, config) {
let frameId = null;
let lastMoveTime = 0;

function stop() {
if (frameId !== null) {
cancelAnimationFrame(frameId);
frameId = null;
}
}

function loop(time) {
if (time - lastMoveTime >= config.moveInterval) {
lastMoveTime += config.moveInterval;
if (time - lastMoveTime >= config.moveInterval) {
lastMoveTime = time;
}
model.update();
}
const state = model.getState();
view.draw(state);
if (state.gameOver) {
frameId = null;
view.showGameOver(state.score);
return;
}
frameId = requestAnimationFrame(loop);
}

function start() {
stop();
model.reset();
view.hideGameOver();
view.draw(model.getState());
lastMoveTime = performance.now();
frameId = requestAnimationFrame(loop);
}

function onKeyDown(event) {
const direction = KEY_DIRECTIONS.get(event.key);
if (!direction) {
return;
}
event.preventDefault();
model.setDirection(direction);
}

function init() {
document.addEventListener('keydown', onKeyDown);
view.onRestart(start);
start();
}

return { init };
}

function init() {
const elements = {
canvas: document.getElementById('game'),
score: document.getElementById('score'),
overlay: document.getElementById('overlay'),
finalScore: document.getElementById('final-score'),
restart: document.getElementById('restart')
};
const model = createModel(CONFIG);
const view = createView(elements, CONFIG);
const controller = createController(model, view, CONFIG);
controller.init();
}

init();
})();
