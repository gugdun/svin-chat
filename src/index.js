// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

var express = require("express");
var app = express();
var longpoll = require("express-longpoll")(app);

require("dotenv").config();
const PORT = process.env.PORT || 5000;

longpoll.create("/poll");

app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
});

var data = { message: "Test" };

longpoll.publish("/poll", data);

setInterval(function () { 
    longpoll.publish("/poll", data);
}, 5000);
