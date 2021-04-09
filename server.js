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
        User.findOne({ _id: req.session.userid }, function (err, result) {
            let img = new Image({ "title": req.body.title, "privacy": false, "tags": req.body.tags, "owner": result._id })
            img.save(function (err, image) {
                callback(null, image._id + "." + ext[ext.length - 1]);
            });
        });
    }
});

const upload = multer({
    storage: storage
}).array("photo", 10)

app.set("view engine", "pug");
app.use(express.static("public", { strict: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'I need to sleep', resave: true, saveUninitialized: true }));

//render the index page
app.get('/', function (req, res, next) {
    res.render("pages/index");
    return;
});

//view photo
app.get("/uploads/:id", function (req, res, next) {
    Image.findOne({ _id: req.params.id.split(".")[0] }, function (err1, img) {
        if (err1) {
        }
        if (img.privacy) {
            if (req.session.loggedin) {
                User.findOne({ _id: req.session.userid }, function (err2, usr) {
                    if (err2) {
                        console.log("something could not be found");
                        res.send("Trying to access restricted files");
                    } else if (img.owner.toString() === usr._id.toString()) {
                        res.sendFile(__dirname + "/uploads/" + req.params.id)
                    } else {
                        res.send("Trying to access restricted files")
                    }
                });
            } else {
                res.send("Trying to access restricted files")
            }

        } else {
            res.sendFile(__dirname + "/uploads/" + req.params.id)
        }
    });
});

//render the login page
app.get('/login', function (req, res, next) {
    //if they are not logged in, serve the login page
    if (req.session.loggedin !== true) {
        res.sendFile(__dirname + "/public/login.html");
    } else {
        //if they are logged in, send them a page that just reads that they are logged in
        res.render("pages/messages", { message: "You are already logged in", status: "" });
    }
});

//makes them logout by changing the session login to false
app.get('/logout', function (req, res, next) {
    req.session.loggedin = false;
    req.session.username = ""
    //after logging out take them to the home page
    res.redirect("/");
});

//makes them logout by changing the session login to false
app.get('/search', function (req, res, next) {
    console.log(req.query)
});

//this is used to handle the profile button at the headder
app.get('/profile', function (req, res, next) {
    //this only works if they are logged in
    if (req.session.loggedin) {
        //find the ID of the
        User.findOne({ _id: req.session.userid }, function (err1, result) {
            if (err1) {
                console.log(req.session.userid)
            } else {
                Image.find({ owner: result._id }, { _id: 1, title: 1, tags: 1 }, function (err2, images) {
                    if (err2) {
                        res.status(200).render("pages/profile", { user: result });
                    } else {
                        res.status(200).render("pages/profile", { user: result, images: images });
                    }

                });
            }
        });
    } else {
        //if you are not logged in it shows
        res.render("pages/messages", { message: "You must be logged in to see your profile", status: "" });
    }
});


//returns page with list of users
app.get("/users", function (req, res, next) {
    User.find({ privacy: "false" }, function (err, results) {
        res.status(200).render("pages/users", { users: results });
    });
});

//returns page with user and user information
app.get("/users/:uID", function (req, res, next) {
    User.findOne({ _id: req.params.uID }, function (err, results) {
        if (results) {
            //check if it is the logged in users page
            if (req.session.username === results.username && req.session.loggedin) {
                res.status(200).render("pages/profile", { user: results });
                return;
            }
            //check if the page is private
            else if (results.privacy === true) {
                res.status(403).render("pages/messages", { message: "Do not have permission to view this", status: "Error: 403" });
            } else {
                Image.find({ owner: results._id, privacy: false }, { _id: 1 }, function (err2, images) {
                    if (err2) {
                        res.status(200).render("pages/messages", { message: "Do not have permission to view this", status: "Error: 403" });
                    } else {
                        res.status(200).render("pages/user", { user: results, images: images });
                    }
                });
            }
        } else {
            //if page ID to user does not exist
            res.status(404).render("pages/messages", { message: "ID does not exist", status: "Error: 404" });
        }
    });
});

