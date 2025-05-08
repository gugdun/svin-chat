// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const db = require("../db");

const views = path.join(__dirname, "..", "views");
const router = express.Router();

router.get("/add", async (req, res) => {
    if (req.user) {
        res.render("layout", {
            child: await ejs.renderFile(path.join(views, "add.ejs"), {
                notFound: req.query.found === "false",
                found: req.query.found === "true",
                exists: req.query.exists === "true"
            })
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/add", async (req, res) => {
    if (req.user) {
        try {
            const user = await db.any("SELECT id FROM users WHERE username = $1", [ req.body.username ]);
            if (!user[0]) {
                res.redirect("/add?found=false");
                return;
            }
            const chat = await db.any("SELECT id FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", [ req.user.id, user[0].id ]);
            if (chat[0]) {
                res.redirect("/add?exists=true");
                return;
            }
            await db.none("INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2)", [ req.user.id, user[0].id ]);
            res.redirect("/add?found=true");
        } catch (err) {
            console.log(err);
            res.redirect("/add");
        }
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
