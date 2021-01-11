function login(buttonId) {
    req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log(this.response)
            document.write(this.response)
        }
    };
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (buttonId === "login") {
        req.open("POST", "/login");
    } else if (buttonId === "newacc") {
        req.open("POST", "/newacc");
    }
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ username: username, password: password }));
}