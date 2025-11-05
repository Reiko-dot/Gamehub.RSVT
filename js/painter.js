'use strict';

const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const themeSelect = document.getElementById('themeSelect');
const glowToggle = document.getElementById('glowToggle');

let painting = false;
let brushColor = colorPicker.value;
let size = brushSize.value;
let erasing = false;
let glow = true;

// History stacks
let undoStack = [];
let redoStack = [];

/* ---------- Drawing Functions ---------- */
function startPosition(e) {
  painting = true;
  saveState();
  draw(e);
}

function endPosition() {
  painting = false;
  ctx.beginPath();
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
  return { x, y };
}

function draw(e) {
  if (!painting) return;
  e.preventDefault();

  const { x, y } = getCanvasCoords(e);
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = erasing ? getComputedStyle(document.body).backgroundColor : brushColor;
  ctx.shadowBlur = glow ? 15 : 0;
  ctx.shadowColor = glow ? brushColor : 'transparent';
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  // Optional sparkles
  if (glow && Math.random() > 0.95) {
    drawSparkle(x, y);
  }
}

function drawSparkle(x, y) {
  const sparkleSize = Math.random() * 6 + 2;
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = brushColor;
  ctx.fillStyle = brushColor;
  ctx.beginPath();
  ctx.arc(x, y, sparkleSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ---------- Undo/Redo ---------- */
function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
  redoStack = [];
}

function restoreState(stackFrom, stackTo) {
  if (stackFrom.length === 0) return;
  const dataUrl = stackFrom.pop();
  stackTo.push(canvas.toDataURL());
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

/* ---------- Utility Buttons ---------- */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
}

function saveImage() {
  const link = document.createElement('a');
  link.download = 'moonlight-painting.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ---------- Event Listeners ---------- */
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', endPosition);

canvas.addEventListener('touchstart', startPosition);
canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', draw);

colorPicker.addEventListener('input', e => {
  brushColor = e.target.value;
  erasing = false;
  eraserBtn.textContent = '🧽 Eraser';
});

brushSize.addEventListener('input', e => size = e.target.value);

eraserBtn.addEventListener('click', () => {
  erasing = !erasing;
  eraserBtn.textContent = erasing ? '🎨 Paint' : '🧽 Eraser';
});

glowToggle.addEventListener('change', e => glow = e.target.checked);

clearBtn.addEventListener('click', clearCanvas);
saveBtn.addEventListener('click', saveImage);
undoBtn.addEventListener('click', () => restoreState(undoStack, redoStack));
redoBtn.addEventListener('click', () => restoreState(redoStack, undoStack));

themeSelect.addEventListener('change', e => {
  document.body.className = e.target.value;
});

// Initialize theme and state
document.body.classList.add('night');