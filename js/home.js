// ===============================
// HOMEPAGE INTERACTIONS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // Small mouse movement effect for hero visual
    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual) {

        heroVisual.addEventListener("mousemove", (event) => {

            const rect = heroVisual.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const moveX = (x - rect.width / 2) / 35;
            const moveY = (y - rect.height / 2) / 35;

            const scoreCard = document.querySelector(".score-card");

            if (scoreCard) {
                scoreCard.style.transform =
                    `perspective(1000px)
                     rotateY(${-8 + moveX}deg)
                     rotateX(${5 - moveY}deg)`;
            }

        });

        heroVisual.addEventListener("mouseleave", () => {

            const scoreCard = document.querySelector(".score-card");

            if (scoreCard) {
                scoreCard.style.transform =
                    "perspective(1000px) rotateY(-8deg) rotateX(5deg)";
            }

        });

    }


    // Simple number count animation
    const numbers = document.querySelectorAll(".stat-card strong");

    numbers.forEach(number => {

        const originalText = number.textContent;

        if (!/^\d+$/.test(originalText)) {
            return;
        }

        const target = parseInt(originalText);

        let current = 0;

        const duration = 800;
        const stepTime = 30;
        const increment = target / (duration / stepTime);

        const counter = setInterval(() => {

            current += increment;

            if (current >= target) {
                current = target;
                clearInterval(counter);
            }

            number.textContent = Math.floor(current);

        }, stepTime);

    });

});