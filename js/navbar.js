// =====================================================
// NAVBAR SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const navbarPlaceholder = document.getElementById("navbar-placeholder");

    if (navbarPlaceholder) {

        const currentPage = window.location.pathname.split("/").pop();

        if (currentPage !== "login.html" && currentPage !== "signup.html") {

            fetch("navbar.html")
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Unable to load navbar.");
                    }

                    return response.text();
                })
                .then(html => {
                    navbarPlaceholder.innerHTML = html;

                    // Highlight current page
                    const navLinks = navbarPlaceholder.querySelectorAll("a");

                    navLinks.forEach(link => {
                        const linkPage = link.getAttribute("href")?.split("/").pop();

                        if (linkPage === currentPage) {
                            link.classList.add("active");
                        }
                    });

                    // Display current user's name, if navbar has this element
                    const navUsername = navbarPlaceholder.querySelector("#navUsername");
                    const currentUser = getCurrentUser();

                    if (navUsername && currentUser) {
                        navUsername.textContent = currentUser.name || currentUser.username;
                    }

                    // Logout
                    const logoutBtn = navbarPlaceholder.querySelector("#logoutBtn");

                    if (logoutBtn) {
                        logoutBtn.addEventListener("click", function (event) {
                            event.preventDefault();

                            if (confirm("Are you sure you want to log out?")) {
                                localStorage.removeItem("currentUser");
                                window.location.href = "login.html";
                            }
                        });
                    }

                    // Mobile navigation
                    const menuToggle = navbarPlaceholder.querySelector("#menuToggle");
                    const navMenu = navbarPlaceholder.querySelector("#navMenu");

                    if (menuToggle && navMenu) {
                        menuToggle.addEventListener("click", function () {
                            navMenu.classList.toggle("active");
                        });
                    }
                })
                .catch(error => {
                    console.error("Navbar error:", error);
                });
        }
    }


    // =====================================================
    // LOGOUT FALLBACK (for dynamically loaded buttons)
    // =====================================================

    document.addEventListener("click", function (event) {

        const logoutButton = event.target.closest("#logoutBtn");

        if (!logoutButton) return;

        event.preventDefault();

        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        }
    });
});
