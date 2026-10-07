/* =========================================
   BRICK BREAKER
========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const winOverlay = document.getElementById("winOverlay");

const finalScore = document.getElementById("finalScore");
const winScore = document.getElementById("winScore");

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


/* =========================================
   GAME VARIABLES
========================================= */

const paddle = {
    width: 120,
    height: 13,
    x: canvas.width / 2 - 60,
    speed: 8
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 70,
    radius: 8,
    dx: 4,
    dy: -4
};

let rightPressed = false;
let leftPressed = false;

let score = 0;
let lives = 3;
let level = 1;

let gameRunning = false;

let animationId;


/* =========================================
   HIGH SCORE
========================================= */

let highScore =
    Number(localStorage.getItem("brickBreakerHighScore")) || 0;

highScoreDisplay.textContent = highScore;


/* =========================================
   BRICKS
========================================= */

const brickRows = 5;
const brickColumns = 9;

const brickWidth = 72;
const brickHeight = 24;

const brickPadding = 10;

const brickOffsetTop = 50;

const brickOffsetLeft =
    (
        canvas.width -
        (
            brickColumns * brickWidth +
            (brickColumns - 1) * brickPadding
        )
    ) / 2;

let bricks = [];


function createBricks() {

    bricks = [];

    for (let row = 0; row < brickRows; row++) {

        bricks[row] = [];

        for (let col = 0; col < brickColumns; col++) {

            bricks[row][col] = {

                x:
                    brickOffsetLeft +
                    col * (brickWidth + brickPadding),

                y:
                    brickOffsetTop +
                    row * (brickHeight + brickPadding),

                alive: true,

                strength:
                    row < 2 ? 2 : 1
            };

        }

    }

}


/* =========================================
   DRAW BACKGROUND
========================================= */

function drawBackground() {

    ctx.fillStyle = "#08080d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Grid */

    ctx.strokeStyle =
        "rgba(91,140,255,0.035)";

    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, canvas.height);

        ctx.stroke();

    }

    for (let y = 0; y < canvas.height; y += 40) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(canvas.width, y);

        ctx.stroke();

    }

}


/* =========================================
   DRAW BRICKS
========================================= */

function drawBricks() {

    bricks.forEach(row => {

        row.forEach(brick => {

            if (!brick.alive) {
                return;
            }

            ctx.save();

            ctx.beginPath();

            ctx.roundRect(
                brick.x,
                brick.y,
                brickWidth,
                brickHeight,
                7
            );

            if (brick.strength === 2) {

                ctx.fillStyle = "#ff4fa3";

                ctx.shadowColor =
                    "rgba(255,79,163,0.45)";

            } else {

                ctx.fillStyle = "#5b8cff";

                ctx.shadowColor =
                    "rgba(91,140,255,0.4)";

            }

            ctx.shadowBlur = 12;

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                "rgba(255,255,255,0.15)";

            ctx.stroke();

            ctx.restore();

        });

    });

}


/* =========================================
   DRAW PADDLE
========================================= */

function drawPaddle() {

    ctx.save();

    ctx.beginPath();

    ctx.roundRect(
        paddle.x,
        canvas.height - 35,
        paddle.width,
        paddle.height,
        8
    );

    ctx.fillStyle = "#ffd166";

    ctx.shadowColor =
        "rgba(255,209,102,0.65)";

    ctx.shadowBlur = 18;

    ctx.fill();

    ctx.restore();

}


/* =========================================
   DRAW BALL
========================================= */

function drawBall() {

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#5cff8a";

    ctx.shadowColor =
        "rgba(92,255,138,0.8)";

    ctx.shadowBlur = 18;

    ctx.fill();

    ctx.restore();

}


/* =========================================
   MOVE PADDLE
========================================= */

function movePaddle() {

    if (
        rightPressed &&
        paddle.x < canvas.width - paddle.width
    ) {

        paddle.x += paddle.speed;

    }

    if (
        leftPressed &&
        paddle.x > 0
    ) {

        paddle.x -= paddle.speed;

    }

}


/* =========================================
   COLLISION
========================================= */

function collisionDetection() {

    for (let row = 0; row < bricks.length; row++) {

        for (let col = 0; col < bricks[row].length; col++) {

            const brick = bricks[row][col];

            if (!brick.alive) {
                continue;
            }

            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius <
                    brick.x + brickWidth &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius <
                    brick.y + brickHeight
            ) {

                ball.dy = -ball.dy;

                if (brick.strength === 2) {

                    brick.strength = 1;

                    score += 100;

                } else {

                    brick.alive = false;

                    score += 50;

                }

                updateStats();

                checkLevelComplete();

            }

        }

    }

}


/* =========================================
   LEVEL COMPLETE
========================================= */

function checkLevelComplete() {

    let remaining = 0;

    bricks.forEach(row => {

        row.forEach(brick => {

            if (brick.alive) {
                remaining++;
            }

        });

    });

    if (remaining === 0) {

        score += 500;

        level++;

        updateStats();

        if (level > 3) {

            winGame();

        } else {

            createBricks();

            resetBall();

        }

    }

}


/* =========================================
   BALL RESET
========================================= */

function resetBall() {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height - 70;

    const speed =
        4 + (level - 1) * 0.7;

    ball.dx =
        Math.random() > 0.5
            ? speed
            : -speed;

    ball.dy = -speed;

    paddle.x =
        canvas.width / 2 -
        paddle.width / 2;

}


