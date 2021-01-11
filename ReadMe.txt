Extract everything, use npm install in folder and then run "server.js" 
It listens on port 3000 and there is no index page. / is not a route that gets you anywhere.

Valid requests.
GET: /, /login, /logout, /quiz, /users, /users/:uID
POST: /privChange, /login, 



Notes:
I felt like most of the things were just bassed off of in lecture examples.

1:
I since we needed the headders, I could not use res.send() and more. So I made PUG files
for the error pages and I would send the error message as an object to the PUG file
to be printed out.

2:
If no games are played the score shows up as NAN