document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       CONFIGURATION
    ========================================= */

    const API_URL = "http://localhost:8081/api/scores";


    /* =========================================
       DOM ELEMENTS
    ========================================= */

    const profileUsername =
        document.getElementById("profileUsername");

    const profileUserId =
        document.getElementById("profileUserId");

    const profileEmail =
        document.getElementById("profileEmail");

    const accountUsername =
        document.getElementById("accountUsername");

    const accountId =
        document.getElementById("accountId");

    const accountEmail =
        document.getElementById("accountEmail");

    const totalScore =
        document.getElementById("totalScore");

    const gamesPlayed =
        document.getElementById("gamesPlayed");

    const bestScore =
        document.getElementById("bestScore");

    const globalRank =
        document.getElementById("globalRank");

    const historyList =
        document.getElementById("historyList");

    const bestGamesList =
        document.getElementById("bestGamesList");

    const historyFilter =
        document.getElementById("historyFilter");

    const xpProgress =
        document.getElementById("xpProgress");

    const playerLevel =
        document.getElementById("playerLevel");

    const xpValue =
        document.getElementById("xpValue");

    const xpNext =
        document.getElementById("xpNext");

    const navAuthBtn =
        document.getElementById("navAuthBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogoutBtn =
        document.getElementById("cancelLogoutBtn");

    const confirmLogoutBtn =
        document.getElementById("confirmLogoutBtn");


    /* =========================================
       GAME ICON / COLOR HELPERS
    ========================================= */

    const gameStyles = {

        "Snake Rush": {
            initials: "SR",
            color: "gold"
        },

        "Memory Match": {
            initials: "MM",
            color: "purple"
        },

        "Brick Breaker": {
            initials: "BB",
            color: "pink"
        },

        "Aim Challenge": {
            initials: "AC",
            color: "green"
        },

        "Space Shooter": {
            initials: "SS",
            color: "blue"
        },

        "Speed Racer": {
            initials: "SR",
            color: "gold"
        },

        "Penalty Pro": {
            initials: "PP",
            color: "green"
        },

        "Boxing Arena": {
            initials: "BA",
            color: "pink"
        },

        "Puzzle Quest": {
            initials: "PQ",
            color: "purple"
        },

        "Archery Masters": {
            initials: "AM",
            color: "blue"
        }

    };


    /* =========================================
       READ LOGGED-IN USER
    ========================================= */

    let user = null;

    try {

        const storedUser =
            localStorage.getItem("gamecoreUser");

        if (storedUser) {

            user = JSON.parse(storedUser);

        }

    } catch (error) {

        console.error(
            "Unable to read gamecoreUser:",
            error
        );

    }


    /* =========================================
       AUTH GUARD
    ========================================= */

    if (
        !user ||
        !user.id ||
        !user.username ||
        !user.email ||
        user.loggedIn !== true
    ) {

        localStorage.removeItem("gamecoreUser");

        window.location.href = "login.html";

        return;
    }


    /* =========================================
       UPDATE USER INFORMATION
    ========================================= */

    function updateUserInformation() {

        profileUsername.textContent =
            user.username.toUpperCase();

        profileUserId.textContent =
            `ID: ${user.id}`;

        profileEmail.textContent =
            user.email;

        accountUsername.textContent =
            user.username;

        accountId.textContent =
            user.id;

        accountEmail.textContent =
            user.email;

        if (navAuthBtn) {

            navAuthBtn.textContent =
                user.username.toUpperCase();

            navAuthBtn.href =
                "profile.html";

        }

    }


    updateUserInformation();


    /* =========================================
       FETCH USER SCORES
    ========================================= */

    async function loadProfileData() {

        try {

            historyList.innerHTML = `
                <div class="empty-history">
                    Loading your GAMECORE scores...
                </div>
            `;

            bestGamesList.innerHTML = `
                <div class="empty-history">
                    Loading personal records...
                </div>
            `;


            const response = await fetch(
                `${API_URL}/user/${user.id}`
            );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const scores =
                await response.json();


            const validScores =
                Array.isArray(scores)
                    ? scores
                    : [];


            processProfileData(validScores);


            await loadGlobalRank(validScores);


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            historyList.innerHTML = `
                <div class="empty-history">
                    Unable to load score history.
                    <br>
                    Make sure the GAMECORE backend is running.
                </div>
            `;

            bestGamesList.innerHTML = `
                <div class="empty-history">
                    Unable to load personal records.
                </div>
            `;

            totalScore.textContent = "0";
            gamesPlayed.textContent = "0";
            bestScore.textContent = "0";
            globalRank.textContent = "--";

        }

    }


    /* =========================================
       PROCESS PROFILE DATA
    ========================================= */

    function processProfileData(scores) {

        const sortedScores =
            [...scores].sort(
                (a, b) => {

                    const dateA =
                        new Date(a.achievedAt || 0);

                    const dateB =
                        new Date(b.achievedAt || 0);

                    return dateB - dateA;

                }
            );


        /* =====================================
           TOTAL SCORE
        ===================================== */

        const total =
            scores.reduce(
                (sum, item) =>
                    sum + Number(item.score || 0),
                0
            );


        /* =====================================
           BEST SCORE
        ===================================== */

        const highest =
            scores.reduce(
                (max, item) =>
                    Math.max(
                        max,
                        Number(item.score || 0)
                    ),
                0
            );


        totalScore.textContent =
            total.toLocaleString();

        gamesPlayed.textContent =
            scores.length.toLocaleString();

        bestScore.textContent =
            highest.toLocaleString();


        /* =====================================
           XP / LEVEL
        ===================================== */

        updateLevel(total);


        /* =====================================
           HISTORY
        ===================================== */

        renderHistory(sortedScores);


        /* =====================================
           BEST SCORES PER GAME
        ===================================== */

        const bestByGame =
            getBestScoresByGame(scores);

        renderBestGames(bestByGame);


        /* =====================================
           FILTER OPTIONS
        ===================================== */

        populateFilter(bestByGame);


        /* =====================================
           ACHIEVEMENTS
        ===================================== */

        updateAchievements(
            scores,
            total,
            bestByGame
        );

    }


    /* =========================================
       LEVEL SYSTEM
    ========================================= */

    function updateLevel(totalScoreValue) {

        const XP_PER_LEVEL = 10000;

        const level =
            Math.max(
                1,
                Math.floor(
                    totalScoreValue /
                    XP_PER_LEVEL
                ) + 1
            );

        const currentXP =
            totalScoreValue %
            XP_PER_LEVEL;

        const nextLevelXP =
            XP_PER_LEVEL -
            currentXP;

        const percentage =
            Math.min(
                100,
                (currentXP /
                    XP_PER_LEVEL) *
                    100
            );


        playerLevel.textContent =
            `LEVEL ${level}`;

        xpValue.textContent =
            `${currentXP.toLocaleString()} / ${XP_PER_LEVEL.toLocaleString()} XP`;

        xpNext.textContent =
            `${nextLevelXP.toLocaleString()} XP needed to reach Level ${level + 1}`;

        setTimeout(() => {

            xpProgress.style.width =
                `${percentage}%`;

        }, 200);

    }


    /* =========================================
       SCORE HISTORY
    ========================================= */

    function renderHistory(scores) {

        if (!scores.length) {

            historyList.innerHTML = `
                <div class="empty-history">
                    You haven't submitted any scores yet.
                    <br>
                    Play a game to start your record.
                </div>
            `;

            return;
        }


        historyList.innerHTML =
            scores.map(
                (item, index) => {

                    const gameName =
                        item.gameName ||
                        "Unknown Game";

                    const style =
                        gameStyles[gameName] ||
                        {
                            initials:
                                gameName
                                    .substring(0, 2)
                                    .toUpperCase(),

                            color:
                                "gold"
                        };


                    return `
                        <div
                            class="history-row"
                            data-game="${escapeHtml(gameName)}"
                            style="animation-delay: ${index * 0.04}s;">

                            <div
                                class="history-game game-${style.color}">
                                ${style.initials}
                            </div>

                            <div class="history-details">

                                <strong>
                                    ${escapeHtml(gameName)}
                                </strong>

                                <span>
                                    ${formatDate(item.achievedAt)}
                                </span>

                            </div>

                            <div class="history-score">
                                +${Number(item.score || 0).toLocaleString()}
                            </div>

                        </div>
                    `;

                }
            ).join("");

    }


    /* =========================================
       BEST SCORES BY GAME
    ========================================= */

    function getBestScoresByGame(scores) {

        const bestScores = {};

        scores.forEach(item => {

            const gameName =
                item.gameName ||
                "Unknown Game";

            const score =
                Number(item.score || 0);


            if (
                !bestScores[gameName] ||
                score >
                Number(
                    bestScores[gameName].score
                )
            ) {

                bestScores[gameName] =
                    item;

            }

        });


        return Object.values(
            bestScores
        ).sort(
            (a, b) =>
                Number(b.score || 0) -
                Number(a.score || 0)
        );

    }


    /* =========================================
       BEST GAMES UI
    ========================================= */

    function renderBestGames(bestGames) {

        if (!bestGames.length) {

            bestGamesList.innerHTML = `
                <div class="empty-history">
                    No personal records yet.
                </div>
            `;

            return;
        }


        bestGamesList.innerHTML =
            bestGames.map(
                (item, index) => {

                    const gameName =
                        item.gameName ||
                        "Unknown Game";

                    const style =
                        gameStyles[gameName] ||
                        {
                            initials:
                                gameName
                                    .substring(0, 2)
                                    .toUpperCase(),

                            color:
                                "gold"
                        };


                    return `
                        <div
                            class="best-game"
                            style="animation-delay: ${index * 0.05}s;">

                            <div class="best-rank">
                                ${String(index + 1).padStart(2, "0")}
                            </div>

                            <div
                                class="best-game-icon ${style.color}">
                                ${style.initials}
                            </div>

                            <div class="best-game-info">

                                <strong>
                                    ${escapeHtml(gameName)}
                                </strong>

                                <span>
                                    Personal Best
                                </span>

                            </div>

                            <b>
                                ${Number(item.score || 0).toLocaleString()}
                            </b>

                        </div>
                    `;

                }
            ).join("");

    }


    /* =========================================
       FILTER
    ========================================= */

    function populateFilter(bestGames) {

        const currentValue =
            historyFilter.value;

        historyFilter.innerHTML = `
            <option value="all">
                All Games
            </option>
        `;


        const gameNames =
            bestGames
                .map(
                    item =>
                        item.gameName
                )
                .filter(Boolean)
                .sort();


        gameNames.forEach(gameName => {

            const option =
                document.createElement("option");

            option.value =
                gameName;

            option.textContent =
                gameName;

            historyFilter.appendChild(
                option
            );

        });


        historyFilter.value =
            gameNames.includes(currentValue)
                ? currentValue
                : "all";

    }


    /* =========================================
       HISTORY FILTER EVENT
    ========================================= */

    historyFilter.addEventListener(
        "change",
        () => {

            const selected =
                historyFilter.value;

            const rows =
                document.querySelectorAll(
                    ".history-row"
                );


            rows.forEach(row => {

                const gameName =
                    row.dataset.game;


                if (
                    selected === "all" ||
                    gameName === selected
                ) {

                    row.style.display =
                        "grid";

                } else {

                    row.style.display =
                        "none";

                }

            });

        }
    );


    /* =========================================
       GLOBAL RANK
    ========================================= */

    async function loadGlobalRank(
        userScores
    ) {

        try {

            const response =
                await fetch(
                    `${API_URL}/global`
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load global leaderboard"
                );

            }


            const globalScores =
                await response.json();


            if (
                !Array.isArray(
                    globalScores
                )
            ) {

                globalRank.textContent =
                    "--";

                return;

            }


            /*
             * Find each player's highest score.
             * Rank is based on their best submitted score.
             */

            const playerBestScores =
                {};


            globalScores.forEach(
                item => {

                    const playerId =
                        String(
                            item.userId
                        );

                    const score =
                        Number(
                            item.score || 0
                        );


                    if (
                        !playerBestScores[playerId] ||
                        score >
                        playerBestScores[playerId]
                    ) {

                        playerBestScores[playerId] =
                            score;

                    }

                }
            );


            const ranking =
                Object.entries(
                    playerBestScores
                )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );


            const position =
                ranking.findIndex(
                    entry =>
                        String(entry[0]) ===
                        String(user.id)
                );


            if (position !== -1) {

                globalRank.textContent =
                    `#${position + 1}`;

            } else if (
                userScores.length
            ) {

                globalRank.textContent =
                    "--";

            } else {

                globalRank.textContent =
                    "--";

            }

        } catch (error) {

            console.error(
                "Global rank error:",
                error
            );

            globalRank.textContent =
                "--";

        }

    }


    /* =========================================
       ACHIEVEMENTS
    ========================================= */

    function updateAchievements(
        scores,
        total,
        bestGames
    ) {

        let unlocked = 0;


        if (scores.length >= 1) {

            unlockAchievement(
                "achievementFirst"
            );

            unlocked++;

        }


        if (scores.length >= 5) {

            unlockAchievement(
                "achievementFive"
            );

            unlocked++;

        }


        if (scores.length >= 10) {

            unlockAchievement(
                "achievementTen"
            );

            unlocked++;

        }


        if (bestGames.length >= 5) {

            unlockAchievement(
                "achievementGames"
            );

            unlocked++;

        }


        if (total >= 10000) {

            unlockAchievement(
                "achievementTenK"
            );

            unlocked++;

        }


        if (total >= 50000) {

            unlockAchievement(
                "achievementFiftyK"
            );

            unlocked++;

        }


        const achievementCount =
            document.getElementById(
                "achievementCount"
            );


        if (achievementCount) {

            achievementCount.textContent =
                `${unlocked} / 6 UNLOCKED`;

        }

    }


    function unlockAchievement(id) {

        const element =
            document.getElementById(id);


        if (!element) return;


        element.classList.remove(
            "locked"
        );

        element.classList.add(
            "unlocked"
        );

    }


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                logoutModal.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (cancelLogoutBtn) {

        cancelLogoutBtn.addEventListener(
            "click",
            () => {

                logoutModal.classList.add(
                    "hidden"
                );

            }
        );

    }


    if (confirmLogoutBtn) {

        confirmLogoutBtn.addEventListener(
            "click",
            () => {

                /*
                 * Remove the current GAMECORE
                 * login session.
                 */

                localStorage.removeItem(
                    "gamecoreUser"
                );


                /*
                 * Remove optional game session
                 * information if it exists.
                 */

                localStorage.removeItem(
                    "lastGame"
                );

                localStorage.removeItem(
                    "lastScore"
                );


                window.location.href =
                    "login.html";

            }
        );

    }


    /* =========================================
       CLOSE MODAL WHEN CLICKING OUTSIDE
    ========================================= */

    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    logoutModal
                ) {

                    logoutModal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }


    /* =========================================
       ESCAPE KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                logoutModal &&
                !logoutModal.classList.contains(
                    "hidden"
                )
            ) {

                logoutModal.classList.add(
                    "hidden"
                );

            }

        }
    );


    /* =========================================
       DATE FORMATTER
    ========================================= */

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Date unavailable";

        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Date unavailable";

        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    /* =========================================
       BASIC HTML ESCAPE
    ========================================= */

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================
       START
    ========================================= */

    loadProfileData();

});