/* =========================================
   UPDATE BALL
========================================= */

function updateBall() {

    ball.x += ball.dx;

    ball.y += ball.dy;


    /* LEFT / RIGHT */

    if (
        ball.x + ball.radius >
            canvas.width ||
        ball.x - ball.radius < 0
    ) {

        ball.dx = -ball.dx;

    }


    /* TOP */

    if (
        ball.y - ball.radius < 0
    ) {

        ball.dy = -ball.dy;

    }


    /* PADDLE */

    const paddleY =
        canvas.height - 35;

    if (
        ball.y + ball.radius >= paddleY &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width &&
        ball.dy > 0
    ) {

        ball.dy = -Math.abs(ball.dy);

        const hitPosition =
            (
                ball.x -
                (paddle.x + paddle.width / 2)
            ) /
            (paddle.width / 2);

        ball.dx =
            hitPosition * 6;

    }


    /* BOTTOM */

    if (
        ball.y - ball.radius >
        canvas.height
    ) {

        lives--;

        updateStats();

        if (lives <= 0) {

            gameOver();

        } else {

            resetBall();

        }

    }

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    drawBackground();

    drawBricks();

    drawPaddle();

    drawBall();

    movePaddle();

    updateBall();

    collisionDetection();

    animationId =
        requestAnimationFrame(gameLoop);

}


/* =========================================
   START
========================================= */

function startGame() {

    startOverlay.classList.add("hidden");

    gameOverOverlay.classList.add("hidden");

    winOverlay.classList.add("hidden");

    scoreResultModal.classList.add("hidden");

    score = 0;

    lives = 3;

    level = 1;

    gameRunning = true;

    createBricks();

    resetBall();

    updateStats();

    cancelAnimationFrame(animationId);

    gameLoop();

}


/* =========================================
   RESTART
========================================= */

function restartGame() {

    cancelAnimationFrame(animationId);

    startGame();

}


/* =========================================
   GAME OVER
========================================= */

function gameOver() {

    gameRunning = false;

    cancelAnimationFrame(animationId);

    finalScore.textContent = score;

    saveHighScore();

    gameOverOverlay.classList.remove("hidden");

}


/* =========================================
   WIN
========================================= */

function winGame() {

    gameRunning = false;

    cancelAnimationFrame(animationId);

    winScore.textContent = score;

    saveHighScore();

    winOverlay.classList.remove("hidden");

}


/* =========================================
   HIGH SCORE
========================================= */

function saveHighScore() {

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "brickBreakerHighScore",
            highScore
        );

    }

    highScoreDisplay.textContent =
        highScore;

}


/* =========================================
   SUBMIT SCORE
========================================= */

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

        user = JSON.parse(userData);

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

    const GAME_ID = 3;


    try {

        const response =
            await fetch(
                `${API_URL}?userId=${user.id}&gameId=${GAME_ID}&score=${score}`,
                {
                    method: "POST"
                }
            );


        const resultText =
            await response.text();


        if (!response.ok) {

            throw new Error(resultText);

        }


        let result = null;

        try {

            result =
                JSON.parse(resultText);

        } catch (error) {

            result = null;

        }


        const savedBestScore =
            result && result.score !== undefined
                ? Number(result.score)
                : score;


        localStorage.setItem(
            "lastGame",
            "Brick Breaker"
        );

        localStorage.setItem(
            "lastScore",
            savedBestScore
        );


        /* UPDATE RESULT MODAL */

        submittedScore.textContent =
            savedBestScore;


        if (savedBestScore === score) {

            scoreResultStatus.textContent =
                "NEW BEST SCORE";

            scoreResultStatus.style.color =
                "#5cff8a";

            scoreResultMessage.textContent =
                "Your score has been added to the GAMECORE leaderboard.";

        } else {

            scoreResultStatus.textContent =
                "BEST SCORE RETAINED";

            scoreResultStatus.style.color =
                "#ffd166";

            scoreResultMessage.textContent =
                "Your submitted score was lower than your existing best score. Your best score remains on the leaderboard.";

        }


        gameOverOverlay.classList.add("hidden");

        winOverlay.classList.add("hidden");

        scoreResultModal.classList.remove("hidden");

    } catch (error) {

        console.error(
            "Score submission failed:",
            error
        );

        alert(
            "Unable to submit score. Please make sure the backend is running."
        );

    }

}


/* =========================================
   SCORE RESULT BUTTONS
========================================= */

viewLeaderboardBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "../../leaderboard.html";

    }
);


closeResultBtn.addEventListener(
    "click",
    () => {

        scoreResultModal.classList.add("hidden");

    }
);


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    scoreDisplay.textContent =
        score;

    livesDisplay.textContent =
        lives;

    levelDisplay.textContent =
        level;

    highScoreDisplay.textContent =
        highScore;

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            rightPressed = true;

        }

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            leftPressed = true;

        }

        if (event.code === "Space") {

            event.preventDefault();

            if (!gameRunning) {

                startGame();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            rightPressed = false;

        }

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            leftPressed = false;

        }

    }
);


/* =========================================
   INITIAL DRAW
========================================= */

createBricks();

drawBackground();

drawBricks();

drawPaddle();

drawBall();

updateStats();