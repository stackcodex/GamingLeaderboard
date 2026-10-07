// ===============================
// GLOBAL APPLICATION JAVASCRIPT
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // Add page loading animation
    document.body.classList.add("page-loaded");


    // =========================================
    // HIGHLIGHT CURRENT NAVIGATION ITEM
    // =========================================

    const currentPage =
        window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-links a").forEach(link => {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }

    });


    // =========================================
    // LOGIN / PROFILE NAVIGATION
    // =========================================

    const loginButton =
        document.querySelector(".login-btn");

    if (loginButton) {

        const storedUser =
            localStorage.getItem("gamecoreUser");

        if (storedUser) {

            try {

                const user =
                    JSON.parse(storedUser);

                if (user.loggedIn && user.email) {

                    // Show profile instead of SIGN IN
                    loginButton.textContent =
                        user.username || user.email.split("@")[0];

                    loginButton.href =
                        "profile.html";

                    loginButton.classList.add(
                        "profile-nav-btn"
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to read logged-in user:",
                    error
                );

            }

        }

    }

});