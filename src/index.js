// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const chatRouter = require("./routes/chat");

const PORT = process.env.PORT || 5000;

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
        tableName: "sessions",
        conString: process.env.POSTGRES_CONNECTION,
        createTableIfMissing: true
    })
}));
app.use(passport.authenticate("session"));

const longpoll = require("express-longpoll")(app);
longpoll.create("/poll");

app.use(indexRouter);
app.use(authRouter);
app.use(chatRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = err;
    res.status(err.status || 500);
    res.render('error');
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});

setInterval(function () {
    longpoll.publish("/poll", { message: "Test" });
}, 5000);
