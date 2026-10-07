document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:8081/api/auth";


    // =========================================
    // ELEMENTS
    // =========================================

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const createAccountBtn =
        document.getElementById("createAccountBtn");

    const signInBtn =
        document.getElementById("signInBtn");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleRegisterPassword =
        document.getElementById("toggleRegisterPassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");


    // =========================================
    // LOGIN PAGE → CREATE ACCOUNT
    // =========================================

    if (createAccountBtn) {

        createAccountBtn.addEventListener("click", () => {

            window.location.href = "register.html";

        });

    }


    // =========================================
    // REGISTER PAGE → LOGIN
    // =========================================

    if (signInBtn) {

        signInBtn.addEventListener("click", () => {

            window.location.href = "login.html";

        });

    }


    // =========================================
    // LOGIN PASSWORD SHOW/HIDE
    // =========================================

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            const password =
                document.getElementById("password");

            if (!password) return;

            if (password.type === "password") {

                password.type = "text";
                togglePassword.textContent = "HIDE";

            } else {

                password.type = "password";
                togglePassword.textContent = "SHOW";

            }

        });

    }


    // =========================================
    // REGISTER PASSWORD SHOW/HIDE
    // =========================================

    if (toggleRegisterPassword) {

        toggleRegisterPassword.addEventListener("click", () => {

            const password =
                document.getElementById("registerPassword");

            if (!password) return;

            if (password.type === "password") {

                password.type = "text";
                toggleRegisterPassword.textContent = "HIDE";

            } else {

                password.type = "password";
                toggleRegisterPassword.textContent = "SHOW";

            }

        });

    }


    // =========================================
    // CONFIRM PASSWORD SHOW/HIDE
    // =========================================

    if (toggleConfirmPassword) {

        toggleConfirmPassword.addEventListener("click", () => {

            const password =
                document.getElementById("confirmPassword");

            if (!password) return;

            if (password.type === "password") {

                password.type = "text";
                toggleConfirmPassword.textContent = "HIDE";

            } else {

                password.type = "password";
                toggleConfirmPassword.textContent = "SHOW";

            }

        });

    }


    // =========================================
    // LOGIN
    // =========================================

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();


            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;


            if (!email || !password) {

                alert("Please enter email and password.");
                return;

            }


            try {

                const response = await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Invalid email or password."
                    );

                    return;

                }


                // SAVE USER

                const user = {

                    id: result.id,

                    username: result.username,

                    email: result.email,

                    loggedIn: true

                };


                localStorage.setItem(
                    "gamecoreUser",
                    JSON.stringify(user)
                );


                console.log(
                    "Logged in user:",
                    user
                );


                // GO HOME

                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Unable to connect to GAMECORE server."
                );

            }

        });

    }


    // =========================================
    // REGISTER
    // =========================================

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // ---------------------------------
                // GET VALUES
                // ---------------------------------

                const username =
                    document
                        .getElementById("username")
                        .value
                        .trim();


                const email =
                    document
                        .getElementById("registerEmail")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("registerPassword")
                        .value;


                const confirmPassword =
                    document
                        .getElementById("confirmPassword")
                        .value;


                const terms =
                    document
                        .getElementById("terms")
                        .checked;


                // ---------------------------------
                // VALIDATION
                // ---------------------------------

                if (!username || !email || !password) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;

                }


                if (password.length < 6) {

                    alert(
                        "Password must contain at least 6 characters."
                    );

                    return;

                }


                if (password !== confirmPassword) {

                    alert(
                        "Passwords do not match."
                    );

                    return;

                }


                if (!terms) {

                    alert(
                        "Please agree to the GAMECORE terms and conditions."
                    );

                    return;

                }


                // ---------------------------------
                // DISABLE BUTTON
                // ---------------------------------

                const submitButton =
                    registerForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.querySelector("span").textContent =
                        "CREATING ACCOUNT...";

                }


                // ---------------------------------
                // SEND TO BACKEND
                // ---------------------------------

                try {

                    const response =
                        await fetch(
                            `${API_URL}/register`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    username:
                                        username,

                                    email:
                                        email,

                                    password:
                                        password

                                })

                            }
                        );


                    const result =
                        await response.text();


                    // ---------------------------------
                    // ERROR
                    // ---------------------------------

                    if (!response.ok) {

                        alert(
                            result ||
                            "Registration failed."
                        );

                        if (submitButton) {

                            submitButton.disabled = false;

                            submitButton.querySelector("span").textContent =
                                "CREATE ACCOUNT";

                        }

                        return;

                    }


                    // ---------------------------------
                    // SUCCESS
                    // ---------------------------------

                    alert(
                        "Registration successful! Please login."
                    );


                    window.location.href =
                        "login.html";


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    alert(
                        "Unable to connect to GAMECORE server."
                    );


                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.querySelector("span").textContent =
                            "CREATE ACCOUNT";

                    }

                }

            }
        );

    }

});