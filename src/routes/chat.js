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
            const messages = await db.any("SELECT username, attachment_id, text, timestamp FROM messages JOIN users ON users.id = user_id WHERE chat_id = $1 ORDER BY messages.timestamp DESC LIMIT 20", [ chat?.id ]);
            const moreMessages = await db.any("SELECT 1 FROM messages WHERE chat_id = $1 AND timestamp < $2", [ chat?.id, messages[messages.length - 1]?.timestamp ]);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    username: req.user.username,
                    title: req.params.chat_id,
                    chatId: chat?.id,
                    empty: messages.length < 1,
                    messages: messages.map((message) => {
                        return {
                            username: message.username,
                            text: message.text,
                            datetime: message.timestamp
                        }
                    }),
                    hasMoreMessages: moreMessages.length > 0,
                    firstTimestamp: messages[messages.length - 1]?.timestamp || new Date().toISOString()
                })
            });
        } catch (err) {
            console.log(err);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    title: req.params.chat_id,
                    empty: true,
                    messages: [],
                    hasMoreMessages: false,
                    firstTimestamp: new Date().toISOString()
                })
            });
        }
    } else {
        res.redirect("/login");
    }
});

router.post("/chat/:chat_id", async (req, res) => {
    if (req.user) {
        try {
            const user = await db.one("SELECT id FROM users WHERE username = $1", [ req.params.chat_id ]);
            const chat = await db.one("SELECT id FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", [ req.user.id, user?.id ]);
            const datetime = new Date().toISOString();
            await db.none("INSERT INTO messages (chat_id, user_id, text, timestamp) VALUES ($1, $2, $3, $4)", [
                chat?.id,
                req.user.id,
                req.body.text,
                datetime
            ]);
            res.json({ success: true });
        } catch (err) {
            console.log(err);
            res.json({ success: false });
        }
    } else {
        res.redirect("/login");
    }
});

router.post("/chat/:chat_id/messages", async (req, res) => {
    if (req.user) {
        try {
            const user = await db.one("SELECT id FROM users WHERE username = $1", [req.params.chat_id]);
            const chat = await db.one("SELECT id FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", [ req.user.id, user?.id ]);
            const firstTimestamp = req.body.timestamp;
            const messages = await db.any("SELECT username, attachment_id, text, timestamp FROM messages JOIN users ON users.id = user_id WHERE chat_id = $1 AND timestamp < $2 ORDER BY messages.timestamp DESC LIMIT 20", [ chat?.id, firstTimestamp ]);
            const moreMessages = await db.any("SELECT 1 FROM messages WHERE chat_id = $1 AND timestamp < $2", [ chat?.id, messages[messages.length - 1]?.timestamp ]);
            res.json({
                messages: messages.map((message) => {
                    return {
                        username: message.username,
                        text: message.text,
                        datetime: message.timestamp
                    }
                }),
                hasMoreMessages: moreMessages.length > 0,
                timestamp: messages[messages.length - 1]?.timestamp || firstTimestamp
            });
        } catch (err) {
            console.log(err);
            res.json({
                messages: [],
                hasMoreMessages: false,
                timestamp: req.body.timestamp
            });
        }
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
