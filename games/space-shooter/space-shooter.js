/* =========================================
   SPACE SHOOTER
   GAMECORE
========================================= */

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");


// =========================================
// ELEMENTS
// =========================================

const scoreElement =
    document.getElementById("score");

const highScoreElement =
    document.getElementById("highScore");

const levelElement =
    document.getElementById("level");

const livesElement =
    document.getElementById("lives");

const startOverlay =
    document.getElementById("startOverlay");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const submitBtn =
    document.getElementById("submitBtn");

const finalScoreElement =
    document.getElementById("finalScore");

const finalLevelElement =
    document.getElementById("finalLevel");

const finalEnemiesElement =
    document.getElementById("finalEnemies");

const finalHighScoreElement =
    document.getElementById("finalHighScore");


// =========================================
// SCORE RESULT MODAL
// =========================================

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
// GAME STATE
// =========================================

let score = 0;
let lives = 3;
let level = 1;

let enemiesDestroyed = 0;

let gameRunning = false;

let animationId = null;

let enemyTimer = 0;
let enemySpawnRate = 75;

let levelProgress = 0;

let keys = {};

let stars = [];
let bullets = [];
let enemies = [];
let particles = [];
let explosions = [];


// =========================================
// HIGH SCORE
// =========================================

let highScore =
    Number(
        localStorage.getItem(
            "spaceShooterHighScore"
        )
    ) || 0;

highScoreElement.textContent = highScore;


// =========================================
// PLAYER
// =========================================

const player = {

    x: canvas.width / 2,

    y: canvas.height - 70,

    width: 42,

    height: 52,

    speed: 6,

    cooldown: 0,

    fireRate: 10,

    invincible: 0

};


// =========================================
// CREATE STARS
// =========================================

function createStars() {

    stars = [];

    for (let i = 0; i < 100; i++) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() * 2 + 0.5,

            speed:
                Math.random() * 1.5 + 0.3,

            alpha:
                Math.random() * 0.8 + 0.2

        });

    }
}


// =========================================
// DRAW STARS
// =========================================

function drawStars() {

    stars.forEach(star => {

        ctx.globalAlpha = star.alpha;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {

            star.y = 0;

            star.x =
                Math.random() *
                canvas.width;

        }

    });

    ctx.globalAlpha = 1;
}


// =========================================
// DRAW PLAYER SHIP
// =========================================

function drawPlayer() {

    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible / 5
        ) % 2 === 0
    ) {
        return;
    }

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    // Glow

    ctx.shadowBlur = 25;

    ctx.shadowColor = "#5b8cff";


    // Main ship

    ctx.beginPath();

    ctx.moveTo(0, -27);

    ctx.lineTo(22, 24);

    ctx.lineTo(0, 17);

    ctx.lineTo(-22, 24);

    ctx.closePath();

    ctx.fillStyle = "#5b8cff";

    ctx.fill();

    ctx.strokeStyle = "#b9c9ff";

    ctx.lineWidth = 2;

    ctx.stroke();


    // Cockpit

    ctx.shadowBlur = 10;

    ctx.shadowColor = "#5cff8a";

    ctx.beginPath();

    ctx.moveTo(0, -15);

    ctx.lineTo(8, 2);

    ctx.lineTo(0, 7);

    ctx.lineTo(-8, 2);

    ctx.closePath();

    ctx.fillStyle = "#5cff8a";

    ctx.fill();


    // Wings

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff4fa3";

    ctx.beginPath();

    ctx.moveTo(-15, 8);

    ctx.lineTo(-28, 20);

    ctx.lineTo(-13, 17);

    ctx.closePath();

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(15, 8);

    ctx.lineTo(28, 20);

    ctx.lineTo(13, 17);

    ctx.closePath();

    ctx.fill();


    // Engine flames

    const flame =
        12 +
        Math.random() * 10;

    ctx.shadowBlur = 15;

    ctx.shadowColor = "#ffd166";

    ctx.fillStyle = "#ffd166";

    ctx.beginPath();

    ctx.moveTo(-9, 20);

    ctx.lineTo(-4, 20 + flame);

    ctx.lineTo(0, 20);

    ctx.closePath();

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(9, 20);

    ctx.lineTo(4, 20 + flame);

    ctx.lineTo(0, 20);

    ctx.closePath();

    ctx.fill();

    ctx.restore();
}


