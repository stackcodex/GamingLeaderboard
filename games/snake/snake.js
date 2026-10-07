/* =========================================
   SNAKE RUSH
========================================= */

const canvas =
    document.getElementById("snakeCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================
   GAME SETTINGS
========================================= */

const gridSize = 20;

const tileSize =
    canvas.width / gridSize;

let snake;

let food;

let direction;

let nextDirection;

let score = 0;

let highScore =
    Number(
        localStorage.getItem(
            "snakeHighScore"
        )
    ) || 0;

let gameRunning = false;

let gameLoop;

let speed = 115;


/* =========================================
   API
========================================= */

const API_URL =
    "http://localhost:8081/api/scores";

const GAME_ID = 1;


/* =========================================
   ELEMENTS
========================================= */

const scoreDisplay =
    document.getElementById("score");

const highScoreDisplay =
    document.getElementById("highScore");

const lengthDisplay =
    document.getElementById("length");

const statusDisplay =
    document.getElementById("gameStatus");

const startOverlay =
    document.getElementById("startOverlay");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const submitScoreBtn =
    document.getElementById("submitScoreBtn");

const finalScore =
    document.getElementById("finalScore");

const newRecord =
    document.getElementById("newRecord");


/* =========================================
   SCORE RESULT MODAL ELEMENTS
========================================= */

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
   INITIAL DISPLAY
========================================= */

highScoreDisplay.textContent =
    highScore.toLocaleString();


/* =========================================
   INITIALIZE GAME
========================================= */

function initializeGame() {

    snake = [

        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }

    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;

    speed = 115;

    createFood();

    updateUI();

    draw();
}


/* =========================================
   FOOD
========================================= */

function createFood() {

    let valid = false;

    while (!valid) {

        food = {

            x: Math.floor(
                Math.random() * gridSize
            ),

            y: Math.floor(
                Math.random() * gridSize
            )

        };

        valid =
            !snake.some(
                segment =>
                    segment.x === food.x &&
                    segment.y === food.y
            );
    }
}


/* =========================================
   DRAW
========================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawFood();

    snake.forEach(
        (segment, index) => {

            drawSnakeSegment(
                segment,
                index
            );

        }
    );
}


/* =========================================
   DRAW FOOD
========================================= */

function drawFood() {

    const x =
        food.x * tileSize;

    const y =
        food.y * tileSize;

    const centerX =
        x + tileSize / 2;

    const centerY =
        y + tileSize / 2;


    ctx.shadowColor =
        "#FFD166";

    ctx.shadowBlur = 20;


    ctx.fillStyle =
        "#FFD166";

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        tileSize * 0.28,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "#FFF1B0";

    ctx.beginPath();

    ctx.arc(
        centerX - 3,
        centerY - 3,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =========================================
   DRAW SNAKE
========================================= */

function drawSnakeSegment(
    segment,
    index
) {

    const padding = 2;

    const x =
        segment.x * tileSize + padding;

    const y =
        segment.y * tileSize + padding;

    const size =
        tileSize - padding * 2;


    ctx.shadowColor =
        "#5CFF8A";

    ctx.shadowBlur =
        index === 0 ? 15 : 7;


    if (index === 0) {

        ctx.fillStyle =
            "#5CFF8A";

    } else {

        ctx.fillStyle =
            index % 2 === 0
                ? "#2ecc71"
                : "#3ee77e";
    }


    roundRect(
        ctx,
        x,
        y,
        size,
        size,
        5
    );

    ctx.fill();

    ctx.shadowBlur = 0;


    /* HEAD */

    if (index === 0) {

        ctx.fillStyle =
            "#07120b";

        if (direction.x !== 0) {

            const eyeX =
                x +
                (
                    direction.x > 0
                        ? size * 0.68
                        : size * 0.25
                );

            ctx.beginPath();

            ctx.arc(
                eyeX,
                y + size * 0.32,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.arc(
                eyeX,
                y + size * 0.68,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

        } else {

            const eyeY =
                y +
                (
                    direction.y > 0
                        ? size * 0.68
                        : size * 0.25
                );

            ctx.beginPath();

            ctx.arc(
                x + size * 0.32,
                eyeY,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.arc(
                x + size * 0.68,
                eyeY,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


/* =========================================
   ROUNDED RECT
========================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.beginPath();

    context.roundRect(
        x,
        y,
        width,
        height,
        radius
    );
}


/* =========================================
   GAME UPDATE
========================================= */

function updateGame() {

    direction =
        nextDirection;


    const head = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    /* WALL COLLISION */

    if (

        head.x < 0 ||

        head.x >= gridSize ||

        head.y < 0 ||

        head.y >= gridSize

    ) {

        endGame();

        return;
    }


    /* SELF COLLISION */

    if (

        snake.some(
            segment =>
                segment.x === head.x &&
                segment.y === head.y
        )

    ) {

        endGame();

        return;
    }


    snake.unshift(head);


    /* FOOD */

    if (

        head.x === food.x &&
        head.y === food.y

    ) {

        score += 100;

        createFood();


        /* Increase difficulty */

        if (speed > 60) {

            speed -= 3;

            clearInterval(gameLoop);

            gameLoop =
                setInterval(
                    updateGame,
                    speed
                );
        }

    } else {

        snake.pop();

    }


    updateUI();

    draw();
}


/* =========================================
   START GAME
========================================= */

function startGame() {

    clearInterval(gameLoop);

    initializeGame();

    gameRunning = true;

    startOverlay.classList.add(
        "hidden"
    );

    gameOverOverlay.classList.add(
        "hidden"
    );

    scoreResultModal.classList.add(
        "hidden"
    );

    statusDisplay.textContent =
        "PLAYING";

    submitScoreBtn.disabled = false;

    submitScoreBtn.textContent =
        "SUBMIT SCORE";

    gameLoop =
        setInterval(
            updateGame,
            speed
        );
}


/* =========================================
   END GAME
========================================= */

function endGame() {

    gameRunning = false;

    clearInterval(gameLoop);

    finalScore.textContent =
        score.toLocaleString();

    statusDisplay.textContent =
        "GAME OVER";


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "snakeHighScore",
            highScore
        );

        highScoreDisplay.textContent =
            highScore.toLocaleString();

        newRecord.textContent =
            "NEW HIGH SCORE! You reached the top.";

    } else {

        newRecord.textContent =
            "Keep pushing your limits.";

    }


    gameOverOverlay.classList.remove(
        "hidden"
    );
}


/* =========================================
   UI
========================================= */

function updateUI() {

    scoreDisplay.textContent =
        score.toLocaleString();

    highScoreDisplay.textContent =
        highScore.toLocaleString();

    lengthDisplay.textContent =
        snake.length;
}


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "w",
                "a",
                "s",
                "d"
            ].includes(key)
        ) {

            event.preventDefault();
        }


        if (
            !gameRunning &&
            (
                key === "w" ||
                key === "a" ||
                key === "s" ||
                key === "d" ||
                key.startsWith("arrow")
            )
        ) {

            return;
        }


        /* UP */

        if (
            (
                key === "w" ||
                key === "arrowup"
            ) &&
            direction.y !== 1
        ) {

            nextDirection = {
                x: 0,
                y: -1
            };
        }


        /* DOWN */

        if (
            (
                key === "s" ||
                key === "arrowdown"
            ) &&
            direction.y !== -1
        ) {

            nextDirection = {
                x: 0,
                y: 1
            };
        }


        /* LEFT */

        if (
            (
                key === "a" ||
                key === "arrowleft"
            ) &&
            direction.x !== 1
        ) {

            nextDirection = {
                x: -1,
                y: 0
            };
        }


        /* RIGHT */

        if (
            (
                key === "d" ||
                key === "arrowright"
            ) &&
            direction.x !== -1
        ) {

            nextDirection = {
                x: 1,
                y: 0
            };
        }

    }
);


/* =========================================
   BUTTONS
========================================= */

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


/* =========================================
   SUBMIT SCORE TO GAMECORE
========================================= */

submitScoreBtn.addEventListener(
    "click",
    submitScore
);


async function submitScore() {

    /* Get logged-in user */

    const storedUser =
        localStorage.getItem(
            "gamecoreUser"
        );


    if (!storedUser) {

        alert(
            "Please sign in before submitting your score."
        );

        window.location.href =
            "../../login.html";

        return;
    }


    let user;

    try {

        user =
            JSON.parse(storedUser);

    } catch (error) {

        alert(
            "Unable to read your login session."
        );

        return;
    }


    if (!user.id) {

        alert(
            "User information is missing. Please login again."
        );

        return;
    }


    /* Prevent empty score */

    if (score <= 0) {

        alert(
            "Your score is 0. Play the game before submitting."
        );

        return;
    }


    /* Disable button */

    submitScoreBtn.disabled = true;

    submitScoreBtn.textContent =
        "SUBMITTING...";


    try {

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
                "Score submission failed."
            );
        }


        /*
         * Backend returns the saved best score.
         * Compare it with the score just submitted.
         */

        const savedBestScore =
            Number(result.score);


        /* Save last game */

        localStorage.setItem(
            "lastGame",
            "Snake Rush"
        );

        localStorage.setItem(
            "lastScore",
            score
        );


        /* Show result modal */

        submittedScore.textContent =
            score.toLocaleString();


        if (
            savedBestScore === score
        ) {

            scoreResultStatus.textContent =
                "NEW BEST SCORE";

            scoreResultMessage.textContent =
                "Excellent run! Your new best score has been saved to the GAMECORE leaderboard.";

        } else {

            scoreResultStatus.textContent =
                "BEST SCORE RETAINED";

            scoreResultMessage.textContent =
                `Your submitted score was ${score.toLocaleString()}, but your existing best of ${savedBestScore.toLocaleString()} remains on the leaderboard.`;
        }


        scoreResultModal.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Score submission error:",
            error
        );


        alert(
            "Unable to submit score. Make sure the GAMECORE server is running."
        );


        submitScoreBtn.disabled = false;

        submitScoreBtn.textContent =
            "SUBMIT SCORE";
    }

}


/* =========================================
   RESULT MODAL BUTTONS
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

        scoreResultModal.classList.add(
            "hidden"
        );

        gameOverOverlay.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   INITIAL DRAW
========================================= */

initializeGame();