let users = ["jack", "Janice"];
let userCount = 0;

const mongoose = require('mongoose');
const User = require("./UserModel");
const Image = require("./imageSchema");


mongoose.connect('mongodb://localhost/imagerepo', { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    mongoose.connection.db.dropDatabase(function(err, result) {
        if (err) {
            console.log("Error dropping database:");
            console.log(err);
            return;
        }
        console.log("Dropped database. Starting re-creation.");

        users.forEach(user => {
            let u = new User();
            u.username = user;
            u.password = user;
            u.privacy = false;
            u.save(function(err, result) {
                if (err) {
                    console.log("Error saving user: " + JSON.stringify(u));
                    console.log(err.message);
                }
                userCount++;
                if (userCount === users.length) {
                    mongoose.connection.close();
                }
            });
        });
    });
});