//finds images with tags, it not tags are returned send all tags
app.get("/publicImages", function (req, res, next) {
    let query = []
    if (req.query.tag){
        if (Array.isArray(req.query.tag)) {
            for (item in req.query.tag){
               
                query.push({tags : { $regex: req.query.tag[item], $options: "$i" } });
            } 
        }else{
            query.push({ tags: { $regex: req.query.tag, $options: "$i"} })
        }
    } else {
        query.push({ tags: { $regex: ".*?" } })
    }
    console.log(query)
    Image.find({ privacy: false, $and: query }, { _id: 1, title: 1 }, function (err2, images) {
        if(err2){
            console.log(err2)
        }
        console.log(images)
        if (images) {
            res.status(200).render("pages/publicImages", { images: images });
        } else {
            res.status(302).render("pages/messages", { message: "Could not find an image with those tags" });
        }
    });

});


//this is used to handle the profile button at the headder
app.get('/profile/:imgId', function (req, res, next) {
    Image.findOne({ _id: req.params.imgId }, { _id: 1, privacy: 1, title: 1, tags: 1, owner: 1 }, function (err2, images) {
        if (err2) {
            res.status(302).render("pages/messages", { message: "Error querying DB" });
        } else if (images === null) {
            res.status(302).render("pages/messages", { message: "Picture is does  not exist" });
        } else {
            if (req.session.loggedin && images.owner == req.session.userid) {
                res.status(200).render("pages/picture", { image: images._id, privacy: images.privacy, title: images.title, tags: images.tags });
            } else if (!images.privacy) {
                res.status(200).render("pages/otherPicture", { image: images._id, title: images.title, tags: images.tags });
            } else {
                res.status(302).render("pages/messages", { message: "Picture is private", status: "" });
            }
        }
    });
});


//this handles privacy changes
app.post('/privChange', function (req, res, next) {
    console.log(req.body.privacy)
    console.log(JSON.parse(req.body.privacy) === true)
    //find the person in the database and change its privacy value
    Image.updateOne({ _id: req.body.id }, {
        privacy: (JSON.parse(req.body.privacy) ? false : true)
    }, () => res.status(200).send());
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
    let username = req.body.username;
    let password = req.body.password;
    //compare the username to the
    User.findOne({ username: username }, function (err, results) {
        if (results) {
            //check if the P/W is correct and log them in if it is
            if (results.password === password) {
                req.session.loggedin = true;
                req.session.userid = results._id;
                //redirect them to the profile page
                res.redirect("/profile");
            } else {
                //if anything is wrong, send them to home page
                res.redirect("/");
            }
        } else {
            //if anything is wrong, send them to home page
            res.redirect("/");
            console.log("incorrect user or pw");
        }
    });
});

//Tries to create a new user account
app.post('/newacc', function (req, res, next) {
    let user = new User({ "username": req.body.username, "password": req.body.password, "privacy": false })
    User.findOne({ username: req.body.username }, function (err, results) {
        if (results) {
            res.render("pages/messages", { message: "Username already exists", status: 200 });
        } else {
            user.save(function (err, usr) {
                res.redirect("/");
            });
        }
    });
});

//handles the deletion of image
app.delete('/deleteImage', function (req, res, next) {
    //find the person in the database and change its privacy value
    Image.findOneAndDelete({ _id: req.body.id, owner: req.userid}, function (err, item) {
        if (err) {

        } else if (item != NULL){
            fs.unlink("uploads/" + req.body.id + ".png", (err) => res.status(200).send());
        }
    });
});

//handles modifies 
app.post('/modifyImageData', function (req, res, next) {
    //find the person in the database and change its privacy value
    console.log(req.body)
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
    app.listen(3000);
    console.log("Server listening on port 3000");
});