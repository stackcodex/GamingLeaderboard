/* =========================================
   AIM CHALLENGE
   GAMECORE
========================================= */

const canvas = document.getElementById("aimCanvas");
const ctx = canvas.getContext("2d");


// =========================================
// ELEMENTS
// =========================================

const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const hitsElement = document.getElementById("hits");
const accuracyElement = document.getElementById("accuracy");
const comboElement = document.getElementById("combo");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const submitBtn = document.getElementById("submitBtn");

const finalScoreElement = document.getElementById("finalScore");
const finalHitsElement = document.getElementById("finalHits");
const finalAccuracyElement = document.getElementById("finalAccuracy");
const finalComboElement = document.getElementById("finalCombo");

const scoreResultModal =
    document.getElementById("scoreResultModal");

const submittedScore =
    document.getElementById("submittedScore");

const scoreResultStatus =
    document.getElementById("scoreResultStatus");

const scoreResultMessage =
    document.getElementById("scoreResultMessage");

const viewLeaderboardBtn =
    document.getElementById("viewLeaderboardBtn");

const closeResultBtn =
    document.getElementById("closeResultBtn");


// =========================================
// GAME VARIABLES
// =========================================

let score = 0;
let hits = 0;
let misses = 0;

let combo = 0;
let bestCombo = 0;

let timeLeft = 30;

let gameRunning = false;

let timerInterval = null;

let target = null;

let particles = [];


// =========================================
// TARGET SETTINGS
// =========================================

const MIN_RADIUS = 24;
const MAX_RADIUS = 42;


// =========================================
// HIGH SCORE
// =========================================

let highScore =
    Number(localStorage.getItem("aimChallengeHighScore")) || 0;


// =========================================
// TARGET CREATION
// =========================================

function createTarget() {

    const radius =
        Math.floor(
            Math.random() *
            (MAX_RADIUS - MIN_RADIUS + 1)
        ) + MIN_RADIUS;

    const x =
        radius +
        Math.random() *
        (canvas.width - radius * 2);

    const y =
        radius +
        Math.random() *
        (canvas.height - radius * 2);

    target = {
        x: x,
        y: y,
        radius: radius,
        createdAt: performance.now(),
        colorIndex:
            Math.floor(Math.random() * 4)
    };
}


// =========================================
// COLORS
// =========================================

function getTargetColor() {

    const colors = [
        "#FF4FA3",
        "#FFD166",
        "#5CFF8A",
        "#5B8CFF"
    ];

    return colors[target.colorIndex];
}


