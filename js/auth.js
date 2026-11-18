// =====================================================
// AUTH SYSTEM (SIGNUP & LOGIN)
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // SIGNUP SYSTEM
    // =====================================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username-input")?.value.trim();
            const email = document.getElementById("email-input")?.value.trim();
            const phone = document.getElementById("phone-number-input")?.value.trim();
            const password = document.getElementById("password-input")?.value;
            const repeatPassword = document.getElementById("repeat-password-input")?.value;
            const ic = document.getElementById("IC-input")?.value.trim();

            if (!username || !email || !phone || !password || !repeatPassword || !ic) {
                alert("Please complete all required fields.");
                return;
            }

            if (username.length < 3) {
                alert("Username must contain at least 3 characters.");
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            const phonePattern = /^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/;

            if (!phonePattern.test(phone)) {
                alert("Please enter a valid Malaysian phone number.");
                return;
            }

            if (password.length < 8) {
                alert("Password must contain at least 8 characters.");
                return;
            }

            if (password !== repeatPassword) {
                alert("Passwords do not match.");
                return;
            }

            const icPattern = /^\d{6}-\d{2}-\d{4}$/;

            if (!icPattern.test(ic)) {
                alert("Please enter your IC in this format: 000000-00-0000.");
                return;
            }

            const users = getData("pintuUsers", []);

            const existingEmail = users.some(user =>
                user.email.toLowerCase() === email.toLowerCase()
            );

            const existingUsername = users.some(user =>
                user.username.toLowerCase() === username.toLowerCase()
            );

            if (existingEmail) {
                alert("This email address is already registered.");
                return;
            }

            if (existingUsername) {
                alert("This username is already taken.");
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                username: username,
                email: email,
                phone: phone,
                ic: ic,
                password: password,
                role: "Tenant"
            };

            // Check if this is the first user - make them Admin
            if (users.length === 0) {
                newUser.role = "Admin";
            }

            users.push(newUser);
            saveData("pintuUsers", users);

            const profiles = getData("pintuProfiles", {});

            profiles[newUser.id] = {
                name: username,
                email: email,
                phone: phone,
                role: newUser.role
            };

            saveData("pintuProfiles", profiles);

            alert("Registration successful! Please log in.");

            window.location.href = "login.html";
        });
    }


    // =====================================================
    // LOGIN SYSTEM
    // =====================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername")?.value.trim();
            const password = document.getElementById("loginPassword")?.value;

            if (!username || !password) {
                alert("Please enter your username and password.");
                return;
            }

            const users = getData("pintuUsers", []);

            const matchedUser = users.find(user =>
                (
                    user.username.toLowerCase() === username.toLowerCase() ||
                    user.email.toLowerCase() === username.toLowerCase()
                ) && user.password === password
            );

            if (!matchedUser) {
                alert("Invalid username/email or password.");
                return;
            }

            const profiles = getData("pintuProfiles", {});
            const profile = profiles[matchedUser.id] || {};

            const currentUser = {
                id: matchedUser.id,
                name: profile.name || matchedUser.username,
                username: matchedUser.username,
                email: profile.email || matchedUser.email,
                phone: profile.phone || matchedUser.phone,
                role: profile.role || matchedUser.role || "Tenant"
            };

            saveData("currentUser", currentUser);

            // Compatibility with existing pages
            saveData("savedUsername", currentUser.name);
            saveData("savedEmail", currentUser.email);
            saveData("savedPhone", currentUser.phone);

            alert("Login successful!");

            window.location.href = "dashboard.html";
        });
    }
});
