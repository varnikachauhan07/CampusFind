/* =====================================================
CAMPUSFIND - FRONTEND INTERACTIONS
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


// ================= HERO BUTTONS =================

const reportItemBtn = document.getElementById("reportItemBtn");
const browseBtn = document.getElementById("browseBtn");

const reportModal = document.getElementById("reportModal");
const closeReportModal = document.getElementById("closeReportModal");
const cancelReportModal = document.getElementById("cancelReportModal");
const reportModalOverlay = document.getElementById("reportModalOverlay");

// Open Report Item popup
if (reportItemBtn && reportModal) {
    reportItemBtn.addEventListener("click", function () {
        reportModal.classList.add("show");
    });
}

// Close Report Item popup
function closeReportPopup() {
    if (reportModal) {
        reportModal.classList.remove("show");
    }
}

if (closeReportModal) {
    closeReportModal.addEventListener("click", closeReportPopup);
}

if (cancelReportModal) {
    cancelReportModal.addEventListener("click", closeReportPopup);
}

if (reportModalOverlay) {
    reportModalOverlay.addEventListener("click", closeReportPopup);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeReportPopup();
    }
});


// ================= BROWSE BUTTON =================

if (browseBtn) {
    browseBtn.addEventListener("click", function () {
        const browseSection = document.getElementById("browse");

        if (browseSection) {
            browseSection.scrollIntoView({
                behavior: "smooth"
            });
        } else {
            window.location.href = "browse-items.html";
        }
    });
}


// ================= QUICK ACTION CARDS =================

document.querySelectorAll(".action-card").forEach(function (card) {

    card.addEventListener("click", function () {

        const title = card.querySelector("h3")?.textContent.trim();

        if (title === "Browse Items") {
            window.location.href = "browse-items.html";
        }

        else if (title === "Report Lost Item") {
            window.location.href = "reportitem.html";
        }

        else if (title === "Report Found Item") {
            window.location.href = "reportfound.html";
        }

        else if (title === "Admin Login") {
            window.location.href = "admin-login.html";
        }

    });

});


// ================= LEARN MORE =================

const learnMoreBtn = document.querySelector(".outline-btn");

if (learnMoreBtn) {
    learnMoreBtn.addEventListener("click", function () {
        document.getElementById("how-it-works")?.scrollIntoView({
            behavior: "smooth"
        });
    });
}


// ================= SEARCH =================

const searchIcon = document.querySelector(".search-icon");

if (searchIcon) {
    searchIcon.addEventListener("click", function () {
        window.location.href = "browse-items.html";
    });
}


// ================= NAV ACTIVE STATE =================

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {

        navLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });
});


// ================= NAVBAR LOGIN STATUS =================

const loginNav = document.getElementById("loginNav");
const registerNav = document.getElementById("registerNav");
const profileNav = document.getElementById("profileNav");
const logoutNav = document.getElementById("logoutNav");

function updateNavbar() {

    let user = null;

    try {
        user = JSON.parse(
            sessionStorage.getItem("campusfindUser")
        );
    } catch (error) {
        user = null;
    }

    const isLoggedIn = Boolean(user && user.user_id);

    if (loginNav) loginNav.style.display = isLoggedIn ? "none" : "";
    if (registerNav) registerNav.style.display = isLoggedIn ? "none" : "";
    if (profileNav) profileNav.style.display = isLoggedIn ? "" : "none";
    if (logoutNav) logoutNav.style.display = isLoggedIn ? "" : "none";
}

if (logoutNav) {
    logoutNav.addEventListener("click", function (event) {
        event.preventDefault();

        sessionStorage.removeItem("campusfindUser");
        sessionStorage.removeItem("campusfindToken");

        window.location.href = "index.html";
    });
}

updateNavbar();


});
