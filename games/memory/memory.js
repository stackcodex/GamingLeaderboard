/* =========================================
   MEMORY MATCH
========================================= */

const symbols = [
    "◆",
    "●",
    "▲",
    "★",
    "✦",
    "⬟",
    "✚",
    "⬢"
];

let cards = [];
let firstCard = null;
let secondCard = null;

let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let score = 0;

let timerInterval = null;
let seconds = 0;

let gameStarted = false;


/* =========================================
   DOM
========================================= */

const gameBoard =
    document.getElementById("gameBoard");

const scoreDisplay =
    document.getElementById("score");

const movesDisplay =
    document.getElementById("moves");

const matchedDisplay =
    document.getElementById("matched");

const timerDisplay =
    document.getElementById("timer");

const startOverlay =
    document.getElementById("startOverlay");

const winOverlay =
    document.getElementById("winOverlay");

const finalScore =
    document.getElementById("finalScore");

const finalMoves =
    document.getElementById("finalMoves");

const finalTime =
    document.getElementById("finalTime");


/* =========================================
   SCORE RESULT MODAL
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
   SHUFFLE
========================================= */

function shuffle(array) {

    return array.sort(
        () => Math.random() - 0.5
    );

}


/* =========================================
   CREATE BOARD
========================================= */

function createBoard() {

    gameBoard.innerHTML = "";

    const pairSymbols = [
        ...symbols,
        ...symbols
    ];

    cards = shuffle(pairSymbols);

    cards.forEach(
        (symbol, index) => {

            const card =
                document.createElement("div");

            card.classList.add(
                "memory-card"
            );

            card.dataset.symbol =
                symbol;

            card.dataset.index =
                index;

            card.innerHTML = `
                <div class="card-face card-back"></div>

                <div class="card-face card-front">
                    <span class="card-symbol">
                        ${symbol}
                    </span>
                </div>
            `;

            card.addEventListener(
                "click",
                () => flipCard(card)
            );

            gameBoard.appendChild(card);

        }
    );

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    gameStarted = true;

    startOverlay.classList.add(
        "hidden"
    );

    resetValues();

    createBoard();

    startTimer();

}


/* =========================================
   RESET VALUES
========================================= */

function resetValues() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    moves = 0;
    matchedPairs = 0;
    score = 0;

    seconds = 0;

    updateStats();

}


/* =========================================
   FLIP CARD
========================================= */

function flipCard(card) {

    if (!gameStarted) return;

    if (lockBoard) return;

    if (card === firstCard) return;

    if (
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add(
        "flipped"
    );

    if (!firstCard) {

        firstCard = card;

        return;

    }

    secondCard = card;

    moves++;

    updateStats();

    checkMatch();

}


/* =========================================
   CHECK MATCH
========================================= */

function checkMatch() {

    const isMatch =
        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;

    if (isMatch) {

        disableCards();

    } else {

        unflipCards();

    }

}


/* =========================================
   MATCH
========================================= */

function disableCards() {

    firstCard.classList.add(
        "matched"
    );

    secondCard.classList.add(
        "matched"
    );

    matchedPairs++;

    score += 100;

    updateStats();

    resetTurn();

    if (
        matchedPairs === symbols.length
    ) {

        finishGame();

    }

}


/* =========================================
   WRONG MATCH
========================================= */

function unflipCards() {

    lockBoard = true;

    score = Math.max(
        0,
        score - 10
    );

    updateStats();

    setTimeout(
        () => {

            firstCard.classList.remove(
                "flipped"
            );

            secondCard.classList.remove(
                "flipped"
            );

            resetTurn();

        },
        750
    );

}


/* =========================================
   RESET TURN
========================================= */

function resetTurn() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;

}


/* =========================================
   TIMER
========================================= */

function startTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval =
        setInterval(
            () => {

                seconds++;

                updateTimer();

            },
            1000
        );

}


function stopTimer() {

    clearInterval(
        timerInterval
    );

}


/* =========================================
   TIMER DISPLAY
========================================= */

function updateTimer() {

    const minutes =
        Math.floor(
            seconds / 60
        )
        .toString()
        .padStart(2, "0");

    const secs =
        (
            seconds % 60
        )
        .toString()
        .padStart(2, "0");

    timerDisplay.textContent =
        `${minutes}:${secs}`;

}


/* =========================================
   STATS
========================================= */

function updateStats() {

    scoreDisplay.textContent =
        score;

    movesDisplay.textContent =
        moves;

    matchedDisplay.textContent =
        `${matchedPairs} / ${symbols.length}`;

    updateTimer();

}


/* =========================================
   FINISH GAME
========================================= */

function finishGame() {

    gameStarted = false;

    stopTimer();

    /*
     * Time bonus:
     * Faster completion = higher bonus
     */

    const timeBonus =
        Math.max(
            0,
            1000 - seconds * 10
        );

    score += timeBonus;

    updateStats();

    finalScore.textContent =
        score;

    finalMoves.textContent =
        moves;

    finalTime.textContent =
        timerDisplay.textContent;

    setTimeout(
        () => {

            winOverlay.classList.remove(
                "hidden"
            );

        },
        600
    );

}


/* =========================================
   RESTART
========================================= */

function restartGame() {

    stopTimer();

    winOverlay.classList.add(
        "hidden"
    );

    startOverlay.classList.add(
        "hidden"
    );

    scoreResultModal.classList.add(
        "hidden"
    );

    gameStarted = true;

    resetValues();

    createBoard();

    startTimer();

}


/* =========================================
   SUBMIT SCORE
========================================= */

async function submitScore() {

    const userData =
        localStorage.getItem(
            "gamecoreUser"
        );


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
            "Unable to read your login session."
        );

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

    const GAME_ID = 2;


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
         */

        const savedBestScore =
            Number(result.score);


        localStorage.setItem(
            "lastGame",
            "Memory Match"
        );

        localStorage.setItem(
            "lastScore",
            score
        );


        /* Display submitted score */

        submittedScore.textContent =
            score.toLocaleString();


        /*
         * Determine result status.
         */

        if (
            savedBestScore === score
        ) {

            scoreResultStatus.textContent =
                "NEW BEST SCORE";

            scoreResultMessage.textContent =
                "Excellent memory! Your new best score has been saved to the GAMECORE leaderboard.";

        } else {

            scoreResultStatus.textContent =
                "BEST SCORE RETAINED";

            scoreResultMessage.textContent =
                `Your submitted score was ${score.toLocaleString()}, but your existing best of ${savedBestScore.toLocaleString()} remains on the leaderboard.`;

        }


        /*
         * Hide win overlay.
         */

        winOverlay.classList.add(
            "hidden"
        );


        /*
         * Show result modal.
         */

        scoreResultModal.classList.remove(
            "hidden"
        );

    }


    catch (error) {

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

        winOverlay.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   INITIAL BOARD
========================================= */

createBoard();