// =========================================
// DRAW BACKGROUND
// =========================================

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grid

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 1;

    const gridSize = 40;


    for (
        let x = 0;
        x <= canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }


    for (
        let y = 0;
        y <= canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }


    // Center glow

    const gradient =
        ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            400
        );

    gradient.addColorStop(
        0,
        "rgba(91,140,255,0.04)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// =========================================
// DRAW TARGET
// =========================================

function drawTarget() {

    if (!target) {
        return;
    }


    const now = performance.now();

    const elapsed =
        now - target.createdAt;


    const pulse =
        Math.sin(now / 180) * 2;


    const radius =
        target.radius + pulse;


    const color =
        getTargetColor();


    // Outer glow

    ctx.save();

    ctx.shadowBlur = 28;
    ctx.shadowColor = color;

    ctx.beginPath();

    ctx.arc(
        target.x,
        target.y,
        radius + 5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.04)";

    ctx.fill();

    ctx.restore();


    // Outer ring

    ctx.beginPath();

    ctx.arc(
        target.x,
        target.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(5,5,7,0.9)";

    ctx.fill();

    ctx.strokeStyle = color;

    ctx.lineWidth = 3;

    ctx.stroke();


    // Middle ring

    ctx.beginPath();

    ctx.arc(
        target.x,
        target.y,
        radius * 0.72,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 2;

    ctx.stroke();


    // Inner circle

    ctx.beginPath();

    ctx.arc(
        target.x,
        target.y,
        radius * 0.45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = color;

    ctx.shadowBlur = 18;
    ctx.shadowColor = color;

    ctx.fill();

    ctx.shadowBlur = 0;


    // Center

    ctx.beginPath();

    ctx.arc(
        target.x,
        target.y,
        radius * 0.15,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fill();


    // Crosshair

    ctx.strokeStyle =
        "rgba(255,255,255,0.75)";

    ctx.lineWidth = 1;


    ctx.beginPath();

    ctx.moveTo(
        target.x - radius - 8,
        target.y
    );

    ctx.lineTo(
        target.x + radius + 8,
        target.y
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        target.x,
        target.y - radius - 8
    );

    ctx.lineTo(
        target.x,
        target.y + radius + 8
    );

    ctx.stroke();


    // Target lifetime indicator

    if (gameRunning) {

        const life =
            Math.min(
                elapsed / 3500,
                1
            );

        ctx.beginPath();

        ctx.arc(
            target.x,
            target.y,
            radius + 10,
            -Math.PI / 2,
            -Math.PI / 2 +
                Math.PI * 2 * life
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.25)";

        ctx.lineWidth = 2;

        ctx.stroke();
    }
}


// =========================================
// PARTICLES
// =========================================

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                particle.color;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

    ctx.globalAlpha = 1;
}


function createParticles(
    x,
    y,
    color
) {

    for (let i = 0; i < 14; i++) {

        particles.push({

            x: x,
            y: y,

            vx:
                (Math.random() - 0.5) * 6,

            vy:
                (Math.random() - 0.5) * 6,

            size:
                Math.random() * 3 + 1,

            life: 1,

            color: color

        });
    }
}


function updateParticles() {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx;

            particle.y +=
                particle.vy;

            particle.vx *= 0.97;
            particle.vy *= 0.97;

            particle.life -= 0.035;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );
}


// =========================================
// GAME LOOP
// =========================================

function gameLoop() {

    drawBackground();

    updateParticles();

    drawParticles();

    drawTarget();

    requestAnimationFrame(gameLoop);
}


// =========================================
// START GAME
// =========================================

function startGame() {

    score = 0;
    hits = 0;
    misses = 0;

    combo = 0;
    bestCombo = 0;

    timeLeft = 30;

    particles = [];

    gameRunning = true;


    updateStats();


    timerElement.textContent =
        timeLeft;

    timerElement.style.color =
        "#ffffff";


    startOverlay.classList.add(
        "hidden"
    );

    gameOverOverlay.classList.add(
        "hidden"
    );

    scoreResultModal.classList.add(
        "hidden"
    );


    createTarget();


    clearInterval(timerInterval);


    timerInterval =
        setInterval(
            updateTimer,
            1000
        );
}


// =========================================
// TIMER
// =========================================

function updateTimer() {

    if (!gameRunning) {
        return;
    }


    timeLeft--;

    timerElement.textContent =
        timeLeft;


    if (timeLeft <= 5) {

        timerElement.style.color =
            "#FF4FA3";

    } else {

        timerElement.style.color =
            "#ffffff";
    }


    if (timeLeft <= 0) {

        endGame();
    }
}


// =========================================
// CANVAS CLICK
// =========================================

canvas.addEventListener(
    "click",
    function(event) {

        if (!gameRunning) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width /
            rect.width;

        const scaleY =
            canvas.height /
            rect.height;


        const mouseX =
            (event.clientX - rect.left) *
            scaleX;

        const mouseY =
            (event.clientY - rect.top) *
            scaleY;


        if (!target) {
            return;
        }


        const distance =
            Math.sqrt(
                Math.pow(
                    mouseX - target.x,
                    2
                ) +
                Math.pow(
                    mouseY - target.y,
                    2
                )
            );


        if (
            distance <=
            target.radius + 5
        ) {

            hitTarget();

        } else {

            missTarget();
        }

    }
);


// =========================================
// HIT TARGET
// =========================================

function hitTarget() {

    hits++;

    combo++;


    if (combo > bestCombo) {

        bestCombo = combo;
    }


    let points = 100;


    // Combo bonus

    if (combo >= 3) {

        points +=
            (combo - 2) * 25;
    }


    // Speed bonus

    const reactionTime =
        performance.now() -
        target.createdAt;


    if (reactionTime < 700) {

        points += 50;

    } else if (
        reactionTime < 1200
    ) {

        points += 25;
    }


    score += points;


    createParticles(
        target.x,
        target.y,
        getTargetColor()
    );


    createTarget();


    updateStats();

    flashScore();
}


// =========================================
// MISS TARGET
// =========================================

function missTarget() {

    misses++;

    combo = 0;


    score =
        Math.max(
            0,
            score - 25
        );


    updateStats();
}


// =========================================
// UPDATE STATS
// =========================================

function updateStats() {

    scoreElement.textContent =
        score;

    hitsElement.textContent =
        hits;

    comboElement.textContent =
        combo + "x";


    const totalShots =
        hits + misses;


    let accuracy = 100;


    if (totalShots > 0) {

        accuracy =
            Math.round(
                (hits / totalShots) *
                100
            );
    }


    accuracyElement.textContent =
        accuracy + "%";
}


// =========================================
// FLASH SCORE
// =========================================

function flashScore() {

    scoreElement.classList.remove(
        "stat-flash"
    );


    void scoreElement.offsetWidth;


    scoreElement.classList.add(
        "stat-flash"
    );
}


// =========================================
// END GAME
// =========================================

function endGame() {

    gameRunning = false;


    clearInterval(
        timerInterval
    );


    const totalShots =
        hits + misses;


    let accuracy = 100;


    if (totalShots > 0) {

        accuracy =
            Math.round(
                (hits / totalShots) *
                100
            );
    }


    // Local high score

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "aimChallengeHighScore",
            highScore
        );
    }


    // Final values

    finalScoreElement.textContent =
        score;

    finalHitsElement.textContent =
        hits;

    finalAccuracyElement.textContent =
        accuracy + "%";

    finalComboElement.textContent =
        bestCombo + "x";


    gameOverOverlay.classList.remove(
        "hidden"
    );
}


// =========================================
// SUBMIT SCORE
// =========================================

async function submitScore() {

    const userData =
        localStorage.getItem("gamecoreUser");


    if (!userData) {

        alert(
            "Please login before submitting your score."
        );

        window.location.href =
            "../../login.html";

        return;
    }


    let user;

    try {

        user =
            JSON.parse(userData);

    } catch (error) {

        alert(
            "User information is invalid. Please login again."
        );

        window.location.href =
            "../../login.html";

        return;
    }


    if (!user.id) {

        alert(
            "User information not found. Please login again."
        );

        window.location.href =
            "../../login.html";

        return;
    }


    if (score <= 0) {

        alert(
            "No valid score to submit."
        );

        return;
    }


    const API_URL =
        "http://localhost:8081/api/scores";

    const GAME_ID = 4;


    try {

        submitBtn.disabled = true;

        submitBtn.textContent =
            "SUBMITTING...";


        const response =
            await fetch(
                `${API_URL}?userId=${user.id}&gameId=${GAME_ID}&score=${score}`,
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Score submission failed."
            );
        }


        /*
         * Backend returns the saved best score.
         * If a higher score already existed,
         * that best score is returned.
         */

        const savedBestScore =
            Number(result.score);


        localStorage.setItem(
            "lastGame",
            "Aim Challenge"
        );

        localStorage.setItem(
            "lastScore",
            savedBestScore
        );


        submittedScore.textContent =
            savedBestScore;


        if (savedBestScore === score) {

            scoreResultStatus.textContent =
                "NEW BEST SCORE";

            scoreResultMessage.textContent =
                "Your score has been added to the GAMECORE leaderboard.";

        } else {

            scoreResultStatus.textContent =
                "BEST SCORE RETAINED";

            scoreResultMessage.textContent =
                "Your submitted score was lower, so your existing best score remains on the leaderboard.";
        }


        gameOverOverlay.classList.add(
            "hidden"
        );


        scoreResultModal.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Score submission failed:",
            error
        );


        alert(
            "Unable to submit score. Please make sure the backend is running."
        );

    } finally {

        submitBtn.disabled = false;

        submitBtn.textContent =
            "SUBMIT SCORE";
    }
}


// =========================================
// BUTTON EVENTS
// =========================================

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


submitBtn.addEventListener(
    "click",
    submitScore
);


// =========================================
// RESULT MODAL BUTTONS
// =========================================

viewLeaderboardBtn.addEventListener(
    "click",
    function() {

        window.location.href =
            "../../leaderboard.html";

    }
);


closeResultBtn.addEventListener(
    "click",
    function() {

        scoreResultModal.classList.add(
            "hidden"
        );

        gameOverOverlay.classList.remove(
            "hidden"
        );

    }
);


// =========================================
// KEYBOARD SUPPORT
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" &&
            !gameRunning &&
            scoreResultModal.classList.contains("hidden")
        ) {

            event.preventDefault();

            startGame();
        }

    }
);


// =========================================
// INITIAL DRAW
// =========================================

drawBackground();

gameLoop();