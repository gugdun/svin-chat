// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

var express = require("express");
var ejs = require("ejs");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

var longpoll = require("express-longpoll")(app);
longpoll.create("/poll");

app.get("/", async (req, res) => {
    res.render("layout", { child: await ejs.renderFile("views/home.ejs") });
});

app.get("/login", async (req, res) => {
    res.render("layout", { child: await ejs.renderFile("views/login.ejs") });
});

app.get("/register", async (req, res) => {
    res.render("layout", { child: await ejs.renderFile("views/register.ejs") });
});

app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
});

var data = { message: "Test" };
longpoll.publish("/poll", data);
setInterval(function () { 
    longpoll.publish("/poll", data);
}, 5000);
