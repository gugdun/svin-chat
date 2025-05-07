// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const db = require("../db");

const views = path.join(__dirname, "..", "views");

const router = express.Router();

router.get("/", async (req, res) => {
    if (req.user) {
        try {
            const chats = await db.any("SELECT * FROM chats WHERE user1_id = $1 or user2_id = $1", [ req.user.id ]);
            const userIds = chats.map((chat) => chat.user1_id == req.user.id ? chat.user2_id : chat.user1_id);
            const users = await db.any("SELECT username FROM users WHERE id IN ($1:csv)", [ userIds ]);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chats.ejs"), {
                    empty: chats.length < 1,
                    chats: users.map((user) => user.username)
                })
            });
        } catch (err) {
            console.log(err);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chats.ejs"), {
                    empty: true,
                    chats: []
                })
            });
        }
    } else {
        res.render("layout", {
            child: await ejs.renderFile(path.join(views, "home.ejs"))
        });
    }
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
