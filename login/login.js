
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.querySelector("form");

    const username = document.getElementById("username-input");
    const password = document.getElementById("password-input");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const usernameValue = username.value.trim();
        const passwordValue = password.value;

        if (usernameValue.length < 3) {
            alert("Please enter a valid username.");
            username.focus();
            return;
        }

        if (passwordValue.length < 8) {
            alert("Password must contain at least 8 characters.");
            password.focus();
            return;
        }

        alert("Welcome back, " + usernameValue + "!");

    });

});
