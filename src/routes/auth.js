// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db");

passport.use(new LocalStrategy(async (username, password, cb) => {
    db.one("SELECT * FROM users WHERE username = $1 ", [
        username
    ]).then(data => {
        if (!data) { return cb(null, false, { message: "Incorrect username or password." }); }
        crypto.pbkdf2(password, data.salt, 310000, 32, "sha256", (err, hashedPassword) => {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(data.hashed_password, hashedPassword)) {
                return cb(null, false, { message: "Incorrect username or password." });
            }
            return cb(null, data);
        });
    }).catch(err => {
        return cb(null);
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

const router = express.Router();

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}));

router.post("/register", (req, res, next) => {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256", (err, hashedPassword) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        db.one("INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3) RETURNING id, username", [
            req.body.username,
            hashedPassword,
            salt
        ]).then(data => {
            req.login({
                id: data.id,
                username: data.username
            }, (err) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                res.redirect("/");
            });
        }).catch(err => res.redirect("/register"));
    });
});

router.get("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
