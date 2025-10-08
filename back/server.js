const { sign } = require('crypto');
const express = require('express');
const app = express();

const PORT = 3000;

function sayHi(req, res) {
    res.send("Hello World!");
}

app.get("/", sayHi);
app.post("/api/auth/signup", signUp)

app.listen(PORT, function() {
    console.log(`Server is running on port:${PORT}`);
});

function signUp(req, res) {
    console.log("req:", req);
}