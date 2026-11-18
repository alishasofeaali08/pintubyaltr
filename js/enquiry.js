// =====================================================
// ENQUIRY SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const enquiryForm = document.getElementById("enquiryForm");

    if (enquiryForm) {

        const currentUser = getCurrentUser();

        if (currentUser) {

            const nameField = enquiryForm.querySelector('[name="name"]');
            const emailField = enquiryForm.querySelector('[name="email"]');

            const profile = getUserProfile();

            if (nameField && !nameField.value) {
                nameField.value = profile.name || currentUser.username || "";
            }

            if (emailField && !emailField.value) {
                emailField.value = profile.email || currentUser.email || "";
            }
        }

        enquiryForm.addEventListener("submit", function (event) {

            if (!enquiryForm.checkValidity()) {
                return;
            }

            const user = getCurrentUser();

            if (user) {

                const userId = getUserId();

                let claimedTasks = getUserData("pintuTasksByUser", []);

                if (!Array.isArray(claimedTasks)) claimedTasks = [];

                if (!claimedTasks.includes("enquiry")) {

                    claimedTasks.push("enquiry");
                    saveUserData("pintuTasksByUser", claimedTasks);

                    let points = Number(getUserData("pintuPointsByUser", 0)) || 0;

                    points += 20;
                    saveUserData("pintuPointsByUser", points);

                    let activities = getUserData("pintuActivityByUser", []);

                    if (!Array.isArray(activities)) activities = [];

                    activities.unshift({
                        id: Date.now().toString(),
                        description: "Earned 20 points for submitting an enquiry",
                        type: "points",
                        date: new Date().toISOString()
                    });

                    saveUserData("pintuActivityByUser", activities.slice(0, 10));
                }
            }

            const message = document.getElementById("form-message");
            const submitButton = enquiryForm.querySelector('[type="submit"]');

            if (message) {
                showMessage(message, "Submitting your enquiry...", "success");
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

            // Normal form submission continues.
            // Keep your FormSubmit action and method in the HTML.
        });
    }
});
