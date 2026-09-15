
const reportItemBtn =
    document.getElementById("reportItemBtn");

const browseBtn =
    document.getElementById("browseBtn");


reportItemBtn.addEventListener("click", function () {

    alert("Report Item page will be available soon.");

});


browseBtn.addEventListener("click", function () {

    document.getElementById("browse").scrollIntoView({
        behavior: "smooth"
    });

});



/* ================= NAV BUTTONS ================= */

const loginBtn =
    document.querySelector(".login-btn");

const registerBtn =
    document.querySelector(".register-btn");


loginBtn.addEventListener("click", function () {

    alert("Login page will be available soon.");

});


registerBtn.addEventListener("click", function () {

    alert("Registration page will be available soon.");

});



/* ================= SEARCH ================= */

const searchIcon =
    document.querySelector(".search-icon");


searchIcon.addEventListener("click", function () {

    alert("Search feature will be available soon.");

});



/* ================= QUICK ACTION CARDS ================= */

const actionCards =
    document.querySelectorAll(".action-card");


actionCards.forEach(function (card) {

    card.addEventListener("click", function () {

        const title =
            card.querySelector("h3").textContent;

        alert(title + " section will be available soon.");

    });

});



/* ================= LEARN MORE ================= */

const learnMoreBtn =
    document.querySelector(".outline-btn");


learnMoreBtn.addEventListener("click", function () {

    document.getElementById("how-it-works").scrollIntoView({
        behavior: "smooth"
    });

});



/* ================= NAV ACTIVE STATE ================= */

const navLinks =
    document.querySelectorAll(".nav-links a");


navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.forEach(function (item) {

            item.classList.remove("active");

        });

        this.classList.add("active");

    });

});
