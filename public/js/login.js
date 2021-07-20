function login() {
    req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log(this.response)
            document.write(this.response)
        }
    };
    let password = document.getElementById("password").value;
    req.open("POST", "/login");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ password: password }));
}