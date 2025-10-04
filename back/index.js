const express = require('express');
const app = express();

const PORT = 3000;

function sayHi(req, res) {
    res.send("Hello World!");
}

app.get("/", sayHi);

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});