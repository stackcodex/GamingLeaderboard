document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:8081/api/scores";

    const gameFilter = document.getElementById("gameFilter");
    const periodFilter = document.getElementById("periodFilter");
    const playerSearch = document.getElementById("playerSearch");
    const rankingList = document.querySelector(".ranking-list");

    let allScores = [];
    let currentScores = [];

    // GAME ID MAPPING
    const gameIds = {
        snake: 1,
        memory: 2,
        brick: 3,
        aim: 4,
        space: 5,
        racer: 6,
        penalty: 7,
        boxing: 8,
        puzzle: 9,
        archery: 10
    };


    // ==============================
    // LOAD GLOBAL LEADERBOARD
    // ==============================

    async function loadLeaderboard() {

        try {

            showLoadingState();

            const response =
                await fetch(`${API_URL}/global`);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            allScores =
                Array.isArray(data) ? data : [];

            console.log("Leaderboard data:", allScores);

            currentScores = [...allScores];

            renderLeaderboard(currentScores);

        } catch (error) {

            console.error(
                "Leaderboard loading error:",
                error
            );

            showFilterMessage(
                "Unable to load leaderboard"
            );
        }
    }


    // ==============================
    // RENDER LEADERBOARD
    // ==============================

    function renderLeaderboard(scores) {

        const sortedScores =
            [...scores].sort(
                (a, b) =>
                    Number(b.score) - Number(a.score)
            );

        currentScores = sortedScores;

        updatePodium(sortedScores);

        updateRankingTable(sortedScores);

        updateStatistics(sortedScores);

        updateCurrentUser(sortedScores);

        applySearch();
    }


    // ==============================
    // PODIUM
    // ==============================

    function updatePodium(scores) {

        const podium =
            document.querySelector(".podium");

        if (!podium) return;

        const second =
            podium.querySelector(".podium-player.second");

        const first =
            podium.querySelector(".podium-player.first");

        const third =
            podium.querySelector(".podium-player.third");


        updatePodiumPlayer(
            first,
            scores[0],
            "01"
        );

        updatePodiumPlayer(
            second,
            scores[1],
            "02"
        );

        updatePodiumPlayer(
            third,
            scores[2],
            "03"
        );
    }


    function updatePodiumPlayer(
        element,
        player,
        rank
    ) {

        if (!element) return;

        const name =
            element.querySelector(".player-name");

        const score =
            element.querySelector(".score-value");

        const rankNumber =
            element.querySelector(".rank-number");

        const blockNumber =
            element.querySelector(".podium-block span");


        if (!player) {

            if (name)
                name.textContent = "---";

            if (score)
                score.innerHTML = "0 <small>PTS</small>";

            if (rankNumber)
                rankNumber.textContent = rank;

            if (blockNumber)
                blockNumber.textContent = rank;

            element.style.opacity = "0.4";

            return;
        }


        if (name) {

            name.textContent =
                player.username || "PLAYER";
        }


        if (score) {

            score.innerHTML =
                `${Number(player.score).toLocaleString()}
                <small>PTS</small>`;
        }


        if (rankNumber)
            rankNumber.textContent = rank;


        if (blockNumber)
            blockNumber.textContent = rank;


        element.style.opacity = "1";

        element.dataset.player =
            player.username || "";
    }


    // ==============================
    // RANKING TABLE
    // ==============================

    function updateRankingTable(scores) {

        if (!rankingList) return;

        rankingList.innerHTML = "";


        scores.forEach((player, index) => {

            const row =
                createPlayerRow(
                    player,
                    index + 1
                );

            rankingList.appendChild(row);
        });


        attachRowEvents();
    }


    // ==============================
    // CREATE PLAYER ROW
    // ==============================

    function createPlayerRow(
        player,
        rank
    ) {

        const row =
            document.createElement("div");

        row.className = "player-row";

        row.dataset.player =
            (player.username || "")
                .toLowerCase();


        // MEDAL CLASS
        let medalClass = "";

        if (rank === 1)
            medalClass = "gold-medal";

        else if (rank === 2)
            medalClass = "silver-medal";

        else if (rank === 3)
            medalClass = "bronze-medal";


        // PLAYER TITLE
        let playerTitle =
            "Challenger";

        if (rank === 1)
            playerTitle = "Champion";

        else if (rank === 2 || rank === 3)
            playerTitle = "Elite Player";


        // AVATAR CLASS
        const avatarClasses = [
            "avatar-gold",
            "avatar-blue",
            "avatar-pink",
            "avatar-purple",
            "avatar-orange",
            "avatar-green"
        ];

        const avatarClass =
            avatarClasses[
                (rank - 1) %
                avatarClasses.length
            ];


        // STATUS
        const statusInfo =
            getPlayerStatus(player);


       row.innerHTML = `

    <div class="rank-cell">

        ${
            rank <= 3

            ? `
            <span class="rank-medal ${medalClass}">
                ${String(rank).padStart(2, "0")}
            </span>
            `

            : `
            <span class="rank-number-small">
                ${String(rank).padStart(2, "0")}
            </span>
            `
        }

    </div>


    <div class="player-cell">

        <div class="mini-avatar ${avatarClass}">

            <span class="avatar-eye eye-left"></span>

            <span class="avatar-eye eye-right"></span>

            <span class="avatar-mask"></span>

        </div>


        <div class="player-info">

            <strong>
                ${escapeHtml(
                    player.username ||
                    "PLAYER"
                )}
            </strong>

            <span class="game-name">
                ${escapeHtml(
                    player.gameName ||
                    "Unknown Game"
                )}
            </span>

            <small>
                ${playerTitle}
                <span class="title-separator">•</span>
                LV.${calculateLevel(player.score)}
            </small>

        </div>

    </div>


    <div class="score-cell">

        ${Number(player.score)
            .toLocaleString()}

    </div>


    <div class="status-cell">

        <span class="${statusInfo.className}"></span>

        ${statusInfo.text}

    </div>

`;


        row.style.opacity = "1";

        row.style.transform =
            "translateX(0)";


        return row;
    }


    // ==============================
    // PLAYER STATUS
    // ==============================

    function getPlayerStatus(player) {

        /*
         * The current backend does not store
         * online/offline status.
         *
         * Therefore we determine a simple
         * status from recent score activity.
         */

        if (!player.achievedAt) {

            return {
                className: "offline-status",
                text: "OFFLINE"
            };
        }


        const achievedTime =
            new Date(player.achievedAt)
                .getTime();

        const currentTime =
            Date.now();

        const difference =
            currentTime - achievedTime;


        // Active within last 30 minutes
        if (
            difference >= 0 &&
            difference <=
                30 * 60 * 1000
        ) {

            return {
                className: "online-status",
                text: "ONLINE"
            };
        }


        // Active within last 24 hours
        if (
            difference >= 0 &&
            difference <=
                24 * 60 * 60 * 1000
        ) {

            return {
                className: "offline-status",
                text: "AWAY"
            };
        }


        return {
            className: "offline-status",
            text: "OFFLINE"
        };
    }


    // ==============================
    // LEVEL
    // ==============================

    function calculateLevel(score) {

        const value =
            Number(score) || 0;

        /*
         * Simple leaderboard level.
         * This is a display level because
         * the backend does not yet store levels.
         */

        if (value >= 90000)
            return 99;

        if (value >= 80000)
            return 90;

        if (value >= 70000)
            return 80;

        if (value >= 60000)
            return 70;

        if (value >= 50000)
            return 60;

        if (value >= 40000)
            return 50;

        if (value >= 30000)
            return 40;

        if (value >= 20000)
            return 30;

        if (value >= 10000)
            return 20;

        return 10;
    }


    // ==============================
    // STATISTICS
    // ==============================

    function updateStatistics(scores) {

        const uniquePlayers =
            new Set(
                scores.map(
                    player => player.userId
                )
            ).size;


        const totalScores =
            scores.length;


        const today =
            new Date();


        const activeToday =
            new Set(

                scores

                    .filter(player => {

                        if (!player.achievedAt)
                            return false;

                        const date =
                            new Date(
                                player.achievedAt
                            );

                        return (
                            date.getDate() ===
                                today.getDate() &&

                            date.getMonth() ===
                                today.getMonth() &&

                            date.getFullYear() ===
                                today.getFullYear()
                        );
                    })

                    .map(
                        player =>
                            player.userId
                    )

            ).size;


        const highestScore =
            scores.length
                ? Math.max(
                    ...scores.map(
                        player =>
                            Number(player.score)
                    )
                )
                : 0;


        const highestPlayer =
            scores.length
                ? [...scores].sort(
                    (a, b) =>
                        Number(b.score) -
                        Number(a.score)
                )[0]
                : null;


        const counters =
            document.querySelectorAll(
                ".counter"
            );


        if (counters[0]) {

            counters[0].dataset.value =
                uniquePlayers;

            animateCounter(
                counters[0],
                uniquePlayers
            );
        }


        if (counters[1]) {

            counters[1].dataset.value =
                totalScores;

            animateCounter(
                counters[1],
                totalScores
            );
        }


        if (counters[2]) {

            counters[2].dataset.value =
                activeToday;

            animateCounter(
                counters[2],
                activeToday
            );
        }


        const highScoreElement =
            document.querySelector(
                ".highlight-stat strong"
            );


        const highScoreName =
            document.querySelector(
                ".highlight-stat .stat-detail"
            );


        if (highScoreElement) {

            highScoreElement.textContent =
                highestScore.toLocaleString();
        }


        if (highScoreName) {

            highScoreName.textContent =
                highestPlayer
                    ? highestPlayer.username
                    : "---";
        }
    }


    // ==============================
    // CURRENT USER
    // ==============================

    function updateCurrentUser(scores) {

        const storedUser =
            localStorage.getItem(
                "gamecoreUser"
            );


        if (!storedUser) return;


        let user;

        try {

            user =
                JSON.parse(storedUser);

        } catch (error) {

            return;
        }


        /*
         * Current auth.js stores email.
         * If user ID is available, use it.
         * Otherwise use email if the API
         * eventually returns it.
         */

        let userScores = [];


        if (user.id) {

            userScores =
                scores.filter(
                    player =>
                        Number(player.userId) ===
                        Number(user.id)
                );

        }


        if (!userScores.length)
            return;


        const highestUserScore =
            Math.max(
                ...userScores.map(
                    player =>
                        Number(player.score)
                )
            );


        const sortedScores =
            [...scores].sort(
                (a, b) =>
                    Number(b.score) -
                    Number(a.score)
            );


        const rank =
            sortedScores.findIndex(
                player =>

                    Number(player.userId) ===
                        Number(user.id) &&

                    Number(player.score) ===
                        highestUserScore

            ) + 1;


        const rankElement =
            document.querySelector(
                ".your-rank-number"
            );


        const scoreElement =
            document.querySelector(
                ".your-score strong"
            );


        if (rankElement) {

            rankElement.textContent =
                `#${rank}`;
        }


        if (scoreElement) {

            scoreElement.textContent =
                highestUserScore
                    .toLocaleString();
        }
    }


    // ==============================
    // GAME FILTER
    // ==============================

    if (gameFilter) {

        gameFilter.addEventListener(
            "change",
            async () => {

                const selectedGame =
                    gameFilter.value;


                // ALL GAMES
                if (
                    selectedGame ===
                    "all"
                ) {

                    currentScores =
                        [...allScores];

                    applyPeriodFilter();

                    showFilterMessage(
                        "Showing all games"
                    );

                    return;
                }


                const gameId =
                    gameIds[selectedGame];


                if (!gameId)
                    return;


                try {

                    showLoadingState();


                    const response =
                        await fetch(
                            `${API_URL}/game/${gameId}`
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Server returned ${response.status}`
                        );
                    }


                    const data =
                        await response.json();


                    currentScores =
                        Array.isArray(data)
                            ? data
                            : [];


                    applyPeriodFilter();


                    showFilterMessage(
                        "Showing " +
                        getGameName(
                            selectedGame
                        )
                    );


                } catch (error) {

                    console.error(
                        "Game leaderboard error:",
                        error
                    );


                    showFilterMessage(
                        "Unable to load game leaderboard"
                    );
                }
            }
        );
    }


    // ==============================
    // PERIOD FILTER
    // ==============================

    if (periodFilter) {

        periodFilter.addEventListener(
            "change",
            () => {

                applyPeriodFilter();

            }
        );
    }


    function applyPeriodFilter() {

        const period =
            periodFilter
                ? periodFilter.value
                : "all";


        let filteredScores =
            [...currentScores];


        if (period !== "all") {

            const now =
                new Date();


            filteredScores =
                filteredScores.filter(
                    player => {

                        if (!player.achievedAt)
                            return false;


                        const date =
                            new Date(
                                player.achievedAt
                            );


                        if (
                            period ===
                            "today"
                        ) {

                            return (

                                date.getDate() ===
                                    now.getDate() &&

                                date.getMonth() ===
                                    now.getMonth() &&

                                date.getFullYear() ===
                                    now.getFullYear()
                            );
                        }


                        if (
                            period ===
                            "week"
                        ) {

                            const weekStart =
                                new Date(now);

                            weekStart.setHours(
                                0, 0, 0, 0
                            );


                            const day =
                                weekStart.getDay();


                            const difference =
                                day === 0
                                    ? 6
                                    : day - 1;


                            weekStart.setDate(
                                weekStart.getDate() -
                                difference
                            );


                            return (
                                date >=
                                weekStart
                            );
                        }


                        if (
                            period ===
                            "month"
                        ) {

                            return (

                                date.getMonth() ===
                                    now.getMonth() &&

                                date.getFullYear() ===
                                    now.getFullYear()
                            );
                        }


                        return true;
                    }
                );
        }


        renderLeaderboard(
            filteredScores
        );


        if (period !== "all") {

            showFilterMessage(
                getPeriodName(period)
            );
        }
    }


    // ==============================
    // SEARCH
    // ==============================

    if (playerSearch) {

        playerSearch.addEventListener(
            "input",
            () => {

                applySearch();

            }
        );
    }


    function applySearch() {

        const search =
            playerSearch
                ? playerSearch.value
                    .toLowerCase()
                    .trim()
                : "";


        const rows =
            document.querySelectorAll(
                ".player-row"
            );


        rows.forEach(row => {

            const player =
                (
                    row.dataset.player ||
                    ""
                ).toLowerCase();


            if (
                player.includes(search)
            ) {

                row.style.display =
                    "grid";

                setTimeout(() => {

                    row.style.opacity =
                        "1";

                    row.style.transform =
                        "translateX(0)";

                }, 20);

            } else {

                row.style.opacity =
                    "0";

                row.style.transform =
                    "translateX(-10px)";

                setTimeout(() => {

                    row.style.display =
                        "none";

                }, 200);
            }
        });
    }


    // ==============================
    // COUNTER ANIMATION
    // ==============================

    function animateCounter(
        counter,
        target
    ) {

        if (!counter) return;


        target =
            Number(target);


        if (
            !Number.isFinite(target)
        ) {

            target = 0;
        }


        let current = 0;


        const duration =
            900;


        const startTime =
            performance.now();


        function update(time) {

            const progress =
                Math.min(
                    (time - startTime) /
                    duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            current =
                Math.floor(
                    target * eased
                );


            counter.textContent =
                current.toLocaleString();


            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            } else {

                counter.textContent =
                    target.toLocaleString();
            }
        }


        requestAnimationFrame(
            update
        );
    }


    // ==============================
    // ROW EVENTS
    // ==============================

    function attachRowEvents() {

        const rows =
            document.querySelectorAll(
                ".player-row"
            );


        rows.forEach(row => {

            row.style.transition =
                "opacity .2s ease, transform .2s ease, box-shadow .25s ease";


            row.addEventListener(
                "mouseenter",
                () => {

                    row.style.boxShadow =
                        "inset 4px 0 0 var(--pink)";
                }
            );


            row.addEventListener(
                "mouseleave",
                () => {

                    row.style.boxShadow =
                        "none";
                }
            );


            row.addEventListener(
                "click",
                () => {

                    const player =
                        row.dataset.player;


                    if (!player)
                        return;


                    console.log(
                        "Selected player:",
                        player
                    );
                }
            );
        });
    }


    // ==============================
    // PODIUM HOVER
    // ==============================

    function attachPodiumEvents() {

        const players =
            document.querySelectorAll(
                ".podium-player"
            );


        players.forEach(player => {

            player.addEventListener(
                "mouseenter",
                () => {

                    player.style.transform =
                        "translateY(-10px)";
                }
            );


            player.addEventListener(
                "mouseleave",
                () => {

                    player.style.transform =
                        "translateY(0)";
                }
            );
        });
    }


    // ==============================
    // LOADING
    // ==============================

    function showLoadingState() {

        const rows =
            document.querySelectorAll(
                ".player-row"
            );


        rows.forEach(row => {

            row.style.opacity =
                "0.5";
        });
    }


    // ==============================
    // NOTIFICATION
    // ==============================

    function showFilterMessage(
        message
    ) {

        let notification =
            document.querySelector(
                ".filter-notification"
            );


        if (!notification) {

            notification =
                document.createElement(
                    "div"
                );


            notification.className =
                "filter-notification";


            document.body.appendChild(
                notification
            );
        }


        notification.textContent =
            message;


        notification.classList.add(
            "show"
        );


        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 1800);
    }


    // ==============================
    // GAME NAMES
    // ==============================

    function getGameName(
        game
    ) {

        const names = {

            snake: "Snake Rush",
            memory: "Memory Match",
            brick: "Brick Breaker",
            aim: "Aim Challenge",
            space: "Space Shooter",
            racer: "Speed Racer",
            penalty: "Penalty Pro",
            boxing: "Boxing Arena",
            puzzle: "Puzzle Quest",
            archery: "Archery Masters"

        };


        return (
            names[game] ||
            "Selected game"
        );
    }


    // ==============================
    // PERIOD NAMES
    // ==============================

    function getPeriodName(
        period
    ) {

        const names = {

            month: "Showing this month",
            week: "Showing this week",
            today: "Showing today"

        };


        return (
            names[period] ||
            "Showing all scores"
        );
    }


    // ==============================
    // BASIC HTML ESCAPE
    // ==============================

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


    // ==============================
    // INITIALIZE
    // ==============================

    attachPodiumEvents();

    loadLeaderboard();

    document.body.classList.add(
        "leaderboard-ready"
    );

});