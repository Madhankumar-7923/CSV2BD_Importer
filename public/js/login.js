/*HIDE UNHIDE PASSWORD*/
const passwordInput = document.getElementById("password");
const unHide = document.getElementById("unhide");

unHide.addEventListener("click", function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        unHide.style.color = "black";
    }

    else {
        passwordInput.type = 'password';
        unHide.style.color = "white";
    }
});