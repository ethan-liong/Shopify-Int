function search() {
    let searchQ = document.getElementById("searchQ").value;
    searchQ=searchQ.replace(/ /g,'').split(",");
    console.log(searchQ);
    let url = "/publicImages?";
    for (tag in searchQ){
        url = url +"tag="+ searchQ[tag] + "&"
    }
    window.location.href = url;
}