// =========================================
// CREATE BULLET
// =========================================

function shoot() {

    if (
        player.cooldown > 0 ||
        !gameRunning
    ) {
        return;
    }

    bullets.push({

        x: player.x,

        y:
            player.y - 28,

        width: 4,

        height: 18,

        speed: 10

    });

    player.cooldown =
        player.fireRate;
}


// =========================================
// DRAW BULLETS
// =========================================

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.save();

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#5cff8a";

        ctx.fillStyle = "#5cff8a";

        ctx.fillRect(
            bullet.x - bullet.width / 2,
            bullet.y,
            bullet.width,
            bullet.height
        );

        ctx.restore();

    });
}


// =========================================
// UPDATE BULLETS
// =========================================

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.y -= bullet.speed;

    });

    bullets =
        bullets.filter(
            bullet =>
                bullet.y > -30
        );
}


// =========================================
// CREATE ENEMY
// =========================================

function createEnemy() {

    const size =
        25 +
        Math.random() * 15;

    const enemyType =
        Math.floor(
            Math.random() * 3
        );

    enemies.push({

        x:
            size +
            Math.random() *
            (canvas.width - size * 2),

        y:
            -size,

        width: size,

        height: size,

        speed:
            1.4 +
            Math.random() * 1.4 +
            level * 0.18,

        type: enemyType,

        rotation: 0

    });
}


// =========================================
// DRAW ENEMIES
// =========================================

function drawEnemies() {

    enemies.forEach(enemy => {

        ctx.save();

        ctx.translate(
            enemy.x,
            enemy.y
        );

        enemy.rotation += 0.02;

        ctx.rotate(
            Math.sin(enemy.rotation) * 0.1
        );

        let color;

        if (enemy.type === 0) {

            color = "#ff4fa3";

        } else if (enemy.type === 1) {

            color = "#ffd166";

        } else {

            color = "#5cff8a";

        }


        // Glow

        ctx.shadowBlur = 22;

        ctx.shadowColor = color;


        // Enemy body

        ctx.beginPath();

        ctx.moveTo(
            0,
            enemy.height
        );

        ctx.lineTo(
            -enemy.width,
            -enemy.height * 0.45
        );

        ctx.lineTo(
            0,
            -enemy.height * 0.1
        );

        ctx.lineTo(
            enemy.width,
            -enemy.height * 0.45
        );

        ctx.closePath();

        ctx.fillStyle = color;

        ctx.fill();


        // Center

        ctx.shadowBlur = 8;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            0,
            -2,
            enemy.width * 0.18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    });
}


// =========================================
// UPDATE ENEMIES
// =========================================

function updateEnemies() {

    enemies.forEach(enemy => {

        enemy.y += enemy.speed;

    });


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        if (
            enemies[i].y >
            canvas.height + 50
        ) {

            enemies.splice(i, 1);

            loseLife();

        }

    }
}


// =========================================
// COLLISION CHECK
// =========================================

function collision(a, b) {

    return (

        a.x - a.width / 2 < b.x + b.width &&

        a.x + a.width / 2 > b.x &&

        a.y - a.height / 2 < b.y + b.height &&

        a.y + a.height / 2 > b.y

    );
}


// =========================================
// BULLET COLLISIONS
// =========================================

function checkBulletCollisions() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet = bullets[i];

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy = enemies[j];

            if (
                collision(
                    {
                        x: bullet.x,
                        y: bullet.y,
                        width: bullet.width,
                        height: bullet.height
                    },
                    {
                        x:
                            enemy.x -
                            enemy.width / 2,

                        y:
                            enemy.y -
                            enemy.height / 2,

                        width:
                            enemy.width,

                        height:
                            enemy.height
                    }
                )
            ) {

                createExplosion(
                    enemy.x,
                    enemy.y
                );

                bullets.splice(i, 1);

                enemies.splice(j, 1);

                score += 100;

                enemiesDestroyed++;

                levelProgress++;

                updateStats();

                flashScore();

                checkLevel();

                break;
            }

        }

    }
}


