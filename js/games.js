document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       GAME FILTERS
    ================================= */

    const filters =
        document.querySelectorAll(".game-filter");

    const games =
        document.querySelectorAll(".game-tile");

    const searchInput =
        document.getElementById("gameSearch");

    let currentFilter = "all";


    filters.forEach(filter => {

        filter.addEventListener("click", () => {

            filters.forEach(item => {
                item.classList.remove("active");
            });

            filter.classList.add("active");

            currentFilter =
                filter.dataset.filter;

            filterGames();

        });

    });


    /* =================================
       SEARCH
    ================================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterGames
        );

    }


    function filterGames() {

        const search =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";

        games.forEach(game => {

            const category =
                game.dataset.category;

            const name =
                game.dataset.name;

            const matchesFilter =
                currentFilter === "all" ||
                category === currentFilter;

            const matchesSearch =
                name.includes(search);

            if (
                matchesFilter &&
                matchesSearch
            ) {

                game.style.display = "";

                setTimeout(() => {

                    game.style.opacity = "1";

                    game.style.transform = "";

                }, 10);

            } else {

                game.style.opacity = "0";

                game.style.transform =
                    "scale(.95)";

                setTimeout(() => {

                    game.style.display = "none";

                }, 250);

            }

        });

    }


    /* =================================
       SCORE ENTRY MODAL
    ================================= */

    const modal =
        document.getElementById("scoreModal");

    const modalClose =
        document.getElementById("modalClose");

    const modalGameName =
        document.getElementById("modalGameName");

    const scoreInput =
        document.getElementById("scoreInput");

    const scoreForm =
        document.getElementById("scoreForm");

    const submitButtons =
        document.querySelectorAll(".score-submit");


    submitButtons.forEach(button => {

        button.addEventListener("click", () => {

            const gameName =
                button.dataset.game;

            modalGameName.textContent =
                gameName;

            modal.classList.add("show");

            setTimeout(() => {

                scoreInput.focus();

            }, 200);

        });

    });


    /* =================================
       SUCCESS MODAL
    ================================= */

    const successModal =
        document.getElementById(
            "scoreSuccessModal"
        );

    const successClose =
        document.getElementById(
            "successClose"
        );

    const successDone =
        document.getElementById(
            "successDone"
        );

    const successGameName =
        document.getElementById(
            "successGameName"
        );

    const successScore =
        document.getElementById(
            "successScore"
        );

    const scoreStatus =
        document.getElementById(
            "scoreStatus"
        );

    const successMessage =
        document.getElementById(
            "successMessage"
        );


    /* =================================
       CLOSE INPUT MODAL
    ================================= */

    function closeModal() {

        modal.classList.remove("show");

        scoreInput.value = "";

    }


    modalClose.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    /* =================================
       CLOSE SUCCESS MODAL
    ================================= */

    function closeSuccessModal() {

        successModal.classList.remove(
            "show"
        );

    }


    successClose.addEventListener(
        "click",
        closeSuccessModal
    );


    successDone.addEventListener(
        "click",
        closeSuccessModal
    );


    successModal.addEventListener(
        "click",
        event => {

            if (
                event.target === successModal
            ) {

                closeSuccessModal();

            }

        }
    );


    /* =================================
       SCORE SUBMISSION
    ================================= */

    scoreForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const game =
                modalGameName.textContent.trim();

            const score =
                Number(scoreInput.value);


            /* VALIDATE */

            if (
                scoreInput.value === "" ||
                !Number.isFinite(score) ||
                score < 0
            ) {

                scoreInput.focus();

                return;

            }


            /* GAME IDS */

            const gameIds = {

                "Speed Racer": 6,

                "Penalty Pro": 7,

                "Boxing Arena": 8,

                "Puzzle Quest": 9,

                "Archery Masters": 10

            };


            const gameId =
                gameIds[game];


            if (!gameId) {

                return;

            }


            /* LOGIN CHECK */

            const userData =
                localStorage.getItem(
                    "gamecoreUser"
                );


            if (!userData) {

                alert(
                    "Please login before submitting your score."
                );

                window.location.href =
                    "login.html";

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
                    "login.html";

                return;

            }


            if (!user.id) {

                alert(
                    "User information not found. Please login again."
                );

                window.location.href =
                    "login.html";

                return;

            }


            /* DISABLE BUTTON */

            const submitButton =
                scoreForm.querySelector(
                    ".modal-submit"
                );

            submitButton.disabled = true;

            submitButton.textContent =
                "SUBMITTING...";


            /* BACKEND */

            try {

                const response =
                    await fetch(
                        `http://localhost:8081/api/scores?userId=${user.id}&gameId=${gameId}&score=${score}`,
                        {
                            method: "POST"
                        }
                    );


                const result =
                    await response.text();


                if (!response.ok) {

                    throw new Error(result);

                }


                /*
                 * Backend returns the existing
                 * best score when submitted score
                 * is lower.
                 */

                let savedScore = score;

                try {

                    const responseData =
                        JSON.parse(result);

                    if (
                        responseData.score !== undefined
                    ) {

                        savedScore =
                            Number(
                                responseData.score
                            );

                    }

                } catch (error) {

                    /*
                     * Response may be plain text.
                     * Keep submitted score.
                     */

                }


                /* CLOSE INPUT MODAL */

                closeModal();


                /* SHOW SUCCESS MODAL */

                successGameName.textContent =
                    game;

                successScore.textContent =
                    savedScore.toLocaleString();


                if (
                    savedScore > score
                ) {

                    scoreStatus.textContent =
                        "BEST SCORE RETAINED";

                    scoreStatus.style.color =
                        "var(--gold)";

                    scoreStatus.style.background =
                        "rgba(255,209,102,.07)";

                    scoreStatus.style.borderColor =
                        "rgba(255,209,102,.14)";

                    successMessage.textContent =
                        `Your previous best score of ${savedScore.toLocaleString()} is still higher.`;

                } else {

                    scoreStatus.textContent =
                        "SCORE SUBMITTED";

                    scoreStatus.style.color =
                        "var(--green)";

                    scoreStatus.style.background =
                        "rgba(92,255,138,.07)";

                    scoreStatus.style.borderColor =
                        "rgba(92,255,138,.14)";

                    successMessage.textContent =
                        "Your score has been added to the GAMECORE leaderboard.";

                }


                successModal.classList.add(
                    "show"
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


            /* ENABLE BUTTON */

            submitButton.disabled = false;

            submitButton.textContent =
                "SUBMIT SCORE →";

        }

    );

});