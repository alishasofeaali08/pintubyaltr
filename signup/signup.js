
document.addEventListener("DOMContentLoaded", function () {

    const signupForm = document.querySelector("form");

    const username = document.getElementById("username-input");
    const email = document.getElementById("email-input");
    const phone = document.getElementById("phone-number-input");
    const password = document.getElementById("password-input");
    const repeatPassword = document.getElementById("repeat-password-input");
    const ic = document.getElementById("IC-input");

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();
        const passwordValue = password.value;
        const repeatPasswordValue = repeatPassword.value;
        const icValue = ic.value.trim();

        if (usernameValue.length < 3) {
            alert("Username must contain at least 3 characters.");
            username.focus();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailValue)) {
            alert("Please enter a valid email address.");
            email.focus();
            return;
        }

        const phonePattern = /^(?:\+?60|0)1[0-9]{8,9}$/;

        if (!phonePattern.test(phoneValue.replace(/[\s-]/g, ""))) {
            alert("Please enter a valid Malaysian phone number.");
            phone.focus();
            return;
        }

        if (passwordValue.length < 8) {
            alert("Password must contain at least 8 characters.");
            password.focus();
            return;
        }

        if (passwordValue !== repeatPasswordValue) {
            alert("Passwords do not match!");
            repeatPassword.focus();
            return;
        }

        const icPattern = /^\d{6}-\d{2}-\d{4}$/;

        if (!icPattern.test(icValue)) {
            alert("Please enter your IC in this format: 000000-00-0000");
            ic.focus();
            return;
        }

        alert("Welcome to PINTU, " + usernameValue + "!");

    });

});
