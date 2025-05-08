// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const db = require("../db");

const views = path.join(__dirname, "..", "views");
const router = express.Router();

router.get("/chat/:chat_id", async (req, res) => {
    if (req.user) {
        try {
            const user = await db.one("SELECT id FROM users WHERE username = $1", [ req.params.chat_id ]);
            const chat = await db.one("SELECT id FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", [ req.user.id, user?.id ]);
            const messages = await db.any("SELECT username, attachment_id, text, timestamp FROM messages JOIN users ON users.id = user_id WHERE chat_id = $1 ORDER BY messages.timestamp DESC", [ chat?.id ]);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    title: req.params.chat_id,
                    empty: messages.length < 1,
                    messages: messages.map((message) => {
                        return {
                            username: message.username,
                            text: message.text,
                            datetime: message.timestamp
                        }
                    })
                })
            });
        } catch (err) {
            console.log(err);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    title: req.params.chat_id,
                    empty: true,
                    messages: []
                })
            });
        }
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