// =========================================
// PLAYER COLLISIONS
// =========================================

function checkPlayerCollisions() {

    if (player.invincible > 0) {
        return;
    }

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy = enemies[i];

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.y -
            enemy.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            enemy.width + 20
        ) {

            createExplosion(
                enemy.x,
                enemy.y
            );

            enemies.splice(i, 1);

            loseLife();

            break;
        }

    }
}


// =========================================
// LOSE LIFE
// =========================================

function loseLife() {

    if (!gameRunning) {
        return;
    }

    lives--;

    player.invincible = 120;

    updateStats();

    if (lives <= 0) {
        endGame();
    }
}


// =========================================
// LEVEL SYSTEM
// =========================================

function checkLevel() {

    const required =
        8 +
        level * 3;

    if (
        levelProgress >= required
    ) {

        level++;

        levelProgress = 0;

        score += 250;

        enemySpawnRate =
            Math.max(
                28,
                enemySpawnRate - 8
            );

        updateStats();

    }
}


// =========================================
// PARTICLES
// =========================================

function createExplosion(x, y) {

    explosions.push({

        x: x,

        y: y,

        radius: 5,

        maxRadius: 45,

        life: 1

    });

    for (
        let i = 0;
        i < 16;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) * 7,

            vy:
                (Math.random() - 0.5) * 7,

            size:
                Math.random() * 3 + 1,

            life: 1,

            color:
                Math.random() > 0.5
                    ? "#ffd166"
                    : "#ff4fa3"

        });

    }
}


// =========================================
// UPDATE PARTICLES
// =========================================

function updateParticles() {

    particles.forEach(
        particle => {

            particle.x += particle.vx;

            particle.y += particle.vy;

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


    explosions.forEach(
        explosion => {

            explosion.radius += 2.5;

            explosion.life -= 0.06;

        }
    );

    explosions =
        explosions.filter(
            explosion =>
                explosion.life > 0
        );
}


// =========================================
// DRAW PARTICLES
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


    explosions.forEach(
        explosion => {

            ctx.globalAlpha =
                explosion.life;

            ctx.beginPath();

            ctx.arc(
                explosion.x,
                explosion.y,
                explosion.radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "#ffd166";

            ctx.lineWidth = 3;

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                "#ff4fa3";

            ctx.stroke();

        }
    );

    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}


// =========================================
// UPDATE PLAYER
// =========================================

function updatePlayer() {

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -= player.speed;

    }


    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x += player.speed;

    }


    if (
        keys["ArrowUp"] ||
        keys["w"] ||
        keys["W"]
    ) {

        player.y -= player.speed;

    }


    if (
        keys["ArrowDown"] ||
        keys["s"] ||
        keys["S"]
    ) {

        player.y += player.speed;

    }


    const halfWidth =
        player.width / 2;

    const halfHeight =
        player.height / 2;


    player.x =
        Math.max(
            halfWidth,
            Math.min(
                canvas.width - halfWidth,
                player.x
            )
        );


    player.y =
        Math.max(
            halfHeight,
            Math.min(
                canvas.height - halfHeight,
                player.y
            )
        );


    // Shooting

    if (
        keys[" "] ||
        keys["Space"]
    ) {

        shoot();

    }


    if (player.cooldown > 0) {
        player.cooldown--;
    }


    if (player.invincible > 0) {
        player.invincible--;
    }
}


// =========================================
// SPAWN ENEMIES
// =========================================

function spawnEnemies() {

    enemyTimer++;

    if (
        enemyTimer >=
        enemySpawnRate
    ) {

        createEnemy();

        enemyTimer = 0;


        if (
            level >= 3 &&
            Math.random() < 0.18
        ) {

            createEnemy();

        }

    }
}


// =========================================
// UPDATE STATS
// =========================================

