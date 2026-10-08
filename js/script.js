/* =====================================================
   CAMPUSFIND
   BASIC FRONTEND INTERACTIONS
   ===================================================== */


/* ================= HERO BUTTONS ================= */

const reportItemBtn =
    document.getElementById("reportItemBtn");

const browseBtn =
    document.getElementById("browseBtn");


reportItemBtn.addEventListener("click", function () {


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

});


registerBtn.addEventListener("click", function () {


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

// =========================================
// REPORT ITEM POPUP
// =========================================

const reportitemBtn =
    document.getElementById("reportItemBtn");

const reportModal =
    document.getElementById("reportModal");

const closeReportModal =
    document.getElementById("closeReportModal");

const cancelReportModal =
    document.getElementById("cancelReportModal");

const reportModalOverlay =
    document.getElementById("reportModalOverlay");


// Open popup
if (reportItemBtn && reportModal) {

    reportItemBtn.addEventListener("click", function () {

        reportModal.classList.add("show");

    });


    // Close popup function
    function closeReportPopup() {

        reportModal.classList.remove("show");

    }


    // Close using X
    if (closeReportModal) {

        closeReportModal.addEventListener(
            "click",
            closeReportPopup
        );

    }


    // Close using Cancel
    if (cancelReportModal) {

        cancelReportModal.addEventListener(
            "click",
            closeReportPopup
        );

    }


    // Close by clicking outside the popup
    if (reportModalOverlay) {

        reportModalOverlay.addEventListener(
            "click",
            closeReportPopup
        );

    }


    // Close using Escape key
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeReportPopup();

        }

    });

}