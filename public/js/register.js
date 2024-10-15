/*HIDE UNHIDE PASSWORD*/
const passwordInput = document.getElementById("cfpassword");
const unHide = document.getElementById("unhide");

unHide.addEventListener("click", function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } 
    
    else {
        passwordInput.type = 'password';
    }
});