function updateStats() {

    scoreElement.textContent =
        score;

    highScoreElement.textContent =
        highScore;

    levelElement.textContent =
        level;

    livesElement.textContent =
        lives;
}


// =========================================
// SCORE FLASH
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
// DRAW BACKGROUND
// =========================================

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#03040a"
    );

    gradient.addColorStop(
        0.5,
        "#090b15"
    );

    gradient.addColorStop(
        1,
        "#03040a"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Subtle grid

    ctx.strokeStyle =
        "rgba(91,140,255,0.025)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }
}


// =========================================
// GAME LOOP
// =========================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    drawBackground();

    drawStars();

    updatePlayer();

    spawnEnemies();

    updateBullets();

    updateEnemies();

    checkBulletCollisions();

    checkPlayerCollisions();

    updateParticles();

    drawParticles();

    drawBullets();

    drawEnemies();

    drawPlayer();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// =========================================
// START GAME
// =========================================

function startGame() {

    score = 0;

    lives = 3;

    level = 1;

    enemiesDestroyed = 0;

    enemyTimer = 0;

    levelProgress = 0;

    enemySpawnRate = 75;

    bullets = [];

    enemies = [];

    particles = [];

    explosions = [];

    gameRunning = true;


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height - 70;

    player.cooldown = 0;

    player.invincible = 0;


    updateStats();


    startOverlay.classList.add(
        "hidden"
    );

    gameOverOverlay.classList.add(
        "hidden"
    );

    scoreResultModal.classList.add(
        "hidden"
    );


    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

    }

    gameLoop();
}


// =========================================
// END GAME
// =========================================

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;


    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;

    }


    // Local high score

    if (
        score >
        highScore
    ) {

        highScore = score;

        localStorage.setItem(
            "spaceShooterHighScore",
            highScore
        );

    }


    highScoreElement.textContent =
        highScore;

    finalScoreElement.textContent =
        score;

    finalLevelElement.textContent =
        level;

    finalEnemiesElement.textContent =
        enemiesDestroyed;

    finalHighScoreElement.textContent =
        highScore;


    gameOverOverlay.classList.remove(
        "hidden"
    );
}


// =========================================
// SUBMIT SCORE
// =========================================

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
            "User information is invalid. Please login again."
        );

        localStorage.removeItem(
            "gamecoreUser"
        );

        window.location.href =
            "../../login.html";

        return;
    }


    if (!user || !user.id) {

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

    const GAME_ID = 5;


    try {

        const response =
            await fetch(
                `${API_URL}?userId=${user.id}&gameId=${GAME_ID}&score=${score}`,
                {
                    method: "POST"
                }
            );


        const responseText =
            await response.text();


        let result = {};

        try {

            result =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        } catch (error) {

            result = {
                message: responseText
            };

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Score submission failed."
            );

        }


        const savedBestScore =
            Number(
                result.score ?? score
            );


        localStorage.setItem(
            "lastGame",
            "Space Shooter"
        );

        localStorage.setItem(
            "lastScore",
            savedBestScore
        );


        submittedScore.textContent =
            savedBestScore;


        if (
            savedBestScore === score
        ) {

            scoreResultStatus.textContent =
                "NEW BEST SCORE";

            scoreResultMessage.textContent =
                "Your score has been added to the GAMECORE leaderboard.";

        } else {

            scoreResultStatus.textContent =
                "BEST SCORE RETAINED";

            scoreResultMessage.textContent =
                "Your previous higher score remains on the GAMECORE leaderboard.";

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

    }
}


// =========================================
// KEYBOARD EVENTS
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        keys[event.key] = true;


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            keys[" "] = true;

            keys["Space"] = true;

        }


        // Start with Enter

        if (
            event.code === "Enter" &&
            !gameRunning
        ) {

            if (
                !startOverlay.classList.contains(
                    "hidden"
                )
            ) {

                startGame();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;


        if (
            event.code === "Space"
        ) {

            keys[" "] = false;

            keys["Space"] = false;

        }

    }
);


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
// SCORE RESULT ACTIONS
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
// INITIALIZE
// =========================================

createStars();

drawBackground();

drawStars();

drawPlayer();