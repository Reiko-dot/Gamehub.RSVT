const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const messageBox = document.getElementById('message-box');
const flowerButtonsContainer = document.getElementById('flower-buttons-container');
const selectedSeedDisplay = document.getElementById('selected-seed-display');
const waterButton = document.getElementById('water-button');
const clearButton = document.getElementById('clear-button'); // New button reference

let plants = [];
let isWatering = false; // Tracks if a pointer is currently held down for continuous watering
let isWateringMode = false; // Tracks if the Water Mode button is toggled ON
let activePlant = null;
let animationFrameId;
let selectedPlantType = null; // New state for selection

const GAME_CONFIG = {
    GROWTH_STAGES: 5,
    WATER_PER_CLICK: 3,
    WATER_BURST: 20, // Large dose of water when single-clicking in Water Mode
    WATER_DECAY: 0.1,
    MAX_PLANTS: 8,
};

const PLANT_TYPES = ['Moonpetal', 'Sunstreak', 'Dreamveil', 'Starlight'];

const FLOWER_PALETTES = {
    Moonpetal: { color: '#B39CD0', stem: '#4D805A', bloomSize: 15, shape: 'sphere' },
    Sunstreak: { color: '#FFB84C', stem: '#685934', bloomSize: 10, shape: 'spire' },
    Dreamveil: { color: '#FF7F50', stem: '#794044', bloomSize: 20, shape: 'rose' },
    Starlight: { color: '#90EE90', stem: '#386641', bloomSize: 12, shape: 'star' }
};

// Utility to display messages instead of alert()
function showMessage(text, duration = 2000) {
    // New implementation uses the discreet 'toast' style set in CSS
    messageBox.textContent = text;
    messageBox.classList.add('visible');
    setTimeout(() => {
        messageBox.classList.remove('visible');
    }, duration);
}

// --- Plant Class (unchanged) ---

class Plant {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.height = 0;
        this.stage = 0;
        this.waterLevel = 0;
        this.type = type;
        this.config = FLOWER_PALETTES[type];
        this.angle = 0;
        this.isWatering = false;
        this.isBlooming = false;
        this.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
        this.stemColor = this.config.stem;
        this.flowerColor = this.config.color;
    }

    update() {
        if (!this.isWatering && this.waterLevel > 0) {
            this.waterLevel = Math.max(0, this.waterLevel - GAME_CONFIG.WATER_DECAY);
        }

        if (this.waterLevel >= 100 && this.stage < GAME_CONFIG.GROWTH_STAGES) {
            this.waterLevel = 0;
            this.stage++;
            this.isWatering = false;
            this.isBlooming = (this.stage === GAME_CONFIG.GROWTH_STAGES);

            if (this.isBlooming) {
                showMessage(`${this.type} bloomed beautifully!`, 3000);
            }
        }

        this.angle += 0.05;
    }

    draw() {
        const baseRadius = 5 + this.stage * 2;
        const maxGrowthHeight = canvas.height / 3;
        const currentHeight = this.stage * (maxGrowthHeight / GAME_CONFIG.GROWTH_STAGES) + (this.waterLevel / 100 * (maxGrowthHeight / GAME_CONFIG.GROWTH_STAGES));

        const stemX = this.x;
        const stemY = this.y;

        // 1. Draw Ground Base (The root ball)
        ctx.fillStyle = this.stemColor;
        ctx.beginPath();
        ctx.arc(stemX, stemY, baseRadius + 2, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Stem (only if stage > 0)
        if (this.stage > 0) {
            ctx.strokeStyle = this.stemColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(stemX, stemY);
            ctx.lineTo(stemX, stemY - currentHeight);
            ctx.stroke();
        }

        // 3. Draw Bloom
        if (this.stage > 0) {
            const bloomY = stemY - currentHeight;
            let bloomRadius = this.config.bloomSize;

            if (this.isBlooming) {
                bloomRadius += Math.sin(this.angle) * 3;
            } else {
                bloomRadius = 5 + (this.stage * 3) + (this.waterLevel / 100 * 5);
            }

            ctx.fillStyle = this.flowerColor;
            ctx.shadowColor = this.flowerColor + 'aa';
            ctx.shadowBlur = this.isBlooming ? 10 : 0;

            switch (this.config.shape) {
                case 'sphere':
                    ctx.beginPath();
                    ctx.arc(stemX, bloomY, bloomRadius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'spire':
                    this.drawStar(stemX, bloomY, 5, bloomRadius, bloomRadius / 2);
                    break;
                case 'rose':
                    ctx.beginPath();
                    ctx.arc(stemX, bloomY, bloomRadius * 0.75, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(stemX, bloomY, bloomRadius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = this.flowerColor;
                    ctx.fill();
                    break;
                case 'star':
                    this.drawStar(stemX, bloomY, 8, bloomRadius, bloomRadius / 2.5);
                    break;
            }

            ctx.shadowBlur = 0;
        }

        // 4. Draw Water Level Bar (above the ground base)
        if (this.stage < GAME_CONFIG.GROWTH_STAGES) {
            const barHeight = 4;
            const barWidth = 30;
            const barX = stemX - barWidth / 2;
            const barY = stemY - barHeight - 10;

            ctx.fillStyle = '#555';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const filledWidth = (this.waterLevel / 100) * barWidth;
            ctx.fillStyle = '#4cc9f0';
            ctx.fillRect(barX, barY, filledWidth, barHeight);
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius)
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y)
            rot += step

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y)
            rot += step
        }
        ctx.lineTo(cx, cy - outerRadius)
        ctx.closePath();
        ctx.fill();
    }
}

// --- Canvas and Drawing Loop ---

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    // Canvas height is set by the CSS/HTML structure (flex-grow: 1)
    // We ensure canvas's internal height matches its display height
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    plants.forEach(plant => {
        plant.update();
        plant.draw();
    });
}

function gameLoop() {
    drawScene();
    animationFrameId = requestAnimationFrame(gameLoop);
}


// --- Clear Garden Logic ---

function clearGarden() {
    plants = [];
    showMessage("Garden cleared! Start planting fresh seeds.");
}
clearButton.addEventListener('click', clearGarden);


// --- Flower Selection UI Generation ---

function setupFlowerButtons() {
    PLANT_TYPES.forEach(type => {
        const config = FLOWER_PALETTES[type];
        const button = document.createElement('button');
        button.textContent = `Plant ${type}`;
        button.className = `control-button`;
        button.style.backgroundColor = config.color;

        button.addEventListener('click', () => {
            selectedPlantType = type;
            selectedSeedDisplay.textContent = type;
            selectedSeedDisplay.style.color = config.color;

            // Deactivate watering mode when selecting a seed
            if (isWateringMode) { toggleWateringMode(); }

            // Update button styles to show selection ring
            document.querySelectorAll('#flower-buttons-container button').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');

            showMessage(`${type} seed selected! Click in the garden to plant.`);
        });
        flowerButtonsContainer.appendChild(button);
    });
}


// --- Water Button Logic ---

function toggleWateringMode() {
    isWateringMode = !isWateringMode;
    if (isWateringMode) {
        waterButton.textContent = "💧 Water Mode: ON";
        waterButton.classList.add('selected', 'bg-green-500');
        waterButton.classList.remove('bg-blue-500');
        canvas.style.cursor = 'crosshair'; // Keep crosshair simple
        showMessage("Water Mode Activated! Click a plant base to water it.");
    } else {
        waterButton.textContent = "💧 Water Mode: OFF";
        waterButton.classList.remove('selected', 'bg-green-500');
        waterButton.classList.add('bg-blue-500');
        canvas.style.cursor = 'crosshair';
        showMessage("Water Mode Deactivated. Select a seed to plant.");
    }
}

waterButton.addEventListener('click', toggleWateringMode);


// --- Planting Logic (Canvas Click) ---

function handleCanvasClick(e) {
    // If in watering mode, do not plant. Watering happens on pointer down/move.
    if (isWateringMode) {
        // Ignore the single 'click' event since watering handles pointer down/move
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedPlantType === null) {
        showMessage("Please select a seed type first using the buttons!");
        return;
    }

    // Restriction: Don't allow planting within 1/5th of the canvas height from the top.
    const minTopMargin = canvas.height / 5;
    if (y < minTopMargin) {
        showMessage("Please plant seeds closer to the ground, not up in the sky!");
        return;
    }

    // 1. Check for overlap
    const minSpacing = 50;
    for (const plant of plants) {
        const distance = Math.abs(plant.x - x);
        if (distance < minSpacing) {
            showMessage("Please find a little more space for your new plant.");
            return;
        }
    }

    // 2. Limit the total number of plants
    if (plants.length >= GAME_CONFIG.MAX_PLANTS) {
        showMessage(`The garden is full! Max ${GAME_CONFIG.MAX_PLANTS} plants.`);
        return;
    }

    // 3. Create the new plant at the clicked coordinates
    const newPlant = new Plant(x, y, selectedPlantType);
    plants.push(newPlant);
    showMessage(`A ${selectedPlantType} seed was planted!`, 2000);
}

canvas.addEventListener('click', (e) => handleCanvasClick(e));


// --- Watering Interaction Logic ---

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function handlePointerDown(e) {
    const pos = getPointerPos(e);

    // Find if click/touch is near a plant base
    activePlant = null;
    for (const plant of plants) {
        // Check distance against the plant's rooting point (plant.x, plant.y)
        const distance = Math.sqrt(Math.pow(plant.x - pos.x, 2) + Math.pow(plant.y - pos.y, 2));

        if (distance < 30 && plant.stage < GAME_CONFIG.GROWTH_STAGES) {
            activePlant = plant;

            if (isWateringMode) {
                // Apply a burst of water immediately on initial click/tap in Water Mode
                activePlant.waterLevel = Math.min(100, activePlant.waterLevel + GAME_CONFIG.WATER_BURST);

                // Also enable continuous watering for click-and-hold
                activePlant.isWatering = true;
                isWatering = true;
            }
            // If not in Water Mode, only the click-and-hold interaction is used
            else if (e.type === 'mousedown' || e.type === 'touchstart') {
                activePlant.isWatering = true;
                isWatering = true;
            }

            if (activePlant) {
                e.preventDefault(); // Prevent accidental canvas movement/scrolling
            }
            break;
        }
    }
}

function handlePointerMove(e) {
    if (isWatering && activePlant) {
        e.preventDefault();
        // Apply water every frame while held down
        activePlant.waterLevel = Math.min(100, activePlant.waterLevel + GAME_CONFIG.WATER_PER_CLICK);
    }
}

function handlePointerUp() {
    if (activePlant) {
        activePlant.isWatering = false;
    }
    isWatering = false;
    activePlant = null;
}

// Event listeners for watering (mouse and touch for responsiveness)
canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
canvas.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseleave', handlePointerUp); // Stop watering if mouse leaves

canvas.addEventListener('touchstart', (e) => handlePointerDown(e), { passive: false });
canvas.addEventListener('touchmove', (e) => handlePointerMove(e), { passive: false });
canvas.addEventListener('touchend', handlePointerUp);
canvas.addEventListener('touchcancel', handlePointerUp);


// --- Start the game ---

window.onload = function () {
    setupFlowerButtons();
    resizeCanvas();
    gameLoop();
}