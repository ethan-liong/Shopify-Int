function changePriv() {
    //create a request that gets the selected privacy values and sends it to server
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            location.reload();
        }
    };
    let id = (document.getElementById("image")).getAttribute("imageId");
    let privacy = (document.getElementById("image")).getAttribute("privacysetting");
    req.open("POST", "/privChange");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ id: id, privacy: privacy }));
}

function deleteImage() {
    //get the image ID
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            window.location = "/profile"
        }
    };
    let id = (document.getElementById("image")).getAttribute("imageId");
    req.open("POST", "/deleteImage");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ id: id}));
}

function changeInfo() {
    //get the image ID
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            window.location = "/profile/"+ id
            console.log(title)
        }
    };
    let id = (document.getElementById("image")).getAttribute("imageId");
    let title = document.getElementById("title").value;
    let tags = document.getElementById("tags").value;
    req.open("POST", "/modifyImageData");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ id: id, title: title, tags: tags}));
}