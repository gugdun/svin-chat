// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const db = require("../db");

const views = path.join(__dirname, "..", "views");

const router = express.Router();

router.get("/", async (req, res) => {
    res.render("layout", {
        child: await ejs.renderFile(path.join(views, "home.ejs"))
    });
});

router.get("/login", async (req, res) => {
    res.render("layout", {
        child: await ejs.renderFile(path.join(views, "login.ejs"))
    });
});

router.get("/register", async (req, res) => {
    res.render("layout", {
        child: await ejs.renderFile(path.join(views, "register.ejs"))
    });
});

module.exports = router;
