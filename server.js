//require all the modules
const mongoose = require("mongoose");
const express = require('express');
const Image = require("./imageSchema");
const User = require("./UserModel");
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        let ext = file.mimetype.split('/');
        let img = new Image({ "title": req.body.title, "type": ext[ext.length - 1], "privacy": false, "tags": req.body.tags })
        img.save(function (err, image) {
            callback(null, image._id + "." + ext[ext.length - 1]);
        });
    }
});

const upload = multer({
    storage: storage
}).array("photo", 100)

app.set("view engine", "pug");
app.use(express.static("public", { strict: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'I need to sleep', resave: true, saveUninitialized: true }));

//render the login page
app.get('*', function (req, res, next) {
    //if they are not logged in, serve the login page
    if (req.session.loggedin !== true) {
        res.sendFile(__dirname + "/public/login.html");
    } else {
        next();
    }
});

//render the index page
app.get('/', function (req, res, next) {
    res.redirect("/publicImages");
    return;
});

//view photo
app.get("/uploads/:id", function (req, res, next) {
    Image.findOne({ _id: req.params.id.split(".")[0] }, function (err1, img) {
        if (err1) {
        }
        res.sendFile(__dirname + "/uploads/" + req.params.id)
    });
});

//makes them logout by changing the session login to false
app.get('/logout', function (req, res, next) {
    req.session.loggedin = false;
    req.session.username = ""
    //after logging out take them to the home page
    res.redirect("/");
});


//this is used to handle the profile button at the headder
app.get('/profile', function (req, res, next) {
    //this only works if they are logged in
    if (req.session.loggedin) {
        res.status(200).render("pages/profile")
    }
});

//finds images with tags, it not tags are returned send all tags
app.get("/publicImages", function (req, res, next) {
    let query = []
    if (req.query.tag) {
        if (Array.isArray(req.query.tag)) {
            for (item in req.query.tag) {

                query.push({ tags: { $regex: req.query.tag[item], $options: "$i" } });
            }
        } else {
            query.push({ tags: { $regex: req.query.tag, $options: "$i" } })
        }
    } else {
        query.push({ tags: { $regex: ".*?" } })
    }
    Image.find({ privacy: false, $and: query }, function (err2, images) {
        if (err2) {
            console.log(err2)
        }
        if (images) {
            res.status(200).render("pages/publicImages", { images: images });
        } else {
            res.status(302).render("pages/messages", { message: "Could not find an image with those tags" });
        }
    });

});


//this is used to handle the profile button at the headder
app.get('/profile/:imgId', function (req, res, next) {
    Image.findOne({ _id: req.params.imgId }, { _id: 1, privacy: 1, title: 1, tags: 1, type: 1}, function (err2, images) {
        if (err2) {
            res.status(302).render("pages/messages", { message: "Error querying DB" });
        } else if (images === null) {
            res.status(302).render("pages/messages", { message: "Picture is does  not exist" });
        } else {
            if (req.session.loggedin) {
                res.status(200).render("pages/picture", { image: images._id, privacy: images.privacy, title: images.title, tags: images.tags, type: images.type });
            }
        }
    });
});

//Extracts images
app.post("/uploadImage", function (req, res, next) {
    upload(req, res, function (err) {
        res.redirect("/profile");
        res.end();
    });
});

//handles the login page
app.post('/login', function (req, res, next) {
    let password = req.body.password;
    if (password === "123") {
        req.session.loggedin = true;
        res.redirect("/publicImages");
    }
});

//handles the deletion of image
app.delete('/deleteImage', function (req, res, next) {
    //find the person in the database and change its privacy value
    Image.findOneAndDelete({ _id: req.body.id }, function (err, item) {
        if (err) {
        } else if (item != NULL) {
            fs.unlink("uploads/" + req.body.id + item.type, (err) => res.status(200).send());
        }
    });
});

//handles modifies 
app.post('/modifyImageData', function (req, res, next) {
    //find the person in the database and change its privacy value
    Image.updateOne({ _id: req.body.id }, {
        title: req.body.title,
        tags: req.body.tags
    }, () => res.status(200).send());
});

//Connect to database
mongoose.connect('mongodb://localhost/imagerepo', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    app.listen(80);
    console.log("Server listening on port